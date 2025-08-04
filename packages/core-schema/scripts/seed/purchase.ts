import { faker } from '@faker-js/faker';
import { ClientWriteStatus, type TupleKey } from '@openfga/sdk';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import { db } from '../../lib/db.ts';
import fgaClient from '../../lib/openfga.ts';
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
import { appEnvVariables } from '../../utils/env.ts';
import {
  clearTables,
  ORG_FOLDERS,
  ORG_TEAMS,
  type PartnerIds,
  type ProductIds,
  type SeedContext,
  type UserIds,
} from './utils.ts';

const { FGA_AUTHORIZATION_MODEL_ID } = appEnvVariables;

// region OpenFGA
/**
 * Seeds the quotation folder in OpenFGA.
 * This folder is used to aggregate quotation-related permissions.
 */
async function seedQuotationFolder(): Promise<void> {
  console.log('Quotation Folder:');

  const quotationFolder: TupleKey = {
    user: ORG_TEAMS.PURCHASE,
    relation: 'owner_team',
    object: ORG_FOLDERS.QUOTATIONS,
  };

  // const result = await fgaClient?.writeTuples([quotationFolder], {
  //   authorizationModelId: FGA_AUTHORIZATION_MODEL_ID,
  // });
  // result?.writes.forEach((write) => {
  //   if (write.status === ClientWriteStatus.SUCCESS)
  //     console.log(`   Created folder: ${quotationFolder.object}`);
  //   else {
  //     console.warn(
  //       `   Warning: Failed to create folder ${quotationFolder.object}`,
  //     );
  //     console.error(
  //       `Failed write for tuple ${JSON.stringify(write.tuple_key)}: ${write.err?.message || 'Unknown error'}`,
  //     );
  //   }
  // });
}

/**
 * Seeds purchase quotations with sample data.
 */
async function seedRequisitionTuples(
  purchaseRequisitions: InferSelectModel<typeof purchaseRequisitionTable>[],
): Promise<void> {
  console.log('Purchase Requisition Tuples:');

  const requisitionTuples = purchaseRequisitions.map((requisition) => {
    const tuple: TupleKey = {
      user: ORG_FOLDERS.QUOTATIONS,
      relation: 'crud_folder',
      object: `quotation:${requisition.reference_id}`,
    };
    return tuple;
  });

  // const result = await fgaClient?.writeTuples(requisitionTuples, {
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
  //     `   Failed to write ${failedCount}/${requisitionTuples.length} requisition tuples to OpenFGA`,
  //   );
  // else
  //   console.log(
  //     `   Successfully wrote ${requisitionTuples.length} requisition tuples to OpenFGA`,
  //   );
}

/**
 * Seeds quotation tuples in OpenFGA.
 */
async function seedQuotationTuples(
  quotations: InferSelectModel<typeof quotationTable>[],
): Promise<void> {
  console.log('Quotation Tuples:');

  const quotationTuples = quotations.map((quotation) => {
    const tuple: TupleKey = {
      user: ORG_FOLDERS.QUOTATIONS,
      relation: 'crud_folder',
      object: `quotation:${quotation.reference_id}`,
    };
    return tuple;
  });

  // const result = await fgaClient?.writeTuples(quotationTuples, {
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
  //     `   Failed to write ${failedCount}/${quotationTuples.length} quotation tuples to OpenFGA`,
  //   );
  // else
  //   console.log(
  //     `   Successfully wrote ${quotationTuples.length} quotation tuples to OpenFGA`,
  //   );
}
// endregion

// region Database
/**
 * Seeds purchase requisitions with sample data.
 */
async function seedPurchaseRequisitions(userIds: UserIds): Promise<number[]> {
  console.log('Purchase Requisitions:');

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
        created_by: faker.helpers.arrayElement(
          faker.helpers.objectValue(faker.helpers.objectValue(userIds)),
        ),
        updated_by: faker.helpers.arrayElement(
          faker.helpers.objectValue(faker.helpers.objectValue(userIds)),
        ),
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

  await seedRequisitionTuples(purchaseRequisitions);
  return purchaseRequisitions.map((requisition) => requisition.id);
}

/**
 * Seeds purchase requisition items with sample data.
 */
async function seedPurchaseRequisitionItems(
  purchaseRequisitionIds: number[],
  productIds: ProductIds,
): Promise<void> {
  // Ensure required IDs are available
  if (purchaseRequisitionIds.length === 0)
    throw new Error(
      'No purchase requisition IDs provided for seeding purchase requisition items',
    );

  console.log('Purchase Requisition Items:');

  const purchaseRequisitionItemData = Array.from(
    { length: faker.number.int({ min: 20, max: 50 }) },
    () => {
      const purchaseRequisitionItem: InferInsertModel<
        typeof purchaseRequisitionItemTable
      > = {
        purchase_requisition_id: faker.helpers.arrayElement(
          purchaseRequisitionIds,
        ),
        product_id: faker.helpers.objectValue(productIds),
        quantity: faker.number.int({ min: 1, max: 10 }),
        estimated_cost: faker.commerce.price({ min: 10, max: 1000 }),
      };
      return purchaseRequisitionItem;
    },
  );

  // Ensure unique purchase requisition items per requisition and product
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
  purchaseRequisitionIds: number[],
  partnerIds: PartnerIds,
): Promise<void> {
  // Ensure required IDs are available
  if (purchaseRequisitionIds.length === 0)
    throw new Error(
      'No purchase requisition IDs provided for seeding requisition partners',
    );

  console.log('Purchase Requisition Partners:');

  const purchaseRequisitionPartnerData = Array.from(
    { length: faker.number.int({ min: 10, max: 20 }) },
    () => {
      const reqPartner: InferInsertModel<
        typeof purchaseRequisitionPartnerTable
      > = {
        supplier_id: faker.helpers.objectValue(partnerIds),
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
  partnerIds: PartnerIds,
  userIds: UserIds,
): Promise<number[]> {
  console.log('Quotations:');

  // Hardcode quotation with SG partner
  const sgQuotation: InferInsertModel<typeof quotationTable> = {
    supplier_id: partnerIds.SG,
    quotation_type: PurchaseQuotationType.STANDARD,
    total_value: faker.commerce.price({ min: 100, max: 1000 }),
    created_by: faker.helpers.arrayElement(
      faker.helpers.objectValue(faker.helpers.objectValue(userIds)),
    ),
    updated_by: faker.helpers.arrayElement(
      faker.helpers.objectValue(faker.helpers.objectValue(userIds)),
    ),
  };

  const quotationData = Array.from(
    { length: faker.number.int({ min: 5, max: 10 }) },
    () => {
      const quotation: InferInsertModel<typeof quotationTable> = {
        supplier_id: faker.helpers.objectValue(partnerIds),
        quotation_type: faker.helpers.enumValue(PurchaseQuotationType),
        total_value: faker.commerce.price({ min: 100, max: 1000 }),
        created_by: faker.helpers.arrayElement(
          faker.helpers.objectValue(faker.helpers.objectValue(userIds)),
        ),
        updated_by: faker.helpers.arrayElement(
          faker.helpers.objectValue(faker.helpers.objectValue(userIds)),
        ),
      };
      return quotation;
    },
  );
  quotationData.push(sgQuotation);

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

  await seedQuotationTuples(quotations);
  return quotations.map((quotation) => quotation.id);
}

/**
 * Seeds quotation items with sample data.
 */
async function seedQuotationItems(
  quotationIds: number[],
  productIds: ProductIds,
): Promise<void> {
  // Ensure required IDs are available
  if (quotationIds.length === 0)
    throw new Error('No quotation IDs provided for seeding quotation items');

  console.log('Quotation Items:');

  const quotationItemData = Array.from(
    { length: faker.number.int({ min: 20, max: 50 }) },
    () => {
      const quotationItem: InferInsertModel<typeof quotationItemTable> = {
        quotation_id: faker.helpers.arrayElement(quotationIds),
        product_id: faker.helpers.objectValue(productIds),
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
  purchaseRequisitionIds: number[],
  quotationIds: number[],
): Promise<void> {
  // Ensure required IDs are available
  if (purchaseRequisitionIds.length === 0 || quotationIds.length === 0)
    throw new Error(
      'No purchase requisition IDs or quotation IDs provided for seeding purchase requisition quotations',
    );

  console.log('Purchase Requisition Quotations:');

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
// endregion

// region Drivers
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

  // Ensure required context is available
  if (!context.partnerIds || !context.productIds || !context.userIds)
    throw new Error(
      'Required partner, product, or user IDs not found for purchase data',
    );

  await seedQuotationFolder();

  const purchaseRequisitionIds = await seedPurchaseRequisitions(
    context.userIds,
  );
  await seedPurchaseRequisitionItems(
    purchaseRequisitionIds,
    context.productIds,
  );
  await seedRequisitionPartners(purchaseRequisitionIds, context.partnerIds);

  const quotationIds = await seedQuotations(
    context.partnerIds,
    context.userIds,
  );
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
// endregion
