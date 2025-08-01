import { faker } from '@faker-js/faker';
import { ClientWriteStatus, type TupleKey } from '@openfga/sdk';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import { db } from '../../lib/db.ts';
import fgaClient from '../../lib/openfga.ts';
import {
  OrderLineType,
  OrderState,
  orderLineTable,
  orderTable,
} from '../../schemas/index.ts';
import { appEnvVariables } from '../../utils/env.ts';
import {
  type CurrencyIds,
  clearTables,
  type FoodProducts,
  ORG_FOLDERS,
  type PartnerIds,
  type ProductIds,
  type SeedContext,
} from './utils.ts';

const { FGA_AUTHORIZATION_MODEL_ID } = appEnvVariables;

type SalesOrderIds = {
  S00001: number;
  S00002: number;
  S00003: number;
  S00004: number;
} & {
  [name: string]: number;
};
type SalesOrderLineIds = {
  CHEESEBURGER_VALUE_MEAL: number;
} & {
  [key: string]: number;
};

// region OpenFGA
/**
 * Seeds sales orders with sample data.
 */
async function seedOrderTuples(
  orders: InferSelectModel<typeof orderTable>[],
): Promise<void> {
  console.log('Sales Order Tuples:');

  const orderTuples = orders.map((order) => {
    const tuple: TupleKey = {
      user: ORG_FOLDERS.SALES_ORDERS,
      relation: 'crud_folder',
      object: `order:${order.reference_id}`,
    };
    return tuple;
  });

  const result = await fgaClient?.writeTuples(orderTuples, {
    authorizationModelId: FGA_AUTHORIZATION_MODEL_ID,
  });

  let failedCount = 0;
  result?.writes.forEach((write) => {
    if (write.status === ClientWriteStatus.SUCCESS) return;
    failedCount++;
    console.error(
      `Failed write for tuple ${JSON.stringify(write.tuple_key)}: ${write.err?.message || 'Unknown error'}`,
    );
  });
  if (failedCount > 0)
    console.warn(
      `   Failed to write ${failedCount}/${orderTuples.length} sales order tuples to OpenFGA`,
    );
  else
    console.log(
      `   Successfully wrote ${orderTuples.length} sales order tuples to OpenFGA`,
    );
}
// endregion

// region Database
/**
 * Seeds sales orders and their lines.
 */
async function seedSalesOrders(
  currencyIds: CurrencyIds,
  partnerIds: PartnerIds,
): Promise<SalesOrderIds> {
  console.log('Sales Orders:');

  // Hardcoded sales orders
  const saleOrder1: InferInsertModel<typeof orderTable> = {
    name: 'S00001',
    state: OrderState.SALE,
    currency_id: currencyIds.US,
    partner_id: partnerIds.SG,
    amount_untaxed: '15.47',
    amount_tax: '0.00',
    amount_total: '15.47',
  };
  const saleOrder2: InferInsertModel<typeof orderTable> = {
    name: 'S00002',
    state: OrderState.SALE,
    currency_id: currencyIds.US,
    partner_id: partnerIds.SG,
    amount_untaxed: '13.97',
    amount_tax: '0.00',
    amount_total: '13.97',
  };
  const saleOrder3: InferInsertModel<typeof orderTable> = {
    name: 'S00003',
    state: OrderState.SALE,
    currency_id: currencyIds.US,
    partner_id: partnerIds.SG,
    amount_untaxed: '12.47',
    amount_tax: '0.00',
    amount_total: '12.47',
  };
  const saleOrder4: InferInsertModel<typeof orderTable> = {
    name: 'S00004',
    state: OrderState.SALE,
    currency_id: currencyIds.US,
    partner_id: partnerIds.SG,
    amount_untaxed: '11.98',
    amount_tax: '0.00',
    amount_total: '11.98',
  };
  const hardcodedOrderData = [saleOrder1, saleOrder2, saleOrder3, saleOrder4];

  const hardcodedOrders = await db
    .insert(orderTable)
    .values(hardcodedOrderData)
    .returning();
  if (hardcodedOrders.length !== hardcodedOrderData.length)
    throw new Error(
      `Expected ${hardcodedOrderData.length} sales orders ` +
        `but got ${hardcodedOrders.length} sales orders`,
    );
  console.log(`   Created ${hardcodedOrders.length} sales orders`);

  const orderIds: SalesOrderIds = hardcodedOrders.reduce<SalesOrderIds>(
    (acc, order) => {
      acc[order.name] = order.id;
      return acc;
    },
    {} as SalesOrderIds,
  );

  // Generate random sales orders
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
        name: `S${String(index + 5).padStart(5, '0')}`,
        state: OrderState.SALE,
        currency_id: faker.helpers.objectValue(currencyIds),
        partner_id: faker.helpers.objectValue(partnerIds),
        amount_untaxed: amountUntaxed,
        amount_tax: amountTax,
        amount_total: (Number(amountUntaxed) + Number(amountTax)).toFixed(2),
      };
      return order;
    },
  );

  const orders = await db.insert(orderTable).values(orderData).returning();
  console.log(`   Created ${orders.length} additional sales orders`);
  if (orders.length !== orderData.length)
    console.warn(
      `   Warning: Expected ${orderData.length + 4} sales orders ` +
        `but got ${orders.length + 4} sales orders`,
    );

  await seedOrderTuples([...hardcodedOrders, ...orders]);

  orders.forEach((order) => {
    orderIds[order.name] = order.id;
  });
  return orderIds;
}

/**
 * Seeds sales order items for the given orders and products.
 */
async function seedSalesOrderItems(
  orderIds: SalesOrderIds,
  productIds: ProductIds,
): Promise<SalesOrderLineIds> {
  console.log('Sales Order Items:');

  // Hardcoded sales order items
  // Order 1
  const cheeseburger: InferInsertModel<typeof orderLineTable> = {
    order_id: orderIds.S00001,
    sequence: 1,
    product_id: productIds.CHEESEBURGER,
    description: 'Classic beef patty with cheese, lettuce, tomato',
    type: OrderLineType.PRODUCT,
    quantity: '1',
    unit_price: '8.99',
    price_subtotal: '8.99',
    price_tax: '0.00',
    price_total: '8.99',
  };
  const fries: InferInsertModel<typeof orderLineTable> = {
    order_id: orderIds.S00001,
    sequence: 2,
    product_id: productIds.FRENCH_FRIES,
    description: 'Golden crispy potato fries - salted to perfection',
    type: OrderLineType.PRODUCT,
    quantity: '1',
    unit_price: '3.49',
    price_subtotal: '3.49',
    price_tax: '0.00',
    price_total: '3.49',
  };
  const cocaCola: InferInsertModel<typeof orderLineTable> = {
    order_id: orderIds.S00001,
    sequence: 3,
    product_id: productIds.COCA_COLA,
    description: 'Refreshing cola beverage - 12 oz can',
    type: OrderLineType.PRODUCT,
    quantity: '1',
    unit_price: '2.99',
    price_subtotal: '2.99',
    price_tax: '0.00',
    price_total: '2.99',
  };
  // Order 2
  const chickenSandwich: InferInsertModel<typeof orderLineTable> = {
    order_id: orderIds.S00002,
    sequence: 1,
    product_id: productIds.CHICKEN_SANDWICH,
    description: 'Crispy chicken breast with mayo and pickles',
    type: OrderLineType.PRODUCT,
    quantity: '1',
    unit_price: '7.99',
    price_subtotal: '7.99',
    price_tax: '0.00',
    price_total: '7.99',
  };
  const onionRings: InferInsertModel<typeof orderLineTable> = {
    order_id: orderIds.S00002,
    sequence: 2,
    product_id: productIds.ONION_RINGS,
    description: 'Beer-battered onion rings - crispy and savory',
    type: OrderLineType.PRODUCT,
    quantity: '1',
    unit_price: '4.29',
    price_subtotal: '4.29',
    price_tax: '0.00',
    price_total: '4.29',
  };
  const pepsiCola: InferInsertModel<typeof orderLineTable> = {
    order_id: orderIds.S00002,
    sequence: 3,
    product_id: productIds.PEPSI_COLA,
    description: 'Pepsi cola - bold and refreshing',
    type: OrderLineType.PRODUCT,
    quantity: '1',
    unit_price: '2.99',
    price_subtotal: '2.99',
    price_tax: '0.00',
    price_total: '2.99',
  };
  // Order 3
  const fishSandwich: InferInsertModel<typeof orderLineTable> = {
    order_id: orderIds.S00003,
    sequence: 1,
    product_id: productIds.FISH_SANDWICH,
    description: 'Crispy fish fillet with tartar sauce',
    type: OrderLineType.PRODUCT,
    quantity: '1',
    unit_price: '6.99',
    price_subtotal: '6.99',
    price_tax: '0.00',
    price_total: '6.99',
  };
  const chickenNuggets: InferInsertModel<typeof orderLineTable> = {
    order_id: orderIds.S00003,
    sequence: 2,
    product_id: productIds.CHICKEN_NUGGETS,
    description: '6-piece chicken nuggets - tender and juicy',
    type: OrderLineType.PRODUCT,
    quantity: '1',
    unit_price: '5.99',
    price_subtotal: '5.99',
    price_tax: '0.00',
    price_total: '5.99',
  };
  const sprite: InferInsertModel<typeof orderLineTable> = {
    order_id: orderIds.S00003,
    sequence: 3,
    product_id: productIds.SPRITE,
    description: 'Lemon-lime soda - crisp and clean taste',
    type: OrderLineType.PRODUCT,
    quantity: '1',
    unit_price: '2.99',
    price_subtotal: '2.99',
    price_tax: '0.00',
    price_total: '2.99',
  };
  // Order 4 - Combo
  const comboCheeseburger: InferInsertModel<typeof orderLineTable> = {
    order_id: orderIds.S00004,
    sequence: 1,
    product_id: productIds.CHEESEBURGER_VALUE_MEAL,
    description: 'Cheeseburger, fries, and a drink - perfect combo',
    type: OrderLineType.PRODUCT,
    quantity: '1',
    unit_price: '9.99',
    price_subtotal: '9.99',
    price_tax: '0.00',
    price_total: '9.99',
    parent_order_line_id: null,
    combo_product_id: null,
  };
  const orderItems = [
    cheeseburger,
    fries,
    cocaCola,
    chickenSandwich,
    onionRings,
    pepsiCola,
    fishSandwich,
    chickenNuggets,
    sprite,
    comboCheeseburger,
  ];

  const orderLines = await db
    .insert(orderLineTable)
    .values(orderItems)
    .returning();
  console.log(`   Created ${orderLines.length} sales order lines`);
  if (orderLines.length !== orderItems.length)
    throw new Error(
      `Expected ${orderItems.length} ` +
        `sales order lines but got ${orderLines.length} sales order lines`,
    );

  const orderLineIds: SalesOrderLineIds = orderLines.reduce<SalesOrderLineIds>(
    (acc, line) => {
      const entry = Object.entries(productIds).find(
        ([, value]) => value === line.product_id,
      );
      if (!entry)
        throw new Error(
          `Product ID ${line.product_id} not found in product IDs`,
        );
      acc[entry[0] as FoodProducts] = line.id;
      return acc;
    },
    {} as SalesOrderLineIds,
  );
  return orderLineIds;
}

/**
 * Seeds sales order items for the given orders and products with a parent order line.
 */
async function seedSalesOrderItemsWithParent(
  orderIds: SalesOrderIds,
  productIds: ProductIds,
  parentIds: SalesOrderLineIds,
): Promise<void> {
  console.log('Sales Order Items (with parents):');

  // Hardcoded sales order items
  const cheeseburger: InferInsertModel<typeof orderLineTable> = {
    order_id: orderIds.S00004,
    sequence: 2,
    product_id: productIds.CHEESEBURGER,
    description: 'Classic beef patty with cheese, lettuce, tomato',
    type: OrderLineType.PRODUCT,
    quantity: '1',
    unit_price: '0',
    price_subtotal: '0',
    price_tax: '0.00',
    price_total: '0',
    parent_order_line_id: parentIds.CHEESEBURGER_VALUE_MEAL,
    combo_product_id: null,
  };
  const fries: InferInsertModel<typeof orderLineTable> = {
    order_id: orderIds.S00004,
    sequence: 3,
    product_id: productIds.FRENCH_FRIES,
    description: 'Golden crispy potato fries - salted to perfection',
    type: OrderLineType.PRODUCT,
    quantity: '1',
    unit_price: '0',
    price_subtotal: '0',
    price_tax: '0.00',
    price_total: '0',
    parent_order_line_id: parentIds.CHEESEBURGER_VALUE_MEAL,
    combo_product_id: null,
  };
  const drink: InferInsertModel<typeof orderLineTable> = {
    order_id: orderIds.S00004,
    sequence: 4,
    product_id: productIds.ICED_LATTE,
    description: 'Chilled espresso with milk and ice - refreshing',
    type: OrderLineType.PRODUCT,
    quantity: '1',
    unit_price: '0',
    price_subtotal: '0',
    price_tax: '0.00',
    price_total: '0',
    parent_order_line_id: parentIds.CHEESEBURGER_VALUE_MEAL,
    combo_product_id: null,
  };
  const orderItems = [cheeseburger, fries, drink];

  const orderLines = await db
    .insert(orderLineTable)
    .values(orderItems)
    .returning();
  console.log(`   Created ${orderLines.length} sales order lines`);
  if (orderLines.length !== orderItems.length)
    console.warn(
      `   Warning: Expected ${orderItems.length} ` +
        `sales order lines but got ${orderLines.length} sales order lines`,
    );
}
// endregion

// region Drivers
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

  // Ensure required context is available
  if (!context.currencyIds || !context.partnerIds || !context.productIds)
    throw new Error(
      'Required currency, partner, or product IDs not found for sales data',
    );

  const orderIds = await seedSalesOrders(
    context.currencyIds,
    context.partnerIds,
  );
  const orderItemIds = await seedSalesOrderItems(orderIds, context.productIds);
  await seedSalesOrderItemsWithParent(
    orderIds,
    context.productIds,
    orderItemIds,
  );

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
// endregion
