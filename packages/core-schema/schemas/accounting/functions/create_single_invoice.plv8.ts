import { eq, sql } from 'drizzle-orm';

import { db } from '../../../lib/plv8-db.ts';
import { journalEntryTable } from '../../../schemas/accounting/tables/journal_entry.ts';
import { orderTable } from '../../../schemas/sales/tables/order.ts';
import { orderLineTable } from '../../../schemas/sales/tables/order_line.ts';

/**
 * @plv8_schema account
 * @plv8_param {integer} p_order_id
 * @plv8_param {text} p_type
 * @plv8_param {numeric} p_amount
 * @plv8_return {integer}
 * @plv8_volatility volatile
 * */
export async function create_single_invoice(
  p_order_id: number,
  p_type: 'regular' | 'percentage' | 'fixed',
  p_amount: number,
) {
  const orders = await db
    .select()
    .from(orderTable)
    .where(eq(orderTable.id, p_order_id));

  if (!orders[0]) {
    throw new Error(`Order with ID ${p_order_id} not found`);
  }
  const order = orders[0];

  plv8.elog(NOTICE, `Order found: ${JSON.stringify(order)}`);

  const orderLines = await db
    .select()
    .from(orderLineTable)
    .where(eq(orderLineTable.order_id, order.id));

  const contact_id = order.contact_id;
  plv8.elog(NOTICE, `Contact ID: ${contact_id}`);

  const inserted = await db
    .insert(journalEntryTable)
    .values({
      currency_id: order.currency_id,
      partner_id: order.partner_id,
      contact_id: contact_id,
      name: `Invoice for Order ${order.name}`,
      type: 'Customer Invoice',
      origin: `Order - ${order.name}`,
      status: 'Draft',
      description: '',
      journal_id: 1,
      date: sql`now()`,
    })
    .returning();

  plv8.elog(NOTICE, 'After insert');

  return inserted[0];
}
