#!/usr/bin/env bun

import {
  clearAccountingData,
  clearProductData,
  clearPurchaseData,
  clearRepairData,
  clearResourceData,
  clearSalesData,
  seedAccountingData,
  seedProductData,
  seedPurchaseData,
  seedRepairData,
  seedResourceData,
  seedSalesData,
} from './seed/index.ts';
import { clearStockData, seedStockData } from './seed/stock.ts';
import type { SeedContext } from './seed/utils.ts';

async function clearAllTables(): Promise<void> {
  console.log('=== CLEARING ALL TABLES AND RESETTING SEQUENCES ===');

  // Clear tables in reverse order of seeding
  await clearRepairData();
  await clearSalesData();
  await clearPurchaseData();
  await clearStockData();
  await clearProductData();
  await clearAccountingData();
  await clearResourceData();

  console.log('=== ALL TABLES CLEARED SUCCESSFULLY ===\n');
}

async function seedAllData(): Promise<void> {
  console.log('🌱 UNIFIED DATABASE SEEDING STARTED\n');

  const startTime = Date.now();
  let context: SeedContext = {};

  try {
    context = await seedResourceData(context);
    context = await seedAccountingData(context);
    context = await seedProductData(context);
    context = await seedStockData(context);
    context = await seedPurchaseData(context);
    context = await seedSalesData(context);
    context = await seedRepairData(context);

    const duration = Date.now() - startTime;
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`Duration: ${duration}ms\n`);

    console.log('📊 SUMMARY:');
    console.log(`Countries: ${Object.keys(context.countryIds ?? {}).length}`);
    console.log(`Currencies: ${Object.keys(context.currencyIds ?? {}).length}`);
    console.log(`Users: ${context.userIds?.length ?? 0}`);
    console.log(`Entities: ${context.entityIds?.length ?? 0}`);
    console.log(`Partners: ${context.partnerIds?.length ?? 0}`);
    console.log(`Products: ${context.productIds?.length ?? 0}`);
    console.log(`Templates: ${context.templateIds?.length ?? 0}`);
    console.log(`Sales Orders: ${context.salesOrderIds?.length ?? 0}`);
    console.log(
      `Purchase Requisitions: ${context.purchaseRequisitionIds?.length ?? 0}`,
    );
    console.log(
      `Purchase Quotations: ${context.purchaseQuotationIds?.length ?? 0}`,
    );
    console.log(`Warehouses: ${context.warehouseIds?.length ?? 0}`);
    console.log(
      `Warehouse Locations: ${context.warehouseLocationIds?.length ?? 0}`,
    );
    console.log('');
  } catch (error) {
    console.error('❌ SEEDING FAILED:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  await clearAllTables();
  await seedAllData();
}
