import { and, eq, type InferSelectModel, sql } from 'drizzle-orm';

import { db } from '../../../lib/plv8-db.ts';
import { StockOperationType } from '../enums.ts';
import type { stockOperationTable } from '../tables/stock_operation.ts';
import { stockOperationSequenceTable } from '../tables/stock_operation_sequence.ts';
import { stockOperationTypeTable } from '../tables/stock_operation_type.ts';
import { warehouseTable } from '../tables/warehouse.ts';

type StockOperation = InferSelectModel<typeof stockOperationTable>;
type Warehouse = InferSelectModel<typeof warehouseTable>;

/**
 * Function to set the reference ID for a stock operation.
 * Generates a unique reference ID based on warehouse code, operation type code, and sequence number.
 *
 * @plv8_schema internal
 * @plv8_trigger
 * @plv8_volatility volatile
 */
export async function set_stock_operation_reference_id(
  NEW: StockOperation,
): Promise<StockOperation> {
  plv8.elog(
    LoggingLevel.NOTICE,
    `
  Setting reference ID for stock operation:
    operation_id: ${NEW.id},
    source_warehouse_id: ${NEW.source_warehouse_id},
    destination_warehouse_id: ${NEW.destination_warehouse_id},
    type_id: ${NEW.type_id}`,
  );

  // Sanity check - ensure either source or destination warehouse is set
  if (
    NEW.source_warehouse_id === null &&
    NEW.destination_warehouse_id === null
  ) {
    throw new Error(
      `Both source_warehouse_id and destination_warehouse_id are null for operation_id=${NEW.id}`,
    );
  }

  let sourceWarehouse: Warehouse | undefined;
  let destinationWarehouse: Warehouse | undefined;

  // Get source warehouse
  if (NEW.source_warehouse_id !== null) {
    const warehouseResult = await db
      .select()
      .from(warehouseTable)
      .where(eq(warehouseTable.id, NEW.source_warehouse_id))
      .limit(1);
    sourceWarehouse = warehouseResult?.[0];

    if (!sourceWarehouse) {
      throw new Error(
        `Warehouse not found with source_warehouse_id=${NEW.source_warehouse_id}`,
      );
    }
  }

  // Get destination warehouse
  if (NEW.destination_warehouse_id !== null) {
    const warehouseResult = await db
      .select()
      .from(warehouseTable)
      .where(eq(warehouseTable.id, NEW.destination_warehouse_id))
      .limit(1);
    destinationWarehouse = warehouseResult?.[0];

    if (!destinationWarehouse) {
      throw new Error(
        `Warehouse not found for destination_warehouse_id=${NEW.destination_warehouse_id}`,
      );
    }
  }

  // Get operation type code
  const operationTypeResult = await db
    .select()
    .from(stockOperationTypeTable)
    .where(eq(stockOperationTypeTable.id, NEW.type_id));
  const operationType = operationTypeResult?.[0];

  if (!operationType) {
    throw new Error(`Operation type not found for type_id=${NEW.type_id}`);
  }

  plv8.elog(
    LoggingLevel.NOTICE,
    `
  Retrieved codes:
    source_warehouse_code=${sourceWarehouse?.code},
    destination_warehouse_code=${destinationWarehouse?.code},
    type_code=${operationType.code}`,
  );

  // Determine warehouse to use
  const warehouseRef =
    operationType.name === StockOperationType.OUT ||
    operationType.name === StockOperationType.POS
      ? sourceWarehouse
      : destinationWarehouse;
  if (!warehouseRef) {
    throw new Error(
      `Warehouse is undefined for operation type ${operationType.name} with type_id=${NEW.type_id}`,
    );
  }

  // Try to update sequence, or insert if not exists
  const updateResult = await db
    .update(stockOperationSequenceTable)
    .set({
      sequence_number: sql`${stockOperationSequenceTable.sequence_number} + 1`,
    })
    .where(
      and(
        eq(stockOperationSequenceTable.warehouse_id, warehouseRef.id),
        eq(stockOperationSequenceTable.type_id, operationType.id),
      ),
    )
    .returning({
      sequence_number: stockOperationSequenceTable.sequence_number,
    });

  let seqNo: number;
  if (updateResult.length === 0) {
    seqNo = 1;
    plv8.elog(
      LoggingLevel.NOTICE,
      `Creating new sequence for warehouse_id=${warehouseRef.id}, type_id=${NEW.type_id}, starting at ${seqNo}`,
    );

    await db.insert(stockOperationSequenceTable).values({
      warehouse_id: warehouseRef.id,
      type_id: NEW.type_id,
      sequence_number: seqNo,
    });
  } else {
    seqNo = updateResult[0]?.sequence_number ?? 1;
    plv8.elog(
      LoggingLevel.NOTICE,
      `Updated existing sequence to ${seqNo} for warehouse_id=${warehouseRef.id}, type_id=${NEW.type_id}`,
    );
  }

  // Generate padded sequence number
  const paddedSeq = seqNo.toString().padStart(5, '0');
  const referenceId = `${warehouseRef.code}/${operationType.code}/${paddedSeq}`;

  plv8.elog(
    LoggingLevel.NOTICE,
    `Generated reference ID: ${referenceId} for stock operation`,
  );

  NEW.reference_id = referenceId;
  return NEW;
}
