import { faker } from '@faker-js/faker';
import type { InferInsertModel } from 'drizzle-orm';

import {
  inventoryTable,
  StockOperationLineStatus,
  StockOperationStatus,
  StockOperationType,
  stockOperationLineTable,
  stockOperationSequenceTable,
  stockOperationTable,
  stockOperationTypeTable,
  warehouseLocationTable,
  warehouseTable,
} from '../../schemas/index.ts';
import { db } from '../../utils/db.ts';
import { clearTables, type SeedContext } from './utils.ts';

const HARDCODED_WAREHOUSE_COUNT = 3;
/**
 * Hardcoded warehouse location data for seeding.
 * This data is used to create various warehouse locations with specific attributes.
 */
const LOCATION_DATA: InferInsertModel<typeof warehouseLocationTable>[] = [
  {
    warehouse_id: 1,
    name: 'Receiving Dock',
    description: 'Primary inbound receiving area',
    capacity: '1000',
    floor: 'Ground',
    section: 'A',
    aisle: '1',
    shelf: 'A1',
    has_refrigeration: false,
    temperature_controlled: false,
  },
  {
    warehouse_id: 1,
    name: 'Cold Storage A',
    description: 'Refrigerated section for perishables',
    capacity: '500',
    floor: '1st',
    section: 'B',
    aisle: '2',
    shelf: 'B2',
    has_refrigeration: true,
    temperature_controlled: true,
  },
  {
    warehouse_id: 1,
    name: 'Overflow Rack',
    description: 'Extra capacity during peak season',
    capacity: '2000',
    floor: 'Mezzanine',
    section: 'C',
    aisle: '3',
    shelf: 'C3',
    has_refrigeration: false,
    temperature_controlled: false,
  },
  {
    warehouse_id: 2,
    name: 'Dry Goods Aisle',
    description: 'Aisle for non-perishables',
    capacity: '1500',
    floor: 'Ground',
    section: 'D',
    aisle: '4',
    shelf: 'D4',
    has_refrigeration: false,
    temperature_controlled: false,
  },
  {
    warehouse_id: 2,
    name: 'Dispatch Zone',
    description: 'Staging area for outgoing goods',
    capacity: '1200',
    floor: 'Ground',
    section: 'E',
    aisle: '5',
    shelf: 'E5',
    has_refrigeration: false,
    temperature_controlled: false,
  },
  {
    warehouse_id: 3,
    name: 'Spare Parts Bay',
    description: 'Section for machinery spares',
    capacity: '800',
    floor: 'Basement',
    section: 'F',
    aisle: '6',
    shelf: 'F6',
    has_refrigeration: false,
    temperature_controlled: false,
  },
  {
    warehouse_id: 3,
    name: 'Hazmat Locker',
    description: 'Secured area for hazardous materials',
    capacity: '300',
    floor: 'Ground',
    section: 'G',
    aisle: '7',
    shelf: 'G7',
    has_refrigeration: false,
    temperature_controlled: true,
  },
];

/**
 * Seeds warehouses with various locations.
 */
async function seedWarehouses(): Promise<number[]> {
  console.log('Warehouses:');

  const warehouseData = Array.from(
    { length: faker.number.int({ min: 5, max: 20 }) },
    () => {
      const warehouse: InferInsertModel<typeof warehouseTable> = {
        name: `${faker.location.city()} Warehouse`,
        code: faker.string.alphanumeric(3).toUpperCase(),
        address: faker.location.streetAddress({ useFullAddress: true }),
      };
      return warehouse;
    },
  );

  const warehouses = await db
    .insert(warehouseTable)
    .values(warehouseData)
    .returning();
  console.log(`   Created ${warehouses.length} warehouses`);
  if (warehouses.length !== warehouseData.length)
    console.warn(
      `   Warning: Expected ${warehouseData.length} warehouses ` +
        `but got ${warehouses.length} warehouses`,
    );

  return warehouses.map((w) => w.id);
}

/**
 * Seeds warehouse locations for each warehouse.
 */
async function seedWarehouseLocations(
  warehouseIds: number[] = [],
): Promise<number[]> {
  if (warehouseIds.length < HARDCODED_WAREHOUSE_COUNT)
    throw new Error('Not enough warehouses available to seed locations');

  console.log('Warehouse Locations:');

  const locations = await db
    .insert(warehouseLocationTable)
    .values(LOCATION_DATA)
    .returning();
  console.log(`   Created ${locations.length} warehouse locations`);
  if (locations.length !== LOCATION_DATA.length)
    console.warn(
      `   Warning: Expected ${LOCATION_DATA.length} locations ` +
        `but got ${locations.length} locations`,
    );

  return locations.map((l) => l.id);
}

/**
 * Seeds stock operation types.
 */
async function seedStockOperationTypes(): Promise<number[]> {
  console.log('Stock Operation Types:');

  const typeData = Object.entries(StockOperationType).map(([name, value]) => {
    const type: InferInsertModel<typeof stockOperationTypeTable> = {
      name: value,
      code: name,
      description: `Operation type for ${name.toLowerCase()}`,
    };
    return type;
  });

  const types = await db
    .insert(stockOperationTypeTable)
    .values(typeData)
    .returning();
  console.log(`   Created ${types.length} stock operation types`);
  if (types.length !== typeData.length)
    console.warn(
      `   Warning: Expected ${typeData.length} types ` +
        `but got ${types.length} types`,
    );

  return types.map((t) => t.id);
}

/**
 * Seeds stock operations with various types and locations.
 */
async function seedStockOperations(
  warehouseIds: number[] = [],
  stockOperationTypeIds: number[] = [],
): Promise<number[]> {
  // Ensure we have enough warehouse and operation type IDs
  if (
    warehouseIds.length < HARDCODED_WAREHOUSE_COUNT ||
    stockOperationTypeIds.length === 0
  )
    throw new Error(
      'Not enough warehouse or stock operation type IDs provided for seeding',
    );

  console.log('Stock Operations:');
  const operationData = Array.from(
    { length: faker.number.int({ min: 30, max: 50 }) },
    () => {
      const [sourceWarehouseId, destWarehouseId] = faker.helpers.arrayElements(
        warehouseIds,
        2,
      );

      const sourceLocations = LOCATION_DATA.filter(
        (loc) => loc.warehouse_id === sourceWarehouseId,
      );
      const destLocations = LOCATION_DATA.filter(
        (loc) => loc.warehouse_id === destWarehouseId,
      );
      const sourceLocation =
        sourceLocations.length > 0
          ? faker.helpers.arrayElement(sourceLocations)
          : null;
      const destLocation =
        destLocations.length > 0
          ? faker.helpers.arrayElement(destLocations)
          : null;

      const sourceLocationId =
        faker.helpers.maybe(
          () =>
            sourceLocation ? LOCATION_DATA.indexOf(sourceLocation) + 1 : null,
          { probability: 0.9 },
        ) ?? null;
      const destinationLocationId =
        faker.helpers.maybe(
          () => (destLocation ? LOCATION_DATA.indexOf(destLocation) + 1 : null),
          { probability: 0.9 },
        ) ?? null;

      // Ensure the selected status is valid
      let status: StockOperationStatus =
        faker.helpers.enumValue(StockOperationStatus);
      while (status === StockOperationStatus.DONE)
        status = faker.helpers.enumValue(StockOperationStatus);

      const operation: InferInsertModel<typeof stockOperationTable> = {
        name: faker.lorem.slug({ min: 3, max: 5 }),
        status,
        type_id: faker.helpers.arrayElement(stockOperationTypeIds),
        source_warehouse_id: sourceWarehouseId,
        source_location_id: sourceLocationId,
        destination_warehouse_id: destWarehouseId,
        destination_location_id: destinationLocationId,
      };
      return operation;
    },
  );

  const uniqueRelations: {
    [x: string]: InferInsertModel<typeof stockOperationTable>;
  } = {};
  operationData.forEach((op) => {
    const {
      type_id,
      source_warehouse_id,
      destination_warehouse_id,
      source_location_id,
      destination_location_id,
    } = op;
    const key = JSON.stringify({
      type_id,
      source_warehouse_id,
      destination_warehouse_id,
      source_location_id,
      destination_location_id,
    });

    if (!uniqueRelations[key]) uniqueRelations[key] = op;
  });

  const operations = await db
    .insert(stockOperationTable)
    .values(Object.values(uniqueRelations))
    .returning();
  console.log(`   Created ${operations.length} stock operations`);
  if (operations.length !== Object.values(uniqueRelations).length)
    console.warn(
      `   Warning: Expected ${Object.values(uniqueRelations).length} operations ` +
        `but got ${operations.length} operations`,
    );

  return operations.map((o) => o.id);
}

/**
 * Seeds stock operation lines for each stock operation.
 */
async function seedStockOperationLines(
  stockOperationIds: number[] = [],
  productIds: number[] = [],
  uomIds: number[] = [],
): Promise<void> {
  // Ensure required IDs are available
  const uomPcId = uomIds[0];
  if (
    stockOperationIds.length === 0 ||
    productIds.length === 0 ||
    uomPcId === undefined
  )
    throw new Error(
      'Not enough stock operation, product, or UOM IDs provided for seeding',
    );

  console.log('Stock Operation Lines:');
  const stockOperationLinesData = Array.from(
    { length: faker.number.int({ min: 100, max: 150 }) },
    () => {
      const status = faker.helpers.enumValue(StockOperationLineStatus);
      const quantity = faker.number.int({ min: 1, max: 100 }).toString();

      // TODO: Populate reference ID with a valid product ID
      const line: InferInsertModel<typeof stockOperationLineTable> = {
        stock_operation_id: faker.helpers.arrayElement(stockOperationIds),
        product_id: faker.helpers.arrayElement(productIds),
        planned_quantity: quantity,
        processed_quantity:
          status === StockOperationLineStatus.COMPLETED
            ? quantity
            : status === StockOperationLineStatus.CANCELLED
              ? '0'
              : undefined,
        quantity_uom_id: uomPcId,
        unit_cost_price: faker.commerce.price({ min: 1, max: 100 }),
        subtotal_cost: faker.commerce.price({ min: 10, max: 1000 }),
        status,
        remarks: { note: faker.lorem.sentence() },
      };
      return line;
    },
  );

  const uniqueRelations: {
    [x: string]: InferInsertModel<typeof stockOperationLineTable>;
  } = {};
  stockOperationLinesData.forEach((line) => {
    const { stock_operation_id, product_id } = line;
    const key = `${stock_operation_id}-${product_id}`;
    if (!uniqueRelations[key]) uniqueRelations[key] = line;
  });

  const stockOperationLines = await db
    .insert(stockOperationLineTable)
    .values(Object.values(uniqueRelations))
    .returning();
  console.log(`   Created ${stockOperationLines.length} stock operation lines`);
  if (stockOperationLines.length !== Object.values(uniqueRelations).length)
    console.warn(
      `   Warning: Expected ${Object.values(uniqueRelations).length} lines ` +
        `but got ${stockOperationLines.length} lines`,
    );
}

/**
 * Seeds stock data including warehouses, locations, operation types, operations, and operation lines.
 *
 * @param context - The seed context containing existing IDs.
 * @returns Updated seed context with new IDs.
 */
export async function seedStockData(
  context: SeedContext,
): Promise<SeedContext> {
  console.log('=== STOCK DATA ===');

  const warehouseIds = await seedWarehouses();
  context.warehouseIds = warehouseIds;

  const warehouseLocationIds = await seedWarehouseLocations(warehouseIds);
  const stockOperationTypeIds = await seedStockOperationTypes();
  context = {
    ...context,
    warehouseLocationIds,
    stockOperationTypeIds,
  };

  const stockOperationIds = await seedStockOperations(
    warehouseIds,
    stockOperationTypeIds,
  );
  context.stockOperationIds = stockOperationIds;

  await seedStockOperationLines(
    stockOperationIds,
    context.productIds,
    context.uomIds,
  );

  console.log('=== STOCK DATA SEEDING COMPLETE ===\n');
  return context;
}

/**
 * Clears all stock-related data from the database.
 *
 * The order of truncation should follow the reverse order of seeding
 * to avoid foreign key constraints.
 */
export async function clearStockData(): Promise<void> {
  console.log('Clearing stock data...');

  await clearTables(
    inventoryTable,
    stockOperationLineTable,
    stockOperationTable,
    stockOperationTypeTable,
    stockOperationSequenceTable,
    warehouseLocationTable,
    warehouseTable,
  );

  console.log('Stock data cleared successfully\n');
}
