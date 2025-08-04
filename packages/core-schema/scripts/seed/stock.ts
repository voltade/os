import { faker } from '@faker-js/faker';
import { ClientWriteStatus, type TupleKey } from '@openfga/sdk';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import { db } from '../../lib/db.ts';
import fgaClient from '../../lib/openfga.ts';
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
import { appEnvVariables } from '../../utils/env.ts';
import {
  clearTables,
  ORG_FOLDERS,
  ORG_TEAMS,
  type ProductIds,
  type SeedContext,
  type UomIds,
  type WarehouseIds,
  type WarehouseLocationIds,
} from './utils.ts';

const { FGA_AUTHORIZATION_MODEL_ID } = appEnvVariables;

type StockOperationTypeIds = Record<StockOperationType, number>;

// region OpenFGA
/**
 * Seeds the order folder(s) in OpenFGA.
 * This folder is used to aggregate order-related permissions.
 */
async function seedOperationFolders(): Promise<void> {
  console.log('Operation Folders:');

  // TODO: Add more order folders as needed
  const salesOrderFolder: TupleKey = {
    user: ORG_TEAMS.SALES,
    relation: 'owner_team',
    object: ORG_FOLDERS.SALES_ORDERS,
  };
  const purchaseOrderFolder: TupleKey = {
    user: ORG_TEAMS.PURCHASE,
    relation: 'owner_team',
    object: ORG_FOLDERS.PURCHASE_ORDERS,
  };
  const financeSalesOrder: TupleKey = {
    user: ORG_TEAMS.FINANCE,
    relation: 'viewer_team',
    object: ORG_FOLDERS.SALES_ORDERS,
  };
  const financePurchaseOrder: TupleKey = {
    user: ORG_TEAMS.FINANCE,
    relation: 'viewer_team',
    object: ORG_FOLDERS.PURCHASE_ORDERS,
  };
  const orderFolders = [
    salesOrderFolder,
    purchaseOrderFolder,
    financeSalesOrder,
    financePurchaseOrder,
  ];

  // const result = await fgaClient?.writeTuples(orderFolders, {
  //   authorizationModelId: FGA_AUTHORIZATION_MODEL_ID,
  // });

  // let failedCount = 0;
  // result?.writes.forEach((write) => {
  //   if (write.status === ClientWriteStatus.SUCCESS) return;
  //   failedCount++;
  //   console.error(
  //     `Failed write for tuple ${JSON.stringify(write.tuple_key)}: ${write.err?.message || 'Unknown error'}`,
  //   );
  // });

  // if (failedCount > 0)
  //   console.warn(
  //     `   Failed to write ${failedCount}/${orderFolders.length} team-order tuples to OpenFGA`,
  //   );
  // else
  //   console.log(
  //     `   Successfully wrote ${orderFolders.length} team-order tuples to OpenFGA`,
  //   );
}

/**
 * Seeds stock operation tuples in OpenFGA.
 * These tuples are used to manage permissions for stock operations.
 */
async function seedOperationTuples(
  stockOperations: InferSelectModel<typeof stockOperationTable>[],
  stockOperationTypeIds: StockOperationTypeIds,
): Promise<void> {
  console.log('Stock Operation Tuples:');

  // TODO: handle more teams
  const tuples: TupleKey[] = stockOperations
    .filter(
      (op) =>
        op.type_id === stockOperationTypeIds[StockOperationType.IN] ||
        op.type_id === stockOperationTypeIds[StockOperationType.OUT],
    )
    .map((op) => ({
      user:
        op.type_id === stockOperationTypeIds[StockOperationType.IN]
          ? ORG_FOLDERS.PURCHASE_ORDERS
          : ORG_FOLDERS.SALES_ORDERS,
      relation: 'crud_folder',
      object: `order:${op.reference_id}`,
    }));

  if (tuples.length === 0)
    return console.log('   No stock operation tuples to write');

  const result = await fgaClient?.writeTuples(tuples, {
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
      `   Failed to write ${failedCount}/${tuples.length} operation tuples to OpenFGA`,
    );
  else
    console.log(
      `   Successfully wrote ${tuples.length} operation tuples to OpenFGA`,
    );
}
// endregion

// region Database
/**
 * Seeds warehouses with various locations.
 */
async function seedWarehouses(): Promise<WarehouseIds> {
  console.log('Warehouses:');

  // Hardcoded warehouses
  const centralWarehouse: InferInsertModel<typeof warehouseTable> = {
    name: 'Central Warehouse',
    code: 'WH1',
    address: faker.location.streetAddress({ useFullAddress: true }),
  };
  const eastWarehouse: InferInsertModel<typeof warehouseTable> = {
    name: 'East Distribution Center',
    code: 'WH2',
    address: faker.location.streetAddress({ useFullAddress: true }),
  };
  const westWarehouse: InferInsertModel<typeof warehouseTable> = {
    name: 'West Storage',
    code: 'WH3',
    address: faker.location.streetAddress({ useFullAddress: true }),
  };
  const hardcodedWarehouseData = [
    centralWarehouse,
    eastWarehouse,
    westWarehouse,
  ];

  const hardcodedWarehouses = await db
    .insert(warehouseTable)
    .values(hardcodedWarehouseData)
    .returning();
  console.log(`   Created ${hardcodedWarehouses.length} warehouses`);
  if (hardcodedWarehouses.length !== hardcodedWarehouseData.length)
    throw new Error(
      `Expected ${hardcodedWarehouseData.length} warehouses ` +
        `but got ${hardcodedWarehouses.length} warehouses`,
    );

  const warehouseIds: WarehouseIds = {
    // biome-ignore lint/style/noNonNullAssertion: warehouse is guaranteed to exist
    CENTRAL: hardcodedWarehouses.find((w) => w.code === centralWarehouse.code)!
      .id,
    // biome-ignore lint/style/noNonNullAssertion: warehouse is guaranteed to exist
    EAST: hardcodedWarehouses.find((w) => w.code === eastWarehouse.code)!.id,
    // biome-ignore lint/style/noNonNullAssertion: warehouse is guaranteed to exist
    WEST: hardcodedWarehouses.find((w) => w.code === westWarehouse.code)!.id,
  };

  // Generate additional warehouses with random data
  const warehouseData = Array.from(
    { length: faker.number.int({ min: 1, max: 3 }) },
    (_, index) => {
      const warehouse: InferInsertModel<typeof warehouseTable> = {
        name: `${faker.location.city()} Warehouse`,
        code: `WH${index + 4}`,
        address: faker.location.streetAddress({ useFullAddress: true }),
      };
      return warehouse;
    },
  );

  const warehouses = await db
    .insert(warehouseTable)
    .values(warehouseData)
    .returning();
  console.log(`   Created ${warehouses.length} additional warehouses`);
  if (warehouses.length !== warehouseData.length)
    console.warn(
      `   Warning: Expected ${warehouseData.length + 3} warehouses ` +
        `but got ${warehouses.length + 3} warehouses`,
    );

  warehouses.forEach((w) => {
    warehouseIds[w.name.toUpperCase().replace(/\s+/g, '_')] = w.id;
  });
  return warehouseIds;
}

/**
 * Seeds warehouse locations for each warehouse.
 */
async function seedWarehouseLocations(
  warehouseIds: WarehouseIds,
): Promise<WarehouseLocationIds> {
  console.log('Warehouse Locations:');

  // Hardcoded locations for each warehouse
  const receivingDock: InferInsertModel<typeof warehouseLocationTable> = {
    warehouse_id: warehouseIds.CENTRAL,
    name: 'Receiving Dock',
    description: 'Primary inbound receiving area',
    capacity: '1000',
    floor: 'Ground',
    section: 'A',
    aisle: '1',
    shelf: 'A1',
    has_refrigeration: false,
    temperature_controlled: false,
  };
  const coldStorage: InferInsertModel<typeof warehouseLocationTable> = {
    warehouse_id: warehouseIds.CENTRAL,
    name: 'Cold Storage',
    description: 'Refrigerated section for perishables',
    capacity: '500',
    floor: '1st',
    section: 'B',
    aisle: '2',
    shelf: 'B2',
    has_refrigeration: true,
    temperature_controlled: true,
  };
  const overflowRack: InferInsertModel<typeof warehouseLocationTable> = {
    warehouse_id: warehouseIds.CENTRAL,
    name: 'Overflow Rack',
    description: 'Extra capacity during peak season',
    capacity: '2000',
    floor: 'Mezzanine',
    section: 'C',
    aisle: '3',
    shelf: 'C3',
    has_refrigeration: false,
    temperature_controlled: false,
  };
  const dryGoodsAisle: InferInsertModel<typeof warehouseLocationTable> = {
    warehouse_id: warehouseIds.EAST,
    name: 'Dry Goods Aisle',
    description: 'Aisle for non-perishables',
    capacity: '1500',
    floor: 'Ground',
    section: 'D',
    aisle: '4',
    shelf: 'D4',
    has_refrigeration: false,
    temperature_controlled: false,
  };
  const dispatchZone: InferInsertModel<typeof warehouseLocationTable> = {
    warehouse_id: warehouseIds.WEST,
    name: 'Dispatch Zone',
    description: 'Staging area for outgoing goods',
    capacity: '1200',
    floor: 'Ground',
    section: 'E',
    aisle: '5',
    shelf: 'E5',
    has_refrigeration: false,
    temperature_controlled: false,
  };
  const sparePartsBay: InferInsertModel<typeof warehouseLocationTable> = {
    warehouse_id: warehouseIds.WEST,
    name: 'Spare Parts Bay',
    description: 'Section for machinery spares',
    capacity: '800',
    floor: 'Basement',
    section: 'F',
    aisle: '6',
    shelf: 'F6',
    has_refrigeration: false,
    temperature_controlled: false,
  };
  const hazmatLocker: InferInsertModel<typeof warehouseLocationTable> = {
    warehouse_id: warehouseIds.WEST,
    name: 'Hazmat Locker',
    description: 'Secured area for hazardous materials',
    capacity: '300',
    floor: 'Ground',
    section: 'G',
    aisle: '7',
    shelf: 'G7',
    has_refrigeration: false,
    temperature_controlled: true,
  };
  const hardcodedLocationData = [
    receivingDock,
    coldStorage,
    overflowRack,
    dryGoodsAisle,
    dispatchZone,
    sparePartsBay,
    hazmatLocker,
  ];

  const hardcodedLocations = await db
    .insert(warehouseLocationTable)
    .values(hardcodedLocationData)
    .returning();
  console.log(`   Created ${hardcodedLocations.length} warehouse locations`);
  if (hardcodedLocations.length !== hardcodedLocationData.length)
    throw new Error(
      `Expected ${hardcodedLocationData.length} locations ` +
        `but got ${hardcodedLocations.length} locations`,
    );

  const locationIds: WarehouseLocationIds =
    hardcodedLocations.reduce<WarehouseLocationIds>((acc, loc) => {
      acc[loc.warehouse_id] = {
        ...acc[loc.warehouse_id],
        [loc.name.toUpperCase().replace(/\s+/g, '_')]: loc.id,
      };
      return acc;
    }, {} as WarehouseLocationIds);

  // Generate additional locations with random data
  const warehouseLocationData = Array.from(
    { length: faker.number.int({ min: 5, max: 10 }) },
    (_, index) => {
      const warehouseId = faker.helpers.arrayElement(
        Object.values(warehouseIds),
      );
      const section = faker.helpers.arrayElement(['A', 'B', 'C', 'D', 'E']);
      const aisle = faker.helpers.arrayElement(['1', '2', '3', '4', '5']);
      const shelf = section + aisle;

      const location: InferInsertModel<typeof warehouseLocationTable> = {
        warehouse_id: warehouseId,
        name: `Location ${index + 1}`,
        description: faker.lorem.sentence(),
        capacity: faker.number.int({ min: 100, max: 2000 }).toString(),
        floor: faker.helpers.arrayElement(['Ground', '1st', '2nd', '3rd']),
        section,
        aisle,
        shelf,
        has_refrigeration: faker.datatype.boolean(),
        temperature_controlled: faker.datatype.boolean(),
      };
      return location;
    },
  );

  const warehouseLocations = await db
    .insert(warehouseLocationTable)
    .values(warehouseLocationData)
    .returning();
  console.log(`   Created ${warehouseLocations.length} additional locations`);
  if (warehouseLocations.length !== warehouseLocationData.length)
    console.warn(
      `   Warning: Expected ${warehouseLocationData.length + 7} locations ` +
        `but got ${warehouseLocations.length + 7} locations`,
    );

  warehouseLocations.forEach((loc) => {
    const warehouseId = loc.warehouse_id;
    if (!locationIds[warehouseId]) locationIds[warehouseId] = {};
    locationIds[warehouseId][loc.name.toUpperCase().replace(/\s+/g, '_')] =
      loc.id;
  });
  return locationIds;
}

/**
 * Seeds stock operation types.
 */
async function seedStockOperationTypes(): Promise<StockOperationTypeIds> {
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

  const typeIds: StockOperationTypeIds = types.reduce<StockOperationTypeIds>(
    (acc, type) => {
      acc[type.code as StockOperationType] = type.id;
      return acc;
    },
    {} as StockOperationTypeIds,
  );
  return typeIds;
}

/**
 * Seeds stock operations with various types and locations.
 */
async function seedStockOperations(
  warehouseIds: WarehouseIds,
  locationIds: WarehouseLocationIds,
  stockOperationTypeIds: StockOperationTypeIds,
): Promise<number[]> {
  console.log('Stock Operations:');

  const operationData = Array.from(
    { length: faker.number.int({ min: 30, max: 50 }) },
    () => {
      const [sourceWarehouse, sourceWarehouseId] =
        faker.helpers.objectEntry(warehouseIds);
      let [destWarehouse, destWarehouseId] =
        faker.helpers.objectEntry(warehouseIds);
      // Ensure source and destination warehouses are different
      while (destWarehouseId === sourceWarehouseId) {
        [destWarehouse, destWarehouseId] =
          faker.helpers.objectEntry(warehouseIds);
      }

      const sourceLocations = locationIds[sourceWarehouse];
      const sourceLocationId =
        !sourceLocations || sourceLocations.length === 0
          ? null
          : faker.helpers.maybe(
              () => faker.helpers.objectValue(sourceLocations),
              { probability: 0.9 },
            );

      const destLocations = locationIds[destWarehouse];
      const destinationLocationId =
        !destLocations || destLocations.length === 0
          ? null
          : faker.helpers.maybe(
              () => faker.helpers.objectValue(destLocations),
              { probability: 0.9 },
            );

      // Ensure the selected status is valid
      let status: StockOperationStatus =
        faker.helpers.enumValue(StockOperationStatus);
      while (status === StockOperationStatus.DONE)
        status = faker.helpers.enumValue(StockOperationStatus);

      const operation: InferInsertModel<typeof stockOperationTable> = {
        name: faker.lorem.slug({ min: 3, max: 5 }),
        status,
        type_id: faker.helpers.objectValue(stockOperationTypeIds),
        source_warehouse_id: sourceWarehouseId,
        source_location_id: sourceLocationId,
        destination_warehouse_id: destWarehouseId,
        destination_location_id: destinationLocationId,
        started_at: faker.date.past({ years: 5 }),
      };
      return operation;
    },
  );

  const operations = await db
    .insert(stockOperationTable)
    .values(operationData)
    .returning();
  console.log(`   Created ${operations.length} stock operations`);
  if (operations.length !== operationData.length)
    console.warn(
      `   Warning: Expected ${operationData.length} operations ` +
        `but got ${operations.length} operations`,
    );

  await seedOperationTuples(operations, stockOperationTypeIds);
  return operations.map((o) => o.id);
}

/**
 * Seeds stock operation lines for each stock operation.
 */
async function seedStockOperationLines(
  stockOperationIds: number[],
  productIds: ProductIds,
  uomIds: UomIds,
): Promise<void> {
  console.log('Stock Operation Lines:');

  const stockOperationLinesData = Array.from(
    { length: faker.number.int({ min: 100, max: 150 }) },
    () => {
      const status = faker.helpers.enumValue(StockOperationLineStatus);
      const quantity = faker.number.int({ min: 1, max: 100 }).toString();

      // TODO: Populate reference ID with a valid product ID
      const line: InferInsertModel<typeof stockOperationLineTable> = {
        stock_operation_id: faker.helpers.arrayElement(stockOperationIds),
        product_id: faker.helpers.objectValue(productIds),
        planned_quantity: quantity,
        processed_quantity:
          status === StockOperationLineStatus.COMPLETED
            ? quantity
            : status === StockOperationLineStatus.CANCELLED
              ? '0'
              : undefined,
        quantity_uom_id: uomIds.PC,
        unit_cost_price: faker.commerce.price({ min: 1, max: 100 }),
        subtotal_cost: faker.commerce.price({ min: 10, max: 1000 }),
        status,
        remarks: { note: faker.lorem.sentence() },
      };
      return line;
    },
  );

  // Ensure unique stock operation lines by stock operation ID and product ID
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
// endregion

// region Drivers
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

  // Ensure required context is available
  if (!context.productIds || !context.uomIds)
    throw new Error('Required product or UOM IDs not found for stock data');
  // TS will complain once the context variable is overwritten later
  const productIds = context.productIds;
  const uomIds = context.uomIds;

  await seedOperationFolders();

  const warehouseIds = await seedWarehouses();
  const warehouseLocationIds = await seedWarehouseLocations(warehouseIds);
  context = {
    ...context,
    warehouseIds,
    warehouseLocationIds,
  };

  const stockOperationTypeIds = await seedStockOperationTypes();
  const stockOperationIds = await seedStockOperations(
    warehouseIds,
    warehouseLocationIds,
    stockOperationTypeIds,
  );

  await seedStockOperationLines(stockOperationIds, productIds, uomIds);

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
// endregion
