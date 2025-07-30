import { sql } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';

import { db } from '../../utils/db.ts';

export type CountryIds = { [name: string]: number };
export type CurrencyIds = { [name: string]: number };

/**
 * Represents the context for seeding resource data.
 */
interface SeedResourceContext {
  countryIds?: CountryIds;
  currencyIds?: CurrencyIds;
  userIds?: number[];
  entityIds?: number[];
  partnerIds?: number[];
  uomIds?: number[];
}

/**
 * Represents the context for seeding accounting data.
 */
interface SeedAccountingContext {
  accountIds?: number[];
  taxIds?: number[];
  taxDistributionLineIds?: number[];
  taxTagIds?: number[];
}

/**
 * Represents the context for seeding product data.
 */
interface SeedProductContext {
  productIds?: number[];
  templateIds?: number[];
  comboIds?: number[];
}

/**
 * Represents the context for seeding stock data.
 */
interface SeedStockContext {
  warehouseIds?: number[];
  warehouseLocationIds?: number[];
  stockOperationTypeIds?: number[];
  stockOperationIds?: number[];
}

/**
 * Represents the context for seeding purchase data.
 */
interface SeedPurchaseContext {
  purchaseRequisitionIds?: number[];
  purchaseQuotationIds?: number[];
}

/**
 * Represents the context for seeding sales data.
 */
interface SeedSalesContext {
  salesOrderIds?: number[];
}

/**
 * Represents the context for seeding all data.
 */
export type SeedContext = SeedResourceContext &
  SeedAccountingContext &
  SeedProductContext &
  SeedStockContext &
  SeedPurchaseContext &
  SeedSalesContext;

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
