import { and, eq, isNull, sql } from 'drizzle-orm';

import { db } from '../../../lib/plv8-db.ts';
import { inventoryTable } from '../tables/inventory.ts';

/**
 * Function to upsert inventory quantities for a product in a specific warehouse and location.
 * This function updates the on-hand, reserved, and incoming quantities based on the deltas provided.
 * If no existing record is found, it inserts a new inventory record.
 *
 * @plv8_schema internal
 * @plv8_disable_strict
 * @plv8_volatility volatile
 * @plv8_param {integer} p_product_id
 * @plv8_param {integer} p_stock_unit_id
 * @plv8_param {integer} p_warehouse_id
 * @plv8_param {integer} p_warehouse_location_id
 * @plv8_param {numeric} p_on_hand_delta
 * @plv8_param {numeric} p_reserved_delta
 * @plv8_param {numeric} p_incoming_delta
 * @plv8_param {integer} p_updated_by_id=0
 * @plv8_return {void}
 */
export async function upsert_inventory_quantities(
  p_product_id: number,
  p_stock_unit_id: number | null,
  p_warehouse_id: number,
  p_warehouse_location_id: number | null,
  p_on_hand_delta: number,
  p_reserved_delta: number,
  p_incoming_delta: number,
  p_updated_by_id: number = 0,
): Promise<void> {
  // Log the input parameters
  plv8.elog(
    LoggingLevel.NOTICE,
    `
  Upserting inventory quantities for:
    p_product_id - ${p_product_id},
    p_stock_unit_id - ${p_stock_unit_id},
    p_warehouse_id - ${p_warehouse_id},
    p_warehouse_location_id - ${p_warehouse_location_id},
  Upserting quantity deltas as:
    p_on_hand_delta - ${p_on_hand_delta},
    p_reserved_delta - ${p_reserved_delta},
    p_incoming_delta - ${p_incoming_delta}`,
  );

  // Require product and warehouse IDs to be specified
  if (p_product_id === null) {
    const error_msg = 'A product must be specified: product_id cannot be NULL.';
    if (p_stock_unit_id === null) {
      throw new Error(error_msg);
    } else {
      throw new Error(
        `${error_msg} Please provide a valid product_id along with the stock_unit_id.`,
      );
    }
  }

  if (p_warehouse_id === null) {
    const error_msg =
      'A warehouse must be specified: warehouse_id cannot be NULL.';
    if (p_warehouse_location_id === null) {
      throw new Error(error_msg);
    } else {
      throw new Error(
        `${error_msg} Please provide a valid warehouse_id along with the warehouse_location_id.`,
      );
    }
  }

  // Require at least one of the deltas to be specified
  if (
    p_on_hand_delta === null &&
    p_reserved_delta === null &&
    p_incoming_delta === null
  ) {
    throw new Error(
      'At least one of on_hand_delta, reserved_delta, or incoming_delta must be specified',
    );
  }

  if (
    p_on_hand_delta === 0 &&
    p_reserved_delta === 0 &&
    p_incoming_delta === 0
  ) {
    plv8.elog(
      LoggingLevel.NOTICE,
      'All deltas are zero; no changes will be made to the inventory.',
    );
    return;
  }

  // Build the where condition dynamically
  const whereConditions = [
    eq(inventoryTable.product_id, p_product_id),
    eq(inventoryTable.warehouse_id, p_warehouse_id),
  ];

  // Handle warehouse location condition
  if (p_warehouse_location_id === null) {
    whereConditions.push(isNull(inventoryTable.warehouse_location_id));
  } else {
    whereConditions.push(
      eq(inventoryTable.warehouse_location_id, p_warehouse_location_id),
    );
  }

  // Handle stock unit condition
  if (p_stock_unit_id === null) {
    whereConditions.push(isNull(inventoryTable.stock_unit_id));
  } else {
    whereConditions.push(eq(inventoryTable.stock_unit_id, p_stock_unit_id));
  }

  // Try to update existing record
  const updateResult = await db
    .update(inventoryTable)
    .set({
      on_hand_quantity: sql`GREATEST(${inventoryTable.on_hand_quantity} + ${p_on_hand_delta}, 0)`,
      reserved_quantity: sql`GREATEST(${inventoryTable.reserved_quantity} + ${p_reserved_delta}, 0)`,
      incoming_quantity: sql`GREATEST(${inventoryTable.incoming_quantity} + ${p_incoming_delta}, 0)`,
      last_updated_by_id: p_updated_by_id.toString(),
    })
    .where(and(...whereConditions))
    .returning({ id: inventoryTable.id });

  // If no existing record was updated, insert a new one
  if (updateResult.length === 0) {
    await db.insert(inventoryTable).values({
      product_id: p_product_id,
      stock_unit_id: p_stock_unit_id,
      warehouse_id: p_warehouse_id,
      warehouse_location_id: p_warehouse_location_id,
      on_hand_quantity: Math.max(p_on_hand_delta || 0, 0).toString(),
      reserved_quantity: Math.max(p_reserved_delta || 0, 0).toString(),
      incoming_quantity: Math.max(p_incoming_delta || 0, 0).toString(),
      last_updated_by_id: p_updated_by_id.toString(),
    });
  }

  // Log success
  plv8.elog(
    LoggingLevel.NOTICE,
    `
  Successfully upserted inventory quantities for:
    p_product_id - ${p_product_id},
    p_stock_unit_id - ${p_stock_unit_id},
    p_warehouse_id - ${p_warehouse_id},
    p_warehouse_location_id - ${p_warehouse_location_id},
  Successfully upserted quantity deltas as:
    p_on_hand_delta - ${p_on_hand_delta},
    p_reserved_delta - ${p_reserved_delta},
    p_incoming_delta - ${p_incoming_delta}`,
  );
}
