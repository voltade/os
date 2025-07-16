import { eq, type InferSelectModel } from 'drizzle-orm';

import { db } from '../../../lib/plv8-db.ts';
import { StockOperationLineStatus, StockOperationType } from '../enums.ts';
import { stockOperationTable } from '../tables/stock_operation.ts';
import { stockOperationLineTable } from '../tables/stock_operation_line.ts';
import type { stockOperationLineItemTable } from '../tables/stock_operation_line_item.ts';
import { stockOperationTypeTable } from '../tables/stock_operation_type.ts';

type StockOperationLineItem = InferSelectModel<
  typeof stockOperationLineItemTable
>;

/**
 * Function to update inventory quantities based on stock operation line item status changes.
 * This function is triggered when a stock operation line item's status changes.
 * It adjusts the inventory quantities for specific stock units in the relevant warehouses and locations.
 *
 * @plv8_schema stock
 * @plv8_disable_strict
 * @plv8_trigger
 * @plv8_volatility volatile
 */
export async function update_inventory_on_line_item_status_change(
  OLD: StockOperationLineItem | null | undefined,
  NEW: StockOperationLineItem,
): Promise<StockOperationLineItem> {
  plv8.elog(
    LoggingLevel.NOTICE,
    `
  Stock operation line item status change triggered:
    line_item_id: ${NEW.id},
    old_status: ${OLD?.status},
    new_status: ${NEW.status},
    stock_unit_id: ${NEW.stock_unit_id},
    line_id: ${NEW.stock_operation_line_id}`,
  );

  // Get the stock operation and line details to determine warehouse and operation type
  const operationResult = await db
    .select({
      type_id: stockOperationTable.type_id,
      destination_warehouse_id: stockOperationTable.destination_warehouse_id,
      destination_location_id: stockOperationTable.destination_location_id,
      source_warehouse_id: stockOperationTable.source_warehouse_id,
      source_location_id: stockOperationTable.source_location_id,
      name: stockOperationTypeTable.name,
      product_id: stockOperationLineTable.product_id,
    })
    .from(stockOperationTable)
    .innerJoin(
      stockOperationTypeTable,
      eq(stockOperationTable.type_id, stockOperationTypeTable.id),
    )
    .innerJoin(
      stockOperationLineTable,
      eq(stockOperationTable.id, stockOperationLineTable.stock_operation_id),
    )
    .where(eq(stockOperationTable.id, NEW.stock_operation_line_id))
    .limit(1);

  if (operationResult.length === 0) {
    plv8.elog(
      LoggingLevel.WARNING,
      `Stock operation or line not found for line_id=${NEW.stock_operation_line_id}`,
    );
    return NEW;
  }

  const operationLineRecord = operationResult[0];
  if (!operationLineRecord) {
    plv8.elog(
      LoggingLevel.WARNING,
      `Invalid operation line record for line_id=${NEW.stock_operation_line_id}`,
    );
    return NEW;
  }

  plv8.elog(
    LoggingLevel.NOTICE,
    `
  Line item operation details:
    type: ${operationLineRecord.name},
    source_warehouse: ${operationLineRecord.source_warehouse_id},
    dest_warehouse: ${operationLineRecord.destination_warehouse_id},
    product_id: ${operationLineRecord.product_id},
    stock_unit_id: ${NEW.stock_unit_id}`,
  );

  // Calculate the quantity change (use processed quantity if available, otherwise planned quantity)
  const quantityDelta = parseInt(
    NEW.processed_quantity ?? NEW.planned_quantity ?? '0',
  );
  plv8.elog(LoggingLevel.NOTICE, `Quantity delta calculated: ${quantityDelta}`);

  // Helper function to safely call upsert_inventory_quantities
  const safeUpsertInventory = (
    warehouseId: number | null,
    locationId: number | null,
    onHandDelta: number,
    reservedDelta: number,
    incomingDelta: number,
  ): void => {
    plv8.execute(
      'SELECT internal.upsert_inventory_quantities($1, $2, $3, $4, $5, $6, $7)',
      [
        operationLineRecord.product_id,
        NEW.stock_unit_id,
        warehouseId,
        locationId,
        onHandDelta,
        reservedDelta,
        incomingDelta,
      ],
    );
  };

  // Handle different status transitions
  // New reservation (Pending -> Reserved OR initial insert with Reserved status)
  if (
    NEW.status === StockOperationLineStatus.RESERVED &&
    (!OLD ||
      OLD.status === null ||
      OLD.status === StockOperationLineStatus.PENDING)
  ) {
    plv8.elog(
      LoggingLevel.NOTICE,
      'Processing reservation for',
      `operation type: ${operationLineRecord.name}`,
    );

    switch (operationLineRecord.name) {
      case StockOperationType.IN:
      case StockOperationType.MO:
      case StockOperationType.RTN:
        // Increase incoming quantity at destination for this specific stock unit
        safeUpsertInventory(
          operationLineRecord.destination_warehouse_id,
          operationLineRecord.destination_location_id,
          0, // on_hand_delta
          0, // reserved_delta
          quantityDelta, // incoming_delta
        );
        break;

      case StockOperationType.OUT:
      case StockOperationType.POS:
        // Reserve quantity at source (move from on-hand to reserved) for this specific stock unit
        safeUpsertInventory(
          operationLineRecord.source_warehouse_id,
          operationLineRecord.source_location_id,
          -quantityDelta, // on_hand_delta
          quantityDelta, // reserved_delta
          0, // incoming_delta
        );
        break;

      case StockOperationType.TRF:
        // Reserve at source and show incoming at destination for this specific stock unit
        safeUpsertInventory(
          operationLineRecord.source_warehouse_id,
          operationLineRecord.source_location_id,
          -quantityDelta, // on_hand_delta
          quantityDelta, // reserved_delta
          0, // incoming_delta
        );
        safeUpsertInventory(
          operationLineRecord.destination_warehouse_id,
          operationLineRecord.destination_location_id,
          0, // on_hand_delta
          0, // reserved_delta
          quantityDelta, // incoming_delta
        );
        break;

      case StockOperationType.RO:
        // For repair operations, handle based on direction
        if (operationLineRecord.source_warehouse_id) {
          // Moving to repair location - reserve at source
          safeUpsertInventory(
            operationLineRecord.source_warehouse_id,
            operationLineRecord.source_location_id,
            -quantityDelta, // on_hand_delta
            quantityDelta, // reserved_delta
            0, // incoming_delta
          );
        }
        if (operationLineRecord.destination_warehouse_id) {
          // Show incoming at repair location
          safeUpsertInventory(
            operationLineRecord.destination_warehouse_id,
            operationLineRecord.destination_location_id,
            0, // on_hand_delta
            0, // reserved_delta
            quantityDelta, // incoming_delta
          );
        }
        break;
    }
  }
  // Completion (any status -> Completed OR initial insert with Completed status)
  else if (
    NEW.status === StockOperationLineStatus.COMPLETED &&
    (!OLD ||
      OLD.status === null ||
      OLD.status !== StockOperationLineStatus.COMPLETED)
  ) {
    plv8.elog(
      LoggingLevel.NOTICE,
      'Processing line item completion for',
      `operation type: ${operationLineRecord.name},`,
      `stock_unit_id=${NEW.stock_unit_id}`,
    );
    switch (operationLineRecord.name) {
      case StockOperationType.IN:
      case StockOperationType.MO:
      case StockOperationType.RTN:
        // Convert incoming to on-hand at destination for this specific stock unit
        safeUpsertInventory(
          operationLineRecord.destination_warehouse_id,
          operationLineRecord.destination_location_id,
          quantityDelta, // on_hand_delta
          0, // reserved_delta
          -quantityDelta, // incoming_delta (remove from incoming)
        );
        break;
      case StockOperationType.OUT:
      case StockOperationType.POS:
        // Remove reserved quantity at source (complete the reduction) for this specific stock unit
        safeUpsertInventory(
          operationLineRecord.source_warehouse_id,
          operationLineRecord.source_location_id,
          0, // on_hand_delta
          -quantityDelta, // reserved_delta (remove reserved)
          0, // incoming_delta
        );
        break;
      case StockOperationType.TRF:
        // Remove reserved at source, convert incoming to on-hand at destination for this specific stock unit
        safeUpsertInventory(
          operationLineRecord.source_warehouse_id,
          operationLineRecord.source_location_id,
          0, // on_hand_delta
          -quantityDelta, // reserved_delta (remove reserved)
          0, // incoming_delta
        );
        safeUpsertInventory(
          operationLineRecord.destination_warehouse_id,
          operationLineRecord.destination_location_id,
          quantityDelta, // on_hand_delta
          0, // reserved_delta
          -quantityDelta, // incoming_delta (remove from incoming)
        );
        break;
      case StockOperationType.RO:
        // Complete repair operation movements for this specific stock unit
        if (operationLineRecord.source_warehouse_id) {
          // Remove reserved at source
          safeUpsertInventory(
            operationLineRecord.source_warehouse_id,
            operationLineRecord.source_location_id,
            0, // on_hand_delta
            -quantityDelta, // reserved_delta (remove reserved)
            0, // incoming_delta
          );
        }
        if (operationLineRecord.destination_warehouse_id) {
          // Convert incoming to on-hand at destination
          safeUpsertInventory(
            operationLineRecord.destination_warehouse_id,
            operationLineRecord.destination_location_id,
            quantityDelta, // on_hand_delta
            0, // reserved_delta
            -quantityDelta, // incoming_delta (remove from incoming)
          );
        }
        break;
    }
  }
  // Cancellation (any status -> Cancelled)
  else if (
    NEW.status === StockOperationLineStatus.CANCELLED &&
    OLD &&
    OLD.status !== null &&
    OLD.status !== StockOperationLineStatus.CANCELLED
  ) {
    plv8.elog(
      LoggingLevel.NOTICE,
      'Processing line item cancellation from',
      `previous status: ${OLD.status},`,
      `stock_unit_id=${NEW.stock_unit_id}`,
    );
    // Reverse the effects of the previous status
    if (OLD.status === StockOperationLineStatus.RESERVED) {
      switch (operationLineRecord.name) {
        case StockOperationType.IN:
        case StockOperationType.MO:
        case StockOperationType.RTN:
          // Remove incoming quantity at destination for this specific stock unit
          safeUpsertInventory(
            operationLineRecord.destination_warehouse_id,
            operationLineRecord.destination_location_id,
            0, // on_hand_delta
            0, // reserved_delta
            -quantityDelta, // incoming_delta
          );
          break;
        case StockOperationType.OUT:
        case StockOperationType.POS:
          // Unreserve at source (move from reserved back to on-hand) for this specific stock unit
          safeUpsertInventory(
            operationLineRecord.source_warehouse_id,
            operationLineRecord.source_location_id,
            quantityDelta, // on_hand_delta
            -quantityDelta, // reserved_delta
            0, // incoming_delta
          );
          break;
        case StockOperationType.TRF:
          // Unreserve at source and remove incoming at destination
          safeUpsertInventory(
            operationLineRecord.source_warehouse_id,
            operationLineRecord.source_location_id,
            quantityDelta, // on_hand_delta
            -quantityDelta, // reserved_delta
            0, // incoming_delta
          );
          safeUpsertInventory(
            operationLineRecord.destination_warehouse_id,
            operationLineRecord.destination_location_id,
            0, // on_hand_delta
            0, // reserved_delta
            -quantityDelta, // incoming_delta
          );
          break;
        case StockOperationType.RO:
          // Reverse repair reservation for this specific stock unit
          if (operationLineRecord.source_warehouse_id) {
            safeUpsertInventory(
              operationLineRecord.source_warehouse_id,
              operationLineRecord.source_location_id,
              quantityDelta, // on_hand_delta
              -quantityDelta, // reserved_delta
              0, // incoming_delta
            );
          }
          if (operationLineRecord.destination_warehouse_id) {
            safeUpsertInventory(
              operationLineRecord.destination_warehouse_id,
              operationLineRecord.destination_location_id,
              0, // on_hand_delta
              0, // reserved_delta
              -quantityDelta, // incoming_delta
            );
          }
          break;
      }
    } else if (OLD.status === StockOperationLineStatus.COMPLETED) {
      // Reverse completion effects for this specific stock unit
      switch (operationLineRecord.name) {
        case StockOperationType.IN:
        case StockOperationType.MO:
        case StockOperationType.RTN:
          // Remove on-hand at destination for this specific stock unit
          safeUpsertInventory(
            operationLineRecord.destination_warehouse_id,
            operationLineRecord.destination_location_id,
            -quantityDelta, // on_hand_delta
            0, // reserved_delta
            0, // incoming_delta
          );
          break;
        case StockOperationType.OUT:
        case StockOperationType.POS:
          // Restore on-hand at source for this specific stock unit
          safeUpsertInventory(
            operationLineRecord.source_warehouse_id,
            operationLineRecord.source_location_id,
            quantityDelta, // on_hand_delta
            0, // reserved_delta
            0, // incoming_delta
          );
          break;
        case StockOperationType.TRF:
          // Restore on-hand at source, remove on-hand at destination for this specific stock unit
          safeUpsertInventory(
            operationLineRecord.source_warehouse_id,
            operationLineRecord.source_location_id,
            quantityDelta, // on_hand_delta
            0, // reserved_delta
            0, // incoming_delta
          );
          safeUpsertInventory(
            operationLineRecord.destination_warehouse_id,
            operationLineRecord.destination_location_id,
            -quantityDelta, // on_hand_delta
            0, // reserved_delta
            0, // incoming_delta
          );
          break;
        case StockOperationType.RO:
          // Reverse repair completion for this specific stock unit
          if (operationLineRecord.source_warehouse_id) {
            safeUpsertInventory(
              operationLineRecord.source_warehouse_id,
              operationLineRecord.source_location_id,
              quantityDelta, // on_hand_delta
              0, // reserved_delta
              0, // incoming_delta
            );
          }
          if (operationLineRecord.destination_warehouse_id) {
            safeUpsertInventory(
              operationLineRecord.destination_warehouse_id,
              operationLineRecord.destination_location_id,
              -quantityDelta, // on_hand_delta
              0, // reserved_delta
              0, // incoming_delta
            );
          }
          break;
      }
    } else {
      plv8.elog(
        LoggingLevel.WARNING,
        `Unhandled status transition from ${OLD.status} to ${NEW.status} for operation type ${operationLineRecord.name}`,
      );
      return NEW;
    }
  } else {
    plv8.elog(
      LoggingLevel.WARNING,
      `Unhandled status transition from ${OLD?.status ?? null} to ${NEW.status} for operation type ${operationLineRecord.name}`,
    );
    return NEW;
  }

  plv8.elog(
    LoggingLevel.NOTICE,
    `
  Stock operation line item status change completed successfully:
    line_item_id=${NEW.id},
    stock_unit_id=${NEW.stock_unit_id}`,
  );
  return NEW;
}
