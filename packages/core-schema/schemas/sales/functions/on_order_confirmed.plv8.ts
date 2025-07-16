import { eq, type InferSelectModel, sql } from 'drizzle-orm';

import { db } from '../../../lib/plv8-db.ts';
import { journalEntryTable } from '../../../schemas/accounting/tables/journal_entry.ts';
import { orderTable } from '../../../schemas/sales/tables/order.ts';

type Order = InferSelectModel<typeof orderTable>;

// TODO: @plv8_param
/**
 * @plv8_schema sales
 * @plv8_trigger
 * @plv8_volatility volatile
 * */
export async function on_order_confirmed(
  NEW: Order,
  OLD: Order,
): Promise<Order> {
  const orders = await db
    .select()
    .from(orderTable)
    .where(eq(orderTable.id, NEW.id));
  plv8.elog(NOTICE, 'Orders found: ', JSON.stringify(orders));

  plv8.elog(NOTICE, 'NEW = ', JSON.stringify(NEW));
  await db.insert(journalEntryTable).values({
    currency_id: NEW.currency_id,
    partner_id: NEW.partner_id,
    contact_id: NEW.contact_id,
    name: `Invoice for Order ${NEW.name}`,
    type: 'Customer Invoice',
    origin: `Order - ${NEW.name}`,
    status: 'Draft',
    description: '',
    journal_id: 1,
    date: sql`now()`,
  });

  return NEW;
}
