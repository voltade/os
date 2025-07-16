import {
  and,
  eq,
  type InferSelectModel,
  inArray,
  isNull,
  lte,
  ne,
  or,
} from 'drizzle-orm';

import { db } from '../../../lib/plv8-db.ts';
import { StockOperationLineStatus } from '../enums.ts';
import type { stockOperationTable } from '../tables/stock_operation.ts';
import { stockOperationLineTable } from '../tables/stock_operation_line.ts';
import { stockOperationLineItemTable } from '../tables/stock_operation_line_item.ts';
import { stockOperationTypeTable } from '../tables/stock_operation_type.ts';

type StockOperation = InferSelectModel<typeof stockOperationTable>;

/**
 * Function to manage stock operation lines based on operation type and status changes.
 * This function is triggered when a stock operation's status changes and provides
 * templates for different operation types to create or update related lines.
 *
 * @plv8_schema internal
 * @plv8_trigger
 * @plv8_volatility volatile
 */
export async function update_stock_operation_lines(
  OLD: StockOperation | undefined,
  NEW: StockOperation,
): Promise<StockOperation> {
  plv8.elog(
    LoggingLevel.NOTICE,
    `
  Stock operation status change triggered:
    operation_id: ${NEW.id},
    old_status: ${OLD?.status},
    new_status: ${NEW.status},
    operation_type_id: ${NEW.type_id}`,
  );

  // Get the operation type name
  const operationTypeResult = await db
    .select({ name: stockOperationTypeTable.name })
    .from(stockOperationTypeTable)
    .where(eq(stockOperationTypeTable.id, NEW.type_id));

  if (operationTypeResult.length === 0) {
    throw new Error(
      `Stock operation type not found for type_id=${NEW.type_id}`,
    );
  }
  const operationTypeName = operationTypeResult[0]?.name;

  plv8.elog(
    LoggingLevel.NOTICE,
    `
  Operation details:
    type: ${operationTypeName},
    name: ${NEW.name},
    source_warehouse: ${NEW.source_warehouse_id},
    dest_warehouse: ${NEW.destination_warehouse_id}`,
  );

  // Handle different status transitions
  if (
    NEW.status === 'Created' &&
    (!OLD || OLD.status === null || OLD.status === 'Draft')
  ) {
    plv8.elog(
      LoggingLevel.NOTICE,
      `Processing operation creation for type: ${operationTypeName}`,
    );

    // Operation type specific validation and setup
    switch (operationTypeName) {
      case 'Import':
        // TODO: Initialize quality control flags
        break;
      case 'Manufacture':
        // TODO: Initialize quality control steps
        break;
      case 'Return':
        // TODO: Initialize inspection flags
        break;
      case 'Export':
        // TODO: Initialize delivery logistics
        break;
      case 'Sale':
        // TODO: Initialize delivery logistics
        break;
      case 'Transfer':
        // TODO: Initialize cross-dock handling
        break;
      case 'Repair':
        // TODO: Initialize parts reservation
        break;
      default:
        plv8.elog(
          LoggingLevel.WARNING,
          `Unknown operation type: ${operationTypeName}`,
        );
    }
  } else if (
    NEW.status === 'Reserved' &&
    (!OLD ||
      OLD.status === null ||
      ['Created', 'Assigned', 'Pending', 'Approved'].includes(OLD.status))
  ) {
    plv8.elog(
      LoggingLevel.NOTICE,
      `Processing operation reservation for type: ${operationTypeName}`,
    );

    // Common validation: Check line quantities
    const invalidLines = await db
      .select({ id: stockOperationLineTable.id })
      .from(stockOperationLineTable)
      .where(
        and(
          eq(stockOperationLineTable.stock_operation_id, NEW.id),
          or(
            isNull(stockOperationLineTable.planned_quantity),
            lte(stockOperationLineTable.planned_quantity, '0'),
          ),
        ),
      );

    if (invalidLines.length > 0) {
      throw new Error(
        'All operation lines must have valid positive planned quantities before reservation',
      );
    }

    // Common action: Update line statuses
    await db
      .update(stockOperationLineTable)
      .set({ status: StockOperationLineStatus.RESERVED })
      .where(
        and(
          eq(stockOperationLineTable.stock_operation_id, NEW.id),
          eq(stockOperationLineTable.status, StockOperationLineStatus.PENDING),
        ),
      );

    // Operation type specific reservation logic
    switch (operationTypeName) {
      case 'Import':
        // TODO: Update supplier delivery schedules
        break;
      case 'Manufacture':
        // TODO: Assign production workers
        break;
      case 'Return':
        // TODO: Notify customer service
        break;
      case 'Export':
        // TODO: Coordinate with logistics partners
        break;
      case 'Sale':
        // TODO: Process payment authorization
        break;
      case 'Transfer':
        // TODO: Coordinate warehouse operations
        break;
      case 'Repair':
        // TODO: Set up diagnostic equipment
        break;
    }
  } else if (NEW.status === 'Processing' && OLD?.status !== 'Processing') {
    plv8.elog(
      LoggingLevel.NOTICE,
      `Processing operation start for type: ${operationTypeName}`,
    );

    // Common validation: Ensure proper prerequisite status
    if (OLD?.status && !['Reserved', 'Approved'].includes(OLD.status)) {
      throw new Error(
        'Operation must be Reserved or Approved before it can be processed',
      );
    }

    // Operation type specific processing logic
    switch (operationTypeName) {
      case 'Import':
        // TODO: Update tracking systems
        break;
      case 'Manufacture':
        // TODO: Update work order status
        break;
      case 'Return':
        // TODO: Update customer records
        break;
      case 'Export':
        // TODO: Update delivery tracking
        break;
      case 'Sale':
        // TODO: Update customer notifications
        break;
      case 'Transfer':
        // TODO: Update logistics tracking
        break;
      case 'Repair':
        // TODO: Update repair tracking
        break;
    }
  } else if (NEW.status === 'Completed' && OLD?.status !== 'Completed') {
    plv8.elog(
      LoggingLevel.NOTICE,
      `Processing operation completion for type: ${operationTypeName}`,
    );

    // Operation type specific completion logic
    switch (operationTypeName) {
      case 'Import':
        // TODO: Generate receiving reports
        break;
      case 'Manufacture':
        // TODO: Generate production reports
        break;
      case 'Return':
        // TODO: Generate return reports
        break;
      case 'Export':
        // TODO: Generate shipping reports
        break;
      case 'Sale':
        // TODO: Generate sales reports
        break;
      case 'Transfer':
        // TODO: Generate transfer reports
        break;
      case 'Repair':
        // TODO: Generate repair reports
        break;
    }
  } else if (NEW.status === 'Cancelled' && OLD?.status !== 'Cancelled') {
    plv8.elog(
      LoggingLevel.NOTICE,
      `Processing operation cancellation for type: ${operationTypeName}`,
    );

    // Get all line IDs for this operation
    const operationLines = await db
      .select({ id: stockOperationLineTable.id })
      .from(stockOperationLineTable)
      .where(eq(stockOperationLineTable.stock_operation_id, NEW.id));

    if (operationLines.length > 0) {
      const lineIds = operationLines.map((line) => line.id);

      // Common actions: Cancel all non-completed line items and lines
      await db
        .update(stockOperationLineItemTable)
        .set({ status: StockOperationLineStatus.CANCELLED })
        .where(
          and(
            inArray(
              stockOperationLineItemTable.stock_operation_line_id,
              lineIds,
            ),
            ne(
              stockOperationLineItemTable.status,
              StockOperationLineStatus.COMPLETED,
            ),
          ),
        );

      await db
        .update(stockOperationLineTable)
        .set({ status: StockOperationLineStatus.CANCELLED })
        .where(
          and(
            eq(stockOperationLineTable.stock_operation_id, NEW.id),
            ne(
              stockOperationLineItemTable.status,
              StockOperationLineStatus.COMPLETED,
            ),
          ),
        );
    }

    // Operation type specific cancellation logic
    switch (operationTypeName) {
      case 'Import':
        // TODO: Reverse any partial receipts
        break;
      case 'Manufacture':
        // TODO: Reverse any partial production
        break;
      case 'Return':
        // TODO: Reverse any partial processing
        break;
      case 'Export':
        // TODO: Reverse any partial shipments
        break;
      case 'Sale':
        // TODO: Notify customer
        break;
      case 'Transfer':
        // TODO: Reverse any partial transfers
        break;
      case 'Repair':
        // TODO: Reverse any partial repairs
        break;
    }
  } else if (NEW.status === 'Done' && OLD?.status !== 'Done') {
    plv8.elog(
      LoggingLevel.NOTICE,
      `Processing operation finalization for type: ${operationTypeName}`,
    );

    // Common validation: Must be completed first
    if (OLD?.status !== 'Completed') {
      throw new Error(
        'Operation must be Completed before it can be marked as Done',
      );
    }

    // Operation type specific finalization logic
    switch (operationTypeName) {
      case 'Import':
        // TODO: Generate compliance reports
        break;
      case 'Manufacture':
        // TODO: Generate quality reports
        break;
      case 'Return':
        // TODO: Generate return analysis reports
        break;
      case 'Export':
        // TODO: Generate export compliance reports
        break;
    }
  } else {
    plv8.elog(
      LoggingLevel.NOTICE,
      `No special handling required for status transition: ${OLD?.status} -> ${NEW.status}`,
    );
  }

  plv8.elog(
    LoggingLevel.NOTICE,
    `
  Stock operation status change completed successfully:
    operation_id: ${NEW.id},
    final_status: ${NEW.status},
    operation_type: ${operationTypeName}`,
  );

  return NEW;
}
