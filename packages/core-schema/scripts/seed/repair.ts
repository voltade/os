import { faker } from '@faker-js/faker';
import type { InferInsertModel } from 'drizzle-orm';

import { db } from '../../lib/db.ts';
import {
  RepairOrderPriority,
  RepairOrderStatus,
  repairOrderTable,
} from '../../schemas/index.ts';
import {
  clearTables,
  type EntityIds,
  type PartnerIds,
  type ProductIds,
  type SeedContext,
  type UserIds,
} from './utils.ts';

const REPAIR_SCENARIOS = [
  'Screen replacement needed due to crack',
  'Battery not holding charge, replacement required',
  'Overheating issues, cooling system needs repair',
  'Software corruption, requires reinstallation',
  'Power supply failure, component replacement needed',
  'Liquid damage, internal cleaning and part replacement',
  'Mechanical wear, calibration and adjustment required',
  'Network connectivity issues, port repair needed',
  'Display flickering, video card diagnostics required',
  'Audio output failure, speaker replacement needed',
  'Sensor malfunction, recalibration needed',
  'Motor bearing replacement required',
  'Control board diagnostics and repair',
  'Firmware update and configuration reset',
];

// region Database
/**
 * Seeds repair orders with various scenarios and statuses.
 */
async function seedRepairOrders(
  entityIds: EntityIds,
  partnerIds: PartnerIds,
  productIds: ProductIds,
  userIds: UserIds,
): Promise<void> {
  console.log('Repair Orders:');

  const repairOrderData = Array.from(
    { length: faker.number.int({ min: 50, max: 100 }) },
    (_, index) => {
      const statusWeights = [
        { value: RepairOrderStatus.NEW as const, weight: 0.4 },
        { value: RepairOrderStatus.CONFIRMED as const, weight: 0.3 },
        { value: RepairOrderStatus.UNDER_REPAIR as const, weight: 0.15 },
        { value: RepairOrderStatus.REPAIRED as const, weight: 0.1 },
        { value: RepairOrderStatus.CANCELLED as const, weight: 0.05 },
      ];
      const status = faker.helpers.weightedArrayElement(statusWeights);

      const priorityWeights = [
        { value: RepairOrderPriority.NORMAL as const, weight: 0.5 },
        { value: RepairOrderPriority.HIGH as const, weight: 0.3 },
        { value: RepairOrderPriority.LOW as const, weight: 0.15 },
        { value: RepairOrderPriority.URGENT as const, weight: 0.05 },
      ];
      const priority = faker.helpers.weightedArrayElement(priorityWeights);

      const baseScenario = faker.helpers.arrayElement(REPAIR_SCENARIOS);
      const additionalNotes = faker.datatype.boolean(0.3)
        ? ` Customer reported: ${faker.helpers.arrayElement([
            'intermittent issues',
            'recent drops',
            'exposure to moisture',
            'heavy usage',
            'age-related wear',
          ])}.`
        : '';
      const technicianNotes = baseScenario + additionalNotes;

      const customProperties = faker.datatype.boolean(0.4)
        ? {
            estimatedCost: faker.number.int({ min: 50, max: 2000 }),
            estimatedDuration: faker.helpers.arrayElement([
              '2-4 hours',
              '1-2 days',
              '3-5 days',
              '1 week',
            ]),
            complexity: faker.helpers.arrayElement(['low', 'medium', 'high']),
            partsRequired: faker.datatype.boolean(0.6),
          }
        : null;

      const warrantyCovered = faker.datatype.boolean(0.3);
      const partsDeliveryDelayed = customProperties?.partsRequired
        ? faker.datatype.boolean(0.15)
        : false;

      let scheduledRepairDate = null;
      if (
        status === RepairOrderStatus.CONFIRMED ||
        status === RepairOrderStatus.UNDER_REPAIR
      )
        scheduledRepairDate = faker.date.soon({ days: 30 });

      const assignedTechnicianId =
        status === RepairOrderStatus.CONFIRMED ||
        status === RepairOrderStatus.UNDER_REPAIR
          ? faker.helpers.arrayElement(
              faker.helpers.objectValue(faker.helpers.objectValue(userIds)),
            )
          : null;

      const createdByUserId = faker.helpers.arrayElement(
        faker.helpers.objectValue(faker.helpers.objectValue(userIds)),
      );
      const lastModifiedById = faker.datatype.boolean(0.3)
        ? faker.helpers.arrayElement(
            faker.helpers.objectValue(faker.helpers.objectValue(userIds)),
          )
        : createdByUserId;

      const timestamp = faker.date
        .past({ years: 5 })
        .toISOString()
        .slice(0, 10);

      const repairOrder: InferInsertModel<typeof repairOrderTable> = {
        company_id: faker.helpers.objectValue(entityIds),
        customer_id: faker.helpers.objectValue(partnerIds),
        assigned_technician_id: assignedTechnicianId,
        product_id: faker.helpers.objectValue(productIds),
        reference_number: `RO-${timestamp}-${(index + 1).toString().padStart(3, '0')}`,
        status,
        priority,
        custom_properties: customProperties,
        technician_notes: technicianNotes,
        warranty_covered: warrantyCovered,
        parts_delivery_delayed: partsDeliveryDelayed,
        scheduled_repair_date: scheduledRepairDate,
        created_by: createdByUserId,
        updated_by: lastModifiedById,
      };
      return repairOrder;
    },
  );

  const repairOrders = await db
    .insert(repairOrderTable)
    .values(repairOrderData)
    .returning();
  console.log(`   Created ${repairOrders.length} repair orders`);
  if (repairOrders.length !== repairOrderData.length)
    console.warn(
      `   Warning: Expected ${repairOrderData.length} repair orders ` +
        `but got ${repairOrders.length} repair orders`,
    );
}
// endregion

// region Drivers
/**
 * Seeds repair data for the application.
 *
 * @param context - The seed context to update with created IDs.
 * @returns Updated seed context with new IDs.
 */
export async function seedRepairData(
  context: SeedContext,
): Promise<SeedContext> {
  console.log('=== REPAIR DATA ===');

  // Ensure required context is available
  if (
    !context.entityIds ||
    !context.partnerIds ||
    !context.productIds ||
    !context.userIds
  )
    throw new Error(
      'Required entity, partner, product, or user IDs not found for repair data',
    );

  await seedRepairOrders(
    context.entityIds,
    context.partnerIds,
    context.productIds,
    context.userIds,
  );

  console.log('=== REPAIR DATA SEEDING COMPLETE ===\n');
  return context;
}

/**
 * Clears all repair-related data from the database.
 *
 * The order of truncation should follow the reverse order of seeding
 * to avoid foreign key constraints.
 */
export async function clearRepairData(): Promise<void> {
  console.log('Clearing repair data...');
  await clearTables(repairOrderTable);
  console.log('Repair data cleared successfully\n');
}
// endregion
