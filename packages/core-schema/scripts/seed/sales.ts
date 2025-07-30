import { faker } from '@faker-js/faker';
import type { InferInsertModel } from 'drizzle-orm';

import { db } from '../../lib/db.ts';
import {
  OrderLineType,
  OrderState,
  orderLineTable,
  orderTable,
} from '../../schemas/index.ts';
import { type CurrencyIds, clearTables, type SeedContext } from './utils.ts';

/**
 * Seeds sales orders and their lines.
 */
async function seedSalesOrders(
  currencyIds: CurrencyIds = {},
  partnerIds: number[] = [],
): Promise<number[]> {
  // Ensure required IDs are available
  const usdId = currencyIds.USD;
  if (!usdId || partnerIds.length === 0)
    throw new Error(
      'Currency IDs and partner IDs must be provided for sales seeding',
    );

  console.log('Sales Orders:');
  const orderData = Array.from(
    { length: faker.number.int({ min: 10, max: 15 }) },
    (_, index) => {
      const amountUntaxed = faker.commerce.price({
        min: 10,
        max: 100,
        dec: 2,
      });
      const amountTax =
        faker.helpers.maybe(() => (Number(amountUntaxed) * 0.1).toFixed(2), {
          probability: 0.5,
        }) ?? '0.00';

      const order: InferInsertModel<typeof orderTable> = {
        name: `S${String(index + 1).padStart(5, '0')}`,
        state: OrderState.SALE,
        currency_id: usdId,
        partner_id: faker.helpers.arrayElement(partnerIds),
        amount_untaxed: amountUntaxed,
        amount_tax: amountTax,
        amount_total: (Number(amountUntaxed) + Number(amountTax)).toFixed(2),
      };
      return order;
    },
  );

  const orders = await db.insert(orderTable).values(orderData).returning();
  console.log(`   Created ${orders.length} sales orders`);
  if (orders.length !== orderData.length)
    console.warn(
      `   Warning: Expected ${orderData.length} sales orders ` +
        `but got ${orders.length} sales orders`,
    );

  return orders.map((o) => o.id);
}

/**
 * Seeds sales order items for the given orders and products.
 */
async function seedSalesOrderItems(
  orderIds: number[] = [],
  productIds: number[] = [],
  orderItemIds: number[] = [],
): Promise<number[]> {
  // Ensure required IDs are available
  if (orderIds.length === 0 || productIds.length === 0)
    throw new Error('No orders or products to seed sales order items');

  console.log('Sales Order Items:');
  const orderLinesData = Array.from(
    { length: faker.number.int({ min: 30, max: 100 }) },
    (_, index) => {
      const orderItem: InferInsertModel<typeof orderLineTable> = {
        order_id: faker.helpers.arrayElement(orderIds),
        sequence: index + 1,
        product_id: faker.helpers.arrayElement(productIds),
        description: faker.commerce.productDescription(),
        type: OrderLineType.PRODUCT,
        quantity: faker.number.int({ min: 1, max: 5 }).toString(),
        unit_price: faker.commerce.price({ min: 5, max: 50, dec: 2 }),
        price_subtotal: faker.commerce.price({ min: 5, max: 50, dec: 2 }),
        price_tax:
          faker.helpers.maybe(
            () => (Number(faker.commerce.price()) * 0.1).toFixed(2),
            { probability: 0.5 },
          ) ?? '0.00',
        price_total: (
          Number(faker.commerce.price()) +
          Number(faker.commerce.price({ min: 5, max: 50, dec: 2 }))
        ).toFixed(2),
        parent_order_line_id:
          orderItemIds.length > 0
            ? faker.helpers.arrayElement(orderItemIds)
            : null,
      };
      return orderItem;
    },
  );

  const uniqueRelations: {
    [x: string]: InferInsertModel<typeof orderLineTable>;
  } = {};
  orderLinesData.forEach((line) => {
    const { order_id, product_id } = line;
    const key = `${order_id}-${product_id}`;

    if (!uniqueRelations[key]) uniqueRelations[key] = line;
  });

  const orderLines = await db
    .insert(orderLineTable)
    .values(Object.values(uniqueRelations))
    .returning();
  console.log(`   Created ${orderLines.length} sales order lines`);
  if (orderLines.length !== Object.values(uniqueRelations).length)
    console.warn(
      `   Warning: Expected ${Object.values(uniqueRelations).length} ` +
        `sales order lines but got ${orderLines.length} sales order lines`,
    );

  return orderLines.map((l) => l.id);
}

/**
 * Seeds sales data including orders and order lines.
 *
 * @param context - The seed context containing existing IDs.
 * @returns Updated seed context with new IDs.
 */
export async function seedSalesData(
  context: SeedContext,
): Promise<SeedContext> {
  console.log('=== SALES DATA ===');

  const orderIds = await seedSalesOrders(
    context.currencyIds,
    context.partnerIds,
  );
  context.salesOrderIds = orderIds;

  const orderItemIds = await seedSalesOrderItems(orderIds, context.productIds);
  void (await seedSalesOrderItems(
    orderIds,
    context.productIds,
    orderItemIds.slice(-3),
  ));

  console.log('=== SALES DATA SEEDING COMPLETED ===\n');
  return context;
}

/**
 * Clears all sales-related data from the database.
 *
 * The order of truncation should follow the reverse order of seeding
 * to avoid foreign key constraints.
 */
export async function clearSalesData(): Promise<void> {
  console.log('Clearing sales data...');
  await clearTables(orderLineTable, orderTable);
  console.log('Sales data cleared successfully.\n');
}
