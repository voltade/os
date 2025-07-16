import { eq, type InferSelectModel } from 'drizzle-orm';

import { db } from '../../../lib/plv8-db.ts';
import { StockOperationLineStatus, StockOperationType } from '../enums.ts';
import { stockOperationTable } from '../tables/stock_operation.ts';
import type { stockOperationLineTable } from '../tables/stock_operation_line.ts';
import { stockOperationTypeTable } from '../tables/stock_operation_type.ts';

type StockOperationLine = InferSelectModel<typeof stockOperationLineTable>;

/**
 * Function to update inventory quantities based on stock operation line status changes.
 * This function is triggered when a stock operation line's status changes.
 * It adjusts the inventory quantities in the relevant warehouses and locations.
 *
 * @plv8_schema stock
 * @plv8_disable_strict
 * @plv8_trigger
 * @plv8_volatility volatile
 */
export async function update_inventory_on_line_status_change(
  OLD: StockOperationLine | null | undefined,
  NEW: StockOperationLine,
): Promise<StockOperationLine> {
  plv8.elog(
    LoggingLevel.NOTICE,
    `
  Stock operation line status change triggered:
    line_id: ${NEW.id},
    old_status: ${OLD?.status ?? null},
    new_status: ${NEW.status},
    operation_id: ${NEW.stock_operation_id}`,
  );

  // Get the stock operation details to determine warehouse and operation type
  const operationResult = await db
    .select({
      type_id: stockOperationTable.type_id,
      destination_warehouse_id: stockOperationTable.destination_warehouse_id,
      destination_location_id: stockOperationTable.destination_location_id,
      source_warehouse_id: stockOperationTable.source_warehouse_id,
      source_location_id: stockOperationTable.source_location_id,
      name: stockOperationTypeTable.name,
    })
    .from(stockOperationTable)
    .innerJoin(
      stockOperationTypeTable,
      eq(stockOperationTable.type_id, stockOperationTypeTable.id),
    )
    .where(eq(stockOperationTable.id, NEW.stock_operation_id))
    .limit(1);

  if (operationResult.length === 0) {
    plv8.elog(
      LoggingLevel.WARNING,
      `Stock operation not found for operation_id=${NEW.stock_operation_id}`,
    );
    return NEW;
  }

  const operationRecord = operationResult[0];
  if (!operationRecord) {
    plv8.elog(
      LoggingLevel.WARNING,
      `Invalid operation record for operation_id=${NEW.stock_operation_id}`,
    );
    return NEW;
  }

  plv8.elog(
    LoggingLevel.NOTICE,
    `
  Operation details:
    type: ${operationRecord.name},
    source_warehouse: ${operationRecord.source_warehouse_id},
    dest_warehouse: ${operationRecord.destination_warehouse_id},
    product_id: ${NEW.product_id}`,
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
      'SELECT internal.upsert_inventory_quantities($1, NULL, $2, $3, $4, $5, $6)',
      [
        NEW.product_id,
        warehouseId,
        locationId,
        onHandDelta,
        reservedDelta,
        incomingDelta,
      ],
    );
  };

  // Handle different status transitions
  if (
    NEW.status === StockOperationLineStatus.RESERVED &&
    (!OLD ||
      OLD.status === null ||
      OLD.status === StockOperationLineStatus.PENDING)
  ) {
    plv8.elog(
      LoggingLevel.NOTICE,
      'Processing reservation for',
      `operation type: ${operationRecord.name}`,
    );

    switch (operationRecord.name) {
      case StockOperationType.IN:
      case StockOperationType.MO:
      case StockOperationType.RTN:
        // Increase incoming quantity at destination
        safeUpsertInventory(
          operationRecord.destination_warehouse_id,
          operationRecord.destination_location_id,
          0, // on_hand_delta
          0, // reserved_delta
          quantityDelta, // incoming_delta
        );
        break;

      case StockOperationType.OUT:
      case StockOperationType.POS:
        // Reserve quantity at source (move from on-hand to reserved)
        safeUpsertInventory(
          operationRecord.source_warehouse_id,
          operationRecord.source_location_id,
          -quantityDelta, // on_hand_delta
          quantityDelta, // reserved_delta
          0, // incoming_delta
        );
        break;

      case StockOperationType.TRF:
        // Reserve at source and show incoming at destination
        safeUpsertInventory(
          operationRecord.source_warehouse_id,
          operationRecord.source_location_id,
          -quantityDelta, // on_hand_delta
          quantityDelta, // reserved_delta
          0, // incoming_delta
        );
        safeUpsertInventory(
          operationRecord.destination_warehouse_id,
          operationRecord.destination_location_id,
          0, // on_hand_delta
          0, // reserved_delta
          quantityDelta, // incoming_delta
        );
        break;

      case StockOperationType.RO:
        // For repair operations, handle based on direction
        if (operationRecord.source_warehouse_id) {
          // Moving to repair location - reserve at source
          safeUpsertInventory(
            operationRecord.source_warehouse_id,
            operationRecord.source_location_id,
            -quantityDelta, // on_hand_delta
            quantityDelta, // reserved_delta
            0, // incoming_delta
          );
        }
        if (operationRecord.destination_warehouse_id) {
          // Show incoming at repair location
          safeUpsertInventory(
            operationRecord.destination_warehouse_id,
            operationRecord.destination_location_id,
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
      'Processing completion for',
      `operation type: ${operationRecord.name}`,
    );
    switch (operationRecord.name) {
      case StockOperationType.IN:
      case StockOperationType.MO:
      case StockOperationType.RTN:
        // Convert incoming to on-hand at destination
        safeUpsertInventory(
          operationRecord.destination_warehouse_id,
          operationRecord.destination_location_id,
          quantityDelta, // on_hand_delta
          0, // reserved_delta
          -quantityDelta, // incoming_delta (remove from incoming)
        );
        break;
      case StockOperationType.OUT:
      case StockOperationType.POS:
        // Remove reserved quantity at source (complete the reduction)
        safeUpsertInventory(
          operationRecord.source_warehouse_id,
          operationRecord.source_location_id,
          0, // on_hand_delta
          -quantityDelta, // reserved_delta (remove reserved)
          0, // incoming_delta
        );
        break;
      case StockOperationType.TRF:
        // Remove reserved at source, convert incoming to on-hand at destination
        safeUpsertInventory(
          operationRecord.source_warehouse_id,
          operationRecord.source_location_id,
          0, // on_hand_delta
          -quantityDelta, // reserved_delta (remove reserved)
          0, // incoming_delta
        );
        safeUpsertInventory(
          operationRecord.destination_warehouse_id,
          operationRecord.destination_location_id,
          quantityDelta, // on_hand_delta
          0, // reserved_delta
          -quantityDelta, // incoming_delta (remove from incoming)
        );
        break;
      case StockOperationType.RO:
        // Complete repair operation movements
        if (operationRecord.source_warehouse_id) {
          // Remove reserved at source
          safeUpsertInventory(
            operationRecord.source_warehouse_id,
            operationRecord.source_location_id,
            0, // on_hand_delta
            -quantityDelta, // reserved_delta (remove reserved)
            0, // incoming_delta
          );
        }
        if (operationRecord.destination_warehouse_id) {
          // Convert incoming to on-hand at destination
          safeUpsertInventory(
            operationRecord.destination_warehouse_id,
            operationRecord.destination_location_id,
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
    !!OLD &&
    OLD.status !== null &&
    OLD.status !== StockOperationLineStatus.CANCELLED
  ) {
    plv8.elog(
      LoggingLevel.NOTICE,
      'Processing cancellation from',
      `previous status: ${OLD.status}`,
    );
    // Reverse the effects of the previous status
    if (OLD.status === StockOperationLineStatus.RESERVED) {
      switch (operationRecord.name) {
        case StockOperationType.IN:
        case StockOperationType.MO:
        case StockOperationType.RTN:
          // Remove incoming quantity at destination
          safeUpsertInventory(
            operationRecord.destination_warehouse_id,
            operationRecord.destination_location_id,
            0, // on_hand_delta
            0, // reserved_delta
            -quantityDelta, // incoming_delta
          );
          break;
        case StockOperationType.OUT:
        case StockOperationType.POS:
          // Unreserve at source (move from reserved back to on-hand)
          safeUpsertInventory(
            operationRecord.source_warehouse_id,
            operationRecord.source_location_id,
            quantityDelta, // on_hand_delta
            -quantityDelta, // reserved_delta
            0, // incoming_delta
          );
          break;
        case StockOperationType.TRF:
          // Unreserve at source and remove incoming at destination
          safeUpsertInventory(
            operationRecord.source_warehouse_id,
            operationRecord.source_location_id,
            quantityDelta, // on_hand_delta
            -quantityDelta, // reserved_delta
            0, // incoming_delta
          );
          safeUpsertInventory(
            operationRecord.destination_warehouse_id,
            operationRecord.destination_location_id,
            0, // on_hand_delta
            0, // reserved_delta
            -quantityDelta, // incoming_delta
          );
          break;
        case StockOperationType.RO:
          // Reverse repair reservation
          if (operationRecord.source_warehouse_id) {
            safeUpsertInventory(
              operationRecord.source_warehouse_id,
              operationRecord.source_location_id,
              quantityDelta, // on_hand_delta
              -quantityDelta, // reserved_delta
              0, // incoming_delta
            );
          }
          if (operationRecord.destination_warehouse_id) {
            safeUpsertInventory(
              operationRecord.destination_warehouse_id,
              operationRecord.destination_location_id,
              0, // on_hand_delta
              0, // reserved_delta
              -quantityDelta, // incoming_delta
            );
          }
          break;
      }
    } else if (OLD.status === StockOperationLineStatus.COMPLETED) {
      // Reverse completion effects
      switch (operationRecord.name) {
        case StockOperationType.IN:
        case StockOperationType.MO:
        case StockOperationType.RTN:
          // Remove on-hand at destination
          safeUpsertInventory(
            operationRecord.destination_warehouse_id,
            operationRecord.destination_location_id,
            -quantityDelta, // on_hand_delta
            0, // reserved_delta
            0, // incoming_delta
          );
          break;
        case StockOperationType.OUT:
        case StockOperationType.POS:
          // Restore on-hand at source
          safeUpsertInventory(
            operationRecord.source_warehouse_id,
            operationRecord.source_location_id,
            quantityDelta, // on_hand_delta
            0, // reserved_delta
            0, // incoming_delta
          );
          break;
        case StockOperationType.TRF:
          // Restore on-hand at source, remove on-hand at destination
          safeUpsertInventory(
            operationRecord.source_warehouse_id,
            operationRecord.source_location_id,
            quantityDelta, // on_hand_delta
            0, // reserved_delta
            0, // incoming_delta
          );
          safeUpsertInventory(
            operationRecord.destination_warehouse_id,
            operationRecord.destination_location_id,
            -quantityDelta, // on_hand_delta
            0, // reserved_delta
            0, // incoming_delta
          );
          break;
        case StockOperationType.RO:
          // Reverse repair completion
          if (operationRecord.source_warehouse_id) {
            safeUpsertInventory(
              operationRecord.source_warehouse_id,
              operationRecord.source_location_id,
              quantityDelta, // on_hand_delta
              0, // reserved_delta
              0, // incoming_delta
            );
          }
          if (operationRecord.destination_warehouse_id) {
            safeUpsertInventory(
              operationRecord.destination_warehouse_id,
              operationRecord.destination_location_id,
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
        `Unhandled status transition from ${OLD.status} to ${NEW.status} for operation type ${operationRecord.name}`,
      );
      return NEW;
    }
  } else {
    plv8.elog(
      LoggingLevel.WARNING,
      `Unhandled status transition from ${OLD?.status ?? null} to ${NEW.status} for operation type ${operationRecord.name}`,
    );
    return NEW;
  }

  plv8.elog(
    LoggingLevel.NOTICE,
    `
  Stock operation line status change completed successfully:
    line_id=${NEW.id}`,
  );

  return NEW;
}
