import { faker } from '@faker-js/faker';
import type { InferInsertModel } from 'drizzle-orm';

import { db } from '../../lib/db.ts';
import {
  PurchaseQuotationType,
  PurchaseRequisitionPriority,
  PurchaseRequisitionStatus,
  purchaseRequisitionItemTable,
  purchaseRequisitionPartnerTable,
  purchaseRequisitionQuotationTable,
  purchaseRequisitionTable,
  quotationItemTable,
  quotationTable,
} from '../../schemas/index.ts';
import { clearTables, type SeedContext } from './utils.ts';

/**
 * Seeds purchase requisitions with sample data.
 */
async function seedPurchaseRequisitions(
  userIds: number[] = [],
): Promise<number[]> {
  // Ensure user IDs are available
  if (userIds.length === 0)
    throw new Error('No user IDs provided for seeding purchase requisitions');

  console.log('Seeding purchase requisitions...');
  const purchaseRequisitionData = Array.from(
    { length: faker.number.int({ min: 5, max: 10 }) },
    () => {
      const purchaseRequisition: InferInsertModel<
        typeof purchaseRequisitionTable
      > = {
        title: faker.commerce.productName(),
        priority: faker.helpers.enumValue(PurchaseRequisitionPriority),
        total_expected_cost: faker.commerce.price({ min: 10, max: 1000 }),
        status: faker.helpers.enumValue(PurchaseRequisitionStatus),
        created_by: faker.helpers.arrayElement(userIds),
        updated_by: faker.helpers.arrayElement(userIds),
      };
      return purchaseRequisition;
    },
  );

  const purchaseRequisitions = await db
    .insert(purchaseRequisitionTable)
    .values(purchaseRequisitionData)
    .returning();
  console.log(
    `   Created ${purchaseRequisitions.length} purchase requisitions`,
  );
  if (purchaseRequisitions.length !== purchaseRequisitionData.length)
    console.warn(
      `   Warning: Expected ${purchaseRequisitionData.length} purchase requisitions ` +
        `but got ${purchaseRequisitions.length} purchase requisitions`,
    );

  return purchaseRequisitions.map((requisition) => requisition.id);
}

/**
 * Seeds purchase requisition items with sample data.
 */
async function seedPurchaseRequisitionItems(
  purchaseRequisitionIds: number[] = [],
  productIds: number[] = [],
): Promise<void> {
  // Ensure required IDs are available
  if (productIds.length === 0 || purchaseRequisitionIds.length === 0)
    throw new Error(
      'No product IDs or purchase requisition IDs provided for seeding purchase requisition items',
    );

  console.log('Seeding purchase requisition items...');
  const purchaseRequisitionItemData = Array.from(
    { length: faker.number.int({ min: 20, max: 50 }) },
    () => {
      const purchaseRequisitionItem: InferInsertModel<
        typeof purchaseRequisitionItemTable
      > = {
        purchase_requisition_id: faker.helpers.arrayElement(
          purchaseRequisitionIds,
        ),
        product_id: faker.helpers.arrayElement(productIds),
        quantity: faker.number.int({ min: 1, max: 10 }),
        estimated_cost: faker.commerce.price({ min: 10, max: 1000 }),
      };
      return purchaseRequisitionItem;
    },
  );

  const uniqueRelations: {
    [x: string]: InferInsertModel<typeof purchaseRequisitionItemTable>;
  } = {};
  purchaseRequisitionItemData.forEach((item) => {
    const key = `${item.purchase_requisition_id}-${item.product_id}`;
    if (!uniqueRelations[key]) uniqueRelations[key] = item;
  });

  const purchaseRequisitionItems = await db
    .insert(purchaseRequisitionItemTable)
    .values(Object.values(uniqueRelations))
    .returning();
  console.log(
    `   Created ${purchaseRequisitionItems.length} purchase requisition items`,
  );
  if (purchaseRequisitionItems.length !== Object.values(uniqueRelations).length)
    console.warn(
      `   Warning: Expected ${Object.values(uniqueRelations).length} purchase requisition items ` +
        `but got ${purchaseRequisitionItems.length} purchase requisition items`,
    );
}

/**
 * Seeds purchase requisition partners with sample data.
 */
async function seedRequisitionPartners(
  purchaseRequisitionIds: number[] = [],
  partnerIds: number[] = [],
): Promise<void> {
  // Ensure required IDs are available
  if (partnerIds.length === 0 || purchaseRequisitionIds.length === 0)
    throw new Error(
      'No partner IDs or purchase requisition IDs provided for seeding requisition partners',
    );

  console.log('Seeding purchase requisition partners...');
  const purchaseRequisitionPartnerData = Array.from(
    { length: faker.number.int({ min: 10, max: 20 }) },
    () => {
      const reqPartner: InferInsertModel<
        typeof purchaseRequisitionPartnerTable
      > = {
        supplier_id: faker.helpers.arrayElement(partnerIds),
        purchase_requisition_id: faker.helpers.arrayElement(
          purchaseRequisitionIds,
        ),
      };
      return reqPartner;
    },
  );

  const uniqueRelations: {
    [x: string]: InferInsertModel<typeof purchaseRequisitionPartnerTable>;
  } = {};
  purchaseRequisitionPartnerData.forEach((relation) => {
    const { supplier_id, purchase_requisition_id } = relation;
    const key = `${supplier_id}-${purchase_requisition_id}`;
    if (!uniqueRelations[key]) uniqueRelations[key] = relation;
  });

  const purchaseRequisitionPartners = await db
    .insert(purchaseRequisitionPartnerTable)
    .values(Object.values(uniqueRelations))
    .returning();
  console.log(
    `   Created ${purchaseRequisitionPartners.length} purchase requisition partners`,
  );
  if (
    purchaseRequisitionPartners.length !== Object.values(uniqueRelations).length
  )
    console.warn(
      `   Warning: Expected ${Object.values(uniqueRelations).length} purchase requisition partners ` +
        `but got ${purchaseRequisitionPartners.length} purchase requisition partners`,
    );
}

/**
 * Seeds purchase quotations with sample data.
 */
async function seedQuotations(
  partnerIds: number[] = [],
  userIds: number[] = [],
): Promise<number[]> {
  // Ensure required IDs are available
  if (partnerIds.length === 0 || userIds.length === 0)
    throw new Error(
      'No partner IDs or user IDs provided for seeding quotations',
    );

  console.log('Seeding quotations...');
  const quotationData = Array.from(
    { length: faker.number.int({ min: 5, max: 10 }) },
    () => {
      const quotation: InferInsertModel<typeof quotationTable> = {
        supplier_id: faker.helpers.arrayElement(partnerIds),
        quotation_type: faker.helpers.enumValue(PurchaseQuotationType),
        total_value: faker.commerce.price({ min: 100, max: 1000 }),
        created_by: faker.helpers.arrayElement(userIds),
        updated_by: faker.helpers.arrayElement(userIds),
      };
      return quotation;
    },
  );

  const quotations = await db
    .insert(quotationTable)
    .values(quotationData)
    .returning();
  console.log(`   Created ${quotations.length} quotations`);
  if (quotations.length !== quotationData.length)
    console.warn(
      `   Warning: Expected ${quotationData.length} quotations ` +
        `but got ${quotations.length} quotations`,
    );

  return quotations.map((quotation) => quotation.id);
}

/**
 * Seeds quotation items with sample data.
 */
async function seedQuotationItems(
  quotationIds: number[] = [],
  productIds: number[] = [],
): Promise<void> {
  // Ensure required IDs are available
  if (quotationIds.length === 0 || productIds.length === 0)
    throw new Error(
      'No quotation IDs or product IDs provided for seeding quotation items',
    );

  console.log('Seeding quotation items...');
  const quotationItemData = Array.from(
    { length: faker.number.int({ min: 20, max: 50 }) },
    () => {
      const quotationItem: InferInsertModel<typeof quotationItemTable> = {
        quotation_id: faker.helpers.arrayElement(quotationIds),
        product_id: faker.helpers.arrayElement(productIds),
        unit_price: faker.commerce.price({ min: 10, max: 1000 }),
        unit_price_with_tax: faker.commerce.price({ min: 10, max: 1000 }),
        moq: faker.number.int({ min: 1, max: 10 }),
      };
      return quotationItem;
    },
  );

  const uniqueRelations: {
    [x: string]: InferInsertModel<typeof quotationItemTable>;
  } = {};
  quotationItemData.forEach((item) => {
    const key = `${item.quotation_id}-${item.product_id}`;
    if (!uniqueRelations[key]) uniqueRelations[key] = item;
  });

  const quotationItems = await db
    .insert(quotationItemTable)
    .values(Object.values(uniqueRelations))
    .returning();
  console.log(`   Created ${quotationItems.length} quotation items`);
  if (quotationItems.length !== Object.values(uniqueRelations).length)
    console.warn(
      `   Warning: Expected ${Object.values(uniqueRelations).length} quotation items ` +
        `but got ${quotationItems.length} quotation items`,
    );
}

/**
 * Seeds purchase requisition quotations with sample data.
 */
async function seedPurchaseRequisitionQuotations(
  purchaseRequisitionIds: number[] = [],
  quotationIds: number[] = [],
): Promise<void> {
  // Ensure required IDs are available
  if (purchaseRequisitionIds.length === 0 || quotationIds.length === 0)
    throw new Error(
      'No purchase requisition IDs or quotation IDs provided for seeding purchase requisition quotations',
    );

  console.log('Seeding purchase requisition quotations...');
  const purchaseRequisitionQuotationData = Array.from(
    { length: faker.number.int({ min: 5, max: 10 }) },
    () => {
      const purchaseRequisitionQuotation: InferInsertModel<
        typeof purchaseRequisitionQuotationTable
      > = {
        purchase_requisition_id: faker.helpers.arrayElement(
          purchaseRequisitionIds,
        ),
        quotation_id: faker.helpers.arrayElement(quotationIds),
      };
      return purchaseRequisitionQuotation;
    },
  );

  const uniqueRelations: {
    [x: string]: InferInsertModel<typeof purchaseRequisitionQuotationTable>;
  } = {};
  purchaseRequisitionQuotationData.forEach((relation) => {
    const key = `${relation.purchase_requisition_id}-${relation.quotation_id}`;
    if (!uniqueRelations[key]) uniqueRelations[key] = relation;
  });

  const purchaseRequisitionQuotations = await db
    .insert(purchaseRequisitionQuotationTable)
    .values(Object.values(uniqueRelations))
    .returning();
  console.log(
    `   Created ${Object.values(uniqueRelations).length} purchase requisition quotations`,
  );
  if (
    purchaseRequisitionQuotations.length !==
    Object.values(uniqueRelations).length
  )
    console.warn(
      `   Warning: Expected ${Object.values(uniqueRelations).length} purchase requisition quotations ` +
        `but got ${purchaseRequisitionQuotations.length} purchase requisition quotations`,
    );
}

/**
 * Seeds purchase data including purchase requisitions, quotations, and orders.
 *
 * @param context - The seed context containing existing IDs.
 * @returns Updated seed context with new IDs.
 */
export async function seedPurchaseData(
  context: SeedContext,
): Promise<SeedContext> {
  console.log('=== PURCHASE DATA ===');

  const purchaseRequisitionIds = await seedPurchaseRequisitions(
    context.userIds,
  );
  context.purchaseRequisitionIds = purchaseRequisitionIds;

  await seedPurchaseRequisitionItems(
    purchaseRequisitionIds,
    context.productIds,
  );
  await seedRequisitionPartners(purchaseRequisitionIds, context.partnerIds);

  const quotationIds = await seedQuotations(
    context.partnerIds,
    context.userIds,
  );
  context.purchaseQuotationIds = quotationIds;

  await seedQuotationItems(quotationIds, context.productIds);
  await seedPurchaseRequisitionQuotations(purchaseRequisitionIds, quotationIds);

  console.log('=== PURCHASE DATA SEEDING COMPLETE ===\n');
  return context;
}

/**
 * Clears all purchase-related data from the database.
 *
 * The order of truncation should follow the reverse order of seeding
 * to avoid foreign key constraints.
 */
export async function clearPurchaseData(): Promise<void> {
  console.log('Clearing purchase data...');

  await clearTables(
    purchaseRequisitionQuotationTable,
    quotationItemTable,
    quotationTable,
    purchaseRequisitionPartnerTable,
    purchaseRequisitionItemTable,
    purchaseRequisitionTable,
  );

  console.log('Purchase data cleared successfully.\n');
}
