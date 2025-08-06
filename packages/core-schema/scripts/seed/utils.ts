import { sql } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';

import { db } from '../../lib/db.ts';

// region OpenFGA
/**
 * List of organization teams.
 * These teams are used to create tuples in OpenFGA.
 */
export enum ORG_TEAMS {
  PRODUCT = 'team:product',
  SALES = 'team:sales',
  FINANCE = 'team:finance',
  PURCHASE = 'team:purchase',
}

/**
 * List of organization roles.
 * These roles are used to create tuples in OpenFGA.
 */
export enum ORG_ROLES {
  MEMBER = 'member',
  MANAGER = 'manager',
  HEAD = 'head',
}

/**
 * List of organization folders.
 * These folders are used to aggregate object permissions in OpenFGA.
 */
export enum ORG_FOLDERS {
  INVENTORY = 'folder:inventory',
  INVOICES = 'folder:invoices',
  SALES_ORDERS = 'folder:sales_orders',
  PURCHASE_ORDERS = 'folder:purchase_orders',
  QUOTATIONS = 'folder:quotations',
}
// endregion

// region Resource context
export type CountryIds = { SG: number; US: number } & {
  [name: string]: number;
};
export type CurrencyIds = { SG: number; US: number } & {
  [name: string]: number;
};
export type UserIds = Record<
  keyof typeof ORG_TEAMS,
  Record<keyof typeof ORG_ROLES, number[]>
>;
export type EntityIds = { SG: number } & {
  [name: string]: number;
};
export type PartnerIds = { SG: number } & {
  [name: string]: number;
};
export type UomIds = { PC: number } & {
  [name: string]: number;
};

/**
 * Represents the context for seeding resource data.
 */
interface SeedResourceContext {
  countryIds?: CountryIds;
  currencyIds?: CurrencyIds;
  userIds?: UserIds;
  entityIds?: EntityIds;
  partnerIds?: PartnerIds;
  uomIds?: UomIds;
}
// endregion

// region Product context
export enum FoodProducts {
  COCA_COLA = 'Coca Cola',
  PEPSI_COLA = 'Pepsi Cola',
  SPRITE = 'Sprite',
  FRENCH_FRIES = 'French Fries',
  CHICKEN_NUGGETS = 'Chicken Nuggets',
  ONION_RINGS = 'Onion Rings',
  CHEESEBURGER = 'Cheeseburger',
  CHICKEN_SANDWICH = 'Chicken Sandwich',
  FISH_SANDWICH = 'Fish Sandwich',
  APPLE_PIE = 'Apple Pie',
  ICED_LATTE = 'Iced Latte',
  CHEESEBURGER_VALUE_MEAL = 'Cheeseburger Value Meal',
}

export type ProductIds = Record<keyof typeof FoodProducts, number> & {
  [name: string]: number;
};
export type ComboIds = {
  CHEESEBURGER: number;
  FRIES: number;
  DRINK: number;
} & {
  [name: string]: number;
};

/**
 * Represents the context for seeding product data.
 */
interface SeedProductContext {
  productIds?: ProductIds;
  comboIds?: ComboIds;
}
// endregion

// region Stock context
export type WarehouseIds = {
  CENTRAL: number;
  EAST: number;
  WEST: number;
} & {
  [name: string]: number;
};
export type WarehouseLocationIds = {
  CENTRAL: {
    RECEIVING_DOCK: number;
    COLD_STORAGE: number;
    OVERFLOW_RACK: number;
  } & {
    [name: string]: number;
  };
  EAST: {
    DRY_GOODS_AISLE: number;
    DISPATCH_ZONE: number;
  } & {
    [name: string]: number;
  };
  WEST: {
    SPARE_PARTS_BAY: number;
    HAZMAT_LOCKER: number;
  } & {
    [name: string]: number;
  };
} & {
  [name: keyof WarehouseIds]: { [name: string]: number };
};

/**
 * Represents the context for seeding stock data.
 */
interface SeedStockContext {
  warehouseIds?: WarehouseIds;
  warehouseLocationIds?: WarehouseLocationIds;
}
// endregion

// region Education context
export type ClassIds = {
  [key: string]: number;
};
// endregion

/**
 * Represents the context for seeding all data.
 */
export type SeedContext = SeedResourceContext &
  SeedProductContext &
  SeedStockContext & {
    classIds?: ClassIds;
  };

/**
 * Clears the specified tables in the database.
 *
 * @param tables - The tables to clear.
 * @returns A promise that resolves when the tables have been cleared.
 */
export async function clearTables(...tables: PgTable[]): Promise<void> {
  await db.transaction(async (tx) => {
    for (const table of tables) {
      try {
        await tx.execute(sql`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
        console.log(`   Cleared ${table}`);
      } catch (error) {
        console.log(`   Skipped ${table} (${error})`);
      }
    }
  });
}
