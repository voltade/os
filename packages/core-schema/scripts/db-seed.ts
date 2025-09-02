#!/usr/bin/env bun

import { faker } from '@faker-js/faker';

import {
  clearAccountingData,
  clearEducationData,
  clearProductData,
  clearPurchaseData,
  clearRepairData,
  clearResourceData,
  clearSalesData,
  seedAccountingData,
  seedEducationData,
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
  await clearEducationData();
  await clearRepairData();
  await clearSalesData();
  await clearPurchaseData();
  await clearStockData();
  await clearProductData();
  await clearAccountingData();
  await clearResourceData();

  // TODO: Truncate OpenFGA tuples table

  console.log('=== ALL TABLES CLEARED SUCCESSFULLY ===\n');
}

async function seedAllData(): Promise<void> {
  console.log('🌱 UNIFIED DATABASE SEEDING STARTED\n');

  const startTime = Date.now();
  let context: SeedContext = {};

  // Initialize faker.js seeding
  faker.seed(42);
  faker.setDefaultRefDate(startTime);

  try {
    context = await seedResourceData(context);
    context = await seedAccountingData(context);
    context = await seedProductData(context);
    context = await seedStockData(context);
    context = await seedPurchaseData(context);
    context = await seedSalesData(context);
    context = await seedRepairData(context);
    context = await seedEducationData(context, true);
  } catch (error) {
    console.error('❌ SEEDING FAILED:', error);
    process.exit(1);
  }

  const duration = Date.now() - startTime;
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log(`Duration: ${duration}ms\n`);

  console.log('Users: ', context.userIds);
}

if (import.meta.main) {
  await clearAllTables();
  await seedAllData();
}
