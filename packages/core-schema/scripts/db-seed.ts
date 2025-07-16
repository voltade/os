#!/usr/bin/env bun

import { faker } from '@faker-js/faker';
import { type InferInsertModel, sql } from 'drizzle-orm';

import { accountTable } from '../src/schemas/accounting/tables/account.ts';
import { journalTable } from '../src/schemas/accounting/tables/journal.ts';
import { taxTable } from '../src/schemas/accounting/tables/tax.ts';
import { taxDistributionLineTable } from '../src/schemas/accounting/tables/tax_distribution_line.ts';
import { taxDistributionLineTaxTagRelTable } from '../src/schemas/accounting/tables/tax_distribution_line_tax_tag_rel.ts';
import { taxGroupTable } from '../src/schemas/accounting/tables/tax_group.ts';
import { taxTagTable } from '../src/schemas/accounting/tables/tax_tag.ts';
import { comboTable } from '../src/schemas/product/tables/combo.ts';
import { comboProductTable } from '../src/schemas/product/tables/combo_product.ts';
import { productTable } from '../src/schemas/product/tables/product.ts';
import { productTemplateTable } from '../src/schemas/product/tables/product_template.ts';
import { templateComboTable } from '../src/schemas/product/tables/template_combo.ts';
import {
  purchaseOrderItemTable,
  purchaseOrderTable,
  purchaseRequisitionItemTable,
  purchaseRequisitionPartnerTable,
  purchaseRequisitionQuotationTable,
  purchaseRequisitionTable,
  quotationItemTable,
  quotationTable,
} from '../src/schemas/purchase/index.ts';
import { repairOrderTable } from '../src/schemas/repair/tables/repair_orders.ts';
import { countryTable } from '../src/schemas/resource/tables/country.ts';
import { currencyTable } from '../src/schemas/resource/tables/currency.ts';
import { entityTable } from '../src/schemas/resource/tables/entity.ts';
import { mockPermissionsTable } from '../src/schemas/resource/tables/mock_permissions.ts';
import { mockPermissionsUserTable } from '../src/schemas/resource/tables/mock_permissions_user.ts';
import { partnerTable } from '../src/schemas/resource/tables/partner.ts';
import { sequenceTable } from '../src/schemas/resource/tables/sequence.ts';
import { uomTable } from '../src/schemas/resource/tables/uom.ts';
import { userTable } from '../src/schemas/resource/tables/user.ts';
import { orderTable } from '../src/schemas/sales/tables/order.ts';
import { orderLineTable } from '../src/schemas/sales/tables/order_line.ts';
import { appointmentTypeTable } from '../src/schemas/services/tables/appointment_type.ts';
import {
  StockOperationLineStatus,
  StockOperationStatus,
  StockOperationType,
} from '../src/schemas/stock/enums.ts';
import { inventoryTable } from '../src/schemas/stock/tables/inventory.ts';
import { stockOperationTable } from '../src/schemas/stock/tables/stock_operation.ts';
import { stockOperationLineTable } from '../src/schemas/stock/tables/stock_operation_line.ts';
import { stockOperationLineItemTable } from '../src/schemas/stock/tables/stock_operation_line_item.ts';
import { stockOperationSequenceTable } from '../src/schemas/stock/tables/stock_operation_sequence.ts';
import { stockOperationTypeTable } from '../src/schemas/stock/tables/stock_operation_type.ts';
import { stockUnitTable } from '../src/schemas/stock/tables/stock_unit.ts';
import { warehouseTable } from '../src/schemas/stock/tables/warehouse.ts';
import { warehouseLocationTable } from '../src/schemas/stock/tables/warehouse_location.ts';
import { db } from '../utils/db.ts';

interface SeedContext {
  countryIds: { [name: string]: number };
  currencyIds: { [name: string]: number };
  userIds: number[];
  entityIds: number[];
  partnerIds: number[];
  productIds: number[];
  templateIds: number[];
  salesOrderIds: number[];
  purchaseRequisitionIds: [];
  purchaseQuotationIds: [];
  purchaseOrderIds: number[];
  warehouseIds: number[];
  warehouseLocationIds: number[];
}

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

async function clearAllTables(): Promise<void> {
  console.log('Clearing all tables and resetting sequences...\n');

  await db.transaction(async (tx) => {
    const tablesToClear = [
      appointmentTypeTable,
      repairOrderTable,
      orderLineTable,
      orderTable,
      inventoryTable,
      stockOperationLineItemTable,
      stockOperationLineTable,
      stockOperationTypeTable,
      stockOperationSequenceTable,
      stockOperationTable,
      stockUnitTable,
      warehouseLocationTable,
      warehouseTable,
      productTable,
      productTemplateTable,
      partnerTable,
      entityTable,
      userTable,
      taxDistributionLineTaxTagRelTable,
      taxTagTable,
      taxDistributionLineTable,
      taxTable,
      taxGroupTable,
      accountTable,
      journalTable,
      currencyTable,
      countryTable,
      uomTable,
      sequenceTable,
      mockPermissionsTable,
      mockPermissionsUserTable,
      purchaseOrderTable,
      purchaseOrderItemTable,
      quotationTable,
      quotationItemTable,
      purchaseRequisitionTable,
      purchaseRequisitionItemTable,
      purchaseRequisitionPartnerTable,
      purchaseRequisitionQuotationTable,
    ];

    for (const table of tablesToClear) {
      try {
        await tx.execute(sql`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
        console.log(`   Cleared ${table}`);
      } catch (error) {
        console.log(`   Skipped ${table} (${error})`);
      }
    }
  });

  console.log('\nAll tables cleared and sequences reset\n');
}

async function seedResourceData(context: SeedContext): Promise<void> {
  console.log('=== RESOURCE DATA ===');

  console.log('Countries:');
  const countries = await db
    .insert(countryTable)
    .values([
      { code: 'SG', name: 'Singapore' },
      { code: 'US', name: 'United States' },
    ])
    .returning();

  countries.forEach((country) => {
    context.countryIds[country.name] = country.id;
  });
  console.log(`   Created ${countries.length} countries`);

  console.log('Currencies:');
  const currencies = await db
    .insert(currencyTable)
    .values([
      {
        name: 'SGD',
        full_name: 'Singapore Dollar',
        symbol: '$',
        decimal_places: 2,
      },
      { name: 'USD', full_name: 'US Dollar', symbol: '$', decimal_places: 2 },
    ])
    .returning();

  currencies.forEach((currency) => {
    context.currencyIds[currency.name] = currency.id;
  });
  console.log(`   Created ${currencies.length} currencies`);

  console.log('System User (ID 1):');
  await db.insert(userTable).values([
    {
      first_name: 'System',
      last_name: 'User',
      created_by: null,
      updated_by: null,
    },
  ]);

  context.userIds.push(1);
  console.log('   Created System User with ID 1');

  console.log('Users:');
  const userCount = 20;
  const userData = Array.from({ length: userCount }, () => ({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    created_by: null as number | null,
    updated_by: null as number | null,
  }));

  const users = await db.insert(userTable).values(userData).returning();
  context.userIds.push(...users.map((u) => u.id));
  console.log(`   Created ${users.length} additional users`);

  console.log('Entities:');
  const sgdId = context.currencyIds.SGD;
  const usdId = context.currencyIds.USD;
  const sgCountryId = context.countryIds.Singapore;
  const usCountryId = context.countryIds['United States'];

  if (!sgdId || !usdId || !sgCountryId || !usCountryId) {
    throw new Error('Required country or currency IDs not found');
  }

  const sgEntity = await db
    .insert(entityTable)
    .values({
      name: 'Voltade Pte Ltd',
      country_id: sgCountryId,
      currency_id: sgdId,
    })
    .returning();

  if (sgEntity.length === 0 || !sgEntity[0]) {
    throw new Error('Failed to create Singapore entity');
  }
  context.entityIds.push(sgEntity[0].id);

  const entityCount = 8;
  const entityData = Array.from({ length: entityCount }, () => ({
    name: faker.company.name(),
    country_id: usCountryId,
    currency_id: usdId,
    created_by: 1,
    updated_by: 1,
  }));

  const entities = await db.insert(entityTable).values(entityData).returning();
  context.entityIds.push(...entities.map((e) => e.id));
  console.log(`   Created ${entities.length + 1} entities`);

  console.log('Partners:');
  const partnerCount = 15;
  const partnerData = Array.from({ length: partnerCount }, () => ({
    name: faker.company.name(),
    currencyId: context.currencyIds.USD,
    createdBy: 1,
    updatedBy: 1,
  }));

  const partners = await db
    .insert(partnerTable)
    .values(partnerData)
    .returning();
  context.partnerIds.push(...partners.map((p) => p.id));
  console.log(`   Created ${partners.length} partners`);

  console.log('Units of Measure:');
  await db.insert(uomTable).values([
    // Reference units
    {
      name: 'Piece',
      code: 'pc',
      category: 'piece',
      is_reference: true,
      conversion_ratio: '1',
      rounding: '1',
    },
    {
      name: 'Kilogram',
      code: 'kg',
      category: 'weight',
      is_reference: true,
      conversion_ratio: '1',
      rounding: '0.01',
    },
    {
      name: 'Liter',
      code: 'l',
      category: 'volume',
      is_reference: true,
      conversion_ratio: '1',
      rounding: '0.01',
    },
    {
      name: 'Meter',
      code: 'm',
      category: 'length',
      is_reference: true,
      conversion_ratio: '1',
      rounding: '0.01',
    },
    {
      name: 'Square meter',
      code: 'm²',
      category: null,
      is_reference: false,
      conversion_ratio: null,
      rounding: '0.01',
    },
    {
      name: 'Set',
      code: 'set',
      category: null,
      is_reference: false,
      conversion_ratio: null,
      rounding: '1',
    },
    {
      name: 'Pair',
      code: 'pr',
      category: null,
      is_reference: false,
      conversion_ratio: null,
      rounding: '1',
    },

    // Derived units
    {
      name: 'Pack',
      code: 'pk',
      category: 'piece',
      is_reference: false,
      conversion_ratio: '10',
      rounding: '1',
    },
    {
      name: 'Box',
      code: 'bx',
      category: 'piece',
      is_reference: false,
      conversion_ratio: '24',
      rounding: '1',
    },
    {
      name: 'Dozen',
      code: 'dz',
      category: 'piece',
      is_reference: false,
      conversion_ratio: '12',
      rounding: '1',
    },
    {
      name: 'Gram',
      code: 'g',
      category: 'weight',
      is_reference: false,
      conversion_ratio: '0.001',
      rounding: '0.01',
    },
    {
      name: 'Pound',
      code: 'lb',
      category: 'weight',
      is_reference: false,
      conversion_ratio: '0.45359237',
      rounding: '0.01',
    },
    {
      name: 'Ounce',
      code: 'oz',
      category: 'weight',
      is_reference: false,
      conversion_ratio: '0.02834952',
      rounding: '0.01',
    },
    {
      name: 'Milliliter',
      code: 'ml',
      category: 'volume',
      is_reference: false,
      conversion_ratio: '0.001',
      rounding: '0.01',
    },
    {
      name: 'Gallon',
      code: 'gal',
      category: 'volume',
      is_reference: false,
      conversion_ratio: '3.78541',
      rounding: '0.01',
    },
    {
      name: 'Centimeter',
      code: 'cm',
      category: 'length',
      is_reference: false,
      conversion_ratio: '0.01',
      rounding: '0.01',
    },
    {
      name: 'Inch',
      code: 'in',
      category: 'length',
      is_reference: false,
      conversion_ratio: '0.0254',
      rounding: '0.01',
    },
    {
      name: 'Foot',
      code: 'ft',
      category: 'length',
      is_reference: false,
      conversion_ratio: '0.3048',
      rounding: '0.01',
    },
  ]);
  console.log('   Created 18 units of measure');

  console.log('Sequences:');

  const sequenceData: InferInsertModel<typeof sequenceTable>[] = [
    {
      type: 'purchase_requisition',
      prefix: 'PR',
    },
    {
      type: 'purchase_order',
      prefix: 'PO',
    },
    {
      type: 'purchase_quotation',
      prefix: 'QO',
    },
  ];

  await db.insert(sequenceTable).values(sequenceData);
  console.log(`   Created ${sequenceData.length} sequence(s)`);

  //MOCK PERMISSIONS DATA!
  console.log('Mock Permissions:');
  const mockPermssionsData: InferInsertModel<typeof mockPermissionsTable>[] = [
    { name: 'view_all' },
    { name: 'view_partial' },
  ];

  const mockPermissionsUserData: InferInsertModel<
    typeof mockPermissionsUserTable
  >[] = [
    {
      user_id: 1,
      permission_id: 1,
    },
    {
      user_id: 1,
      permission_id: 2,
    },
  ];

  await db.insert(mockPermissionsTable).values(mockPermssionsData);
  await db.insert(mockPermissionsUserTable).values(mockPermissionsUserData);

  console.log(
    `   Created ${mockPermssionsData.length} mock permissions and assigned to user ID 1`,
  );

  console.log('');
}

async function seedAccountingData(context: SeedContext): Promise<void> {
  console.log('=== ACCOUNTING DATA ===');

  const sgdId = context.currencyIds.SGD;
  const sgCountryId = context.countryIds.Singapore;
  const sgEntityId = context.entityIds[0];

  console.log('Accounts:');
  await db.insert(accountTable).values([
    {
      category: 'Current Asset',
      code: '101231',
      name: 'GST Receivable/Refund',
      currency_id: sgdId,
    },
    {
      category: 'Current Liability',
      code: '201120',
      name: 'GST Payable',
      currency_id: sgdId,
    },
    {
      category: 'Current Liability',
      code: '201170',
      name: 'Output Tax Due',
      currency_id: sgdId,
    },
  ]);
  console.log('   Created 3 accounts');

  console.log('Tax Groups:');
  if (!sgCountryId || !sgEntityId) {
    throw new Error('Required country or entity IDs not found for tax group');
  }
  await db.insert(taxGroupTable).values({
    name: '9% GST',
    country_id: sgCountryId,
    entity_id: sgEntityId,
    tax_payable_account_id: 2,
    tax_receivable_account_id: 1,
  });
  console.log('   Created 1 tax group');

  console.log('Taxes:');
  await db.insert(taxTable).values([
    {
      name: '9% SR',
      amount: '9.0',
      type: 'Sales',
      country_id: sgCountryId,
      affect_base_of_subsequent_taxes: false,
      base_affected_by_previous_taxes: true,
    },
  ]);
  console.log('   Created 1 tax');

  console.log('Tax Distribution Lines:');
  await db.insert(taxDistributionLineTable).values([
    {
      tax_id: 1,
      document_type: 'Invoice',
      type: 'Base',
    },
    {
      tax_id: 1,
      document_type: 'Invoice',
      type: 'Tax',
      factor_percentage: '100.0',
      account_id: 1,
    },
  ]);
  console.log('   Created 2 tax distribution lines');

  console.log('Tax Tags:');
  await db.insert(taxTagTable).values([
    { name: '+Box 1', negate: false, country_id: sgCountryId },
    { name: '-Box 1', negate: true, country_id: sgCountryId },
    { name: '+Box 6', negate: false, country_id: sgCountryId },
    { name: '-Box 6', negate: false, country_id: sgCountryId },
  ]);
  console.log('   Created 4 tax tags');

  console.log('Tax Distribution Line Tax Tag Relations:');
  await db.insert(taxDistributionLineTaxTagRelTable).values([
    { tax_distribution_line_id: 1, tax_tag_id: 1 },
    { tax_distribution_line_id: 2, tax_tag_id: 3 },
  ]);
  console.log('   Created 2 tax tag relations');

  console.log('Journals:');
  await db.insert(journalTable).values({
    name: 'Sales Invoice',
    sequence_prefix: 'INV',
    type: 'Sales',
  });
  console.log('   Created 1 journal');

  console.log('');
}

async function seedProductData(context: SeedContext): Promise<void> {
  console.log('=== PRODUCT DATA ===');

  console.log('Product Templates:');
  const templates = await db
    .insert(productTemplateTable)
    .values([
      {
        // id: 1
        name: 'Coca-Cola',
        description: 'Classic Coke - refreshing cola beverage',
        uom_id: 1,
        type: 'Goods',
        category: 'Food & Grocery',
        list_price: '2.99',
      },
      {
        // id: 2
        name: 'Pepsi',
        description: 'Pepsi cola - bold and refreshing',
        uom_id: 1,
        type: 'Goods',
        category: 'Food & Grocery',
        list_price: '2.99',
      },
      {
        // id: 3
        name: 'Sprite',
        description: 'Lemon-lime soda - crisp and clean taste',
        uom_id: 1,
        type: 'Goods',
        category: 'Food & Grocery',
        list_price: '2.99',
      },
      {
        // id: 4
        name: 'French Fries',
        description: 'Golden crispy potato fries - salted to perfection',
        uom_id: 1,
        type: 'Goods',
        category: 'Food & Grocery',
        list_price: '3.49',
      },
      {
        // id: 5
        name: 'Chicken Nuggets',
        description: '6-piece chicken nuggets - tender and juicy',
        uom_id: 1,
        type: 'Goods',
        category: 'Food & Grocery',
        list_price: '5.99',
      },
      {
        // id: 6
        name: 'Onion Rings',
        description: 'Beer-battered onion rings - crispy and savory',
        uom_id: 1,
        type: 'Goods',
        category: 'Food & Grocery',
        list_price: '4.29',
      },
      {
        // id: 7
        name: 'Cheeseburger',
        description: 'Classic beef patty with cheese, lettuce, tomato',
        uom_id: 1,
        type: 'Goods',
        category: 'Food & Grocery',
        list_price: '8.99',
      },
      {
        // id: 8
        name: 'Chicken Sandwich',
        description: 'Grilled chicken breast with mayo and pickles',
        uom_id: 1,
        type: 'Goods',
        category: 'Food & Grocery',
        list_price: '7.99',
      },
      {
        // id: 9
        name: 'Fish Sandwich',
        description: 'Crispy fish fillet with tartar sauce',
        uom_id: 1,
        type: 'Goods',
        category: 'Food & Grocery',
        list_price: '6.99',
      },
      {
        // id: 10
        name: 'Apple Pie',
        description: 'Warm apple pie with cinnamon - sweet finish',
        uom_id: 1,
        type: 'Goods',
        category: 'Food & Grocery',
        list_price: '2.49',
      },
      {
        // id: 11
        name: 'Iced Latte',
        description: 'Chilled espresso with milk and ice - refreshing',
        uom_id: 1,
        type: 'Goods',
        category: 'Food & Grocery',
        list_price: '4.99',
      },
      {
        // id: 12
        name: 'Cheeseburger Value Meal',
        description: 'Cheeseburger, fries, and a drink - perfect combo',
        uom_id: 1,
        type: 'Combo',
        category: 'Food & Grocery',
        list_price: '9.99',
      },
      {
        // id: 13
        name: 'Generic Product Template',
        description: 'This is a generic product template for testing.',
        uom_id: 1,
        type: 'Goods',
        category: undefined,
        list_price: '19.99',
      },
    ])
    .returning();

  if (templates.length === 0 || !templates[0]) {
    throw new Error('Failed to create product template');
  }

  // biome-ignore lint/style/noNonNullAssertion: last template is guaranteed to exist
  const genericTemplateId = templates.at(-1)!.id;
  context.templateIds.push(genericTemplateId);
  console.log(`   Created ${templates.length} product templates`);

  console.log('Products:');

  const productsFromFoodTemplates = await db
    .insert(productTable)
    .values(
      templates.slice(0, 12).map((template) => ({
        template_id: template.id,
        sku: `SKU-${template.id}`,
      })),
    )
    .returning();

  context.productIds.push(...productsFromFoodTemplates.map((p) => p.id));
  console.log(`   Created products, one for each of the other templates`);

  const productCount = 30;
  const timestamp = Date.now().toString().slice(-6);
  const productData = Array.from({ length: productCount }, (_, index) => ({
    template_id: genericTemplateId,
    sku: `SKU-${timestamp}-${String(index + 1).padStart(4, '0')}`,
  }));

  const productsFromGenericTemplate = await db
    .insert(productTable)
    .values(productData)
    .returning();

  context.productIds.push(...productsFromGenericTemplate.map((p) => p.id));
  console.log(
    `   Created ${productsFromGenericTemplate.length} products for template #${genericTemplateId}`,
  );

  console.log('Combos:');
  await db.insert(comboTable).values([
    // id: 1
    { name: 'Cheeseburger Choice' },
    // id: 2
    { name: 'Fries Choice' },
    // id: 3
    { name: 'Drink Choice' },
  ]);
  console.log('   Created 3 combos');

  console.log('Combo Products:');
  await db.insert(comboProductTable).values([
    // id: 1
    { combo_id: 1, product_id: 7, extra_price: '0' }, // Cheeseburger
    // id: 2
    { combo_id: 2, product_id: 4, extra_price: '0' }, // Fries
    // id: 3
    { combo_id: 3, product_id: 1, extra_price: '0' }, // Coca-Cola
    // id: 4
    { combo_id: 3, product_id: 2, extra_price: '0' }, // Pepsi
    // id: 5
    { combo_id: 3, product_id: 3, extra_price: '0' }, // Sprite
    // id: 6
    { combo_id: 3, product_id: 11, extra_price: '1.99' }, // Iced Latte
  ]);
  console.log('   Linked six products as choices across three combos.');

  console.log('Template Combos:');
  await db.insert(templateComboTable).values([
    { template_id: 12, combo_id: 1 }, // Cheeseburger Choice
    { template_id: 12, combo_id: 2 }, // Fries Choice
    { template_id: 12, combo_id: 3 }, // Drink Choice
  ]);
  console.log('   Linked a combo-type product to three combos. ');

  console.log('');
}

async function seedStockData(context: SeedContext): Promise<void> {
  console.log('=== STOCK DATA ===');

  console.log('Warehouses:');
  const warehouses = await db
    .insert(warehouseTable)
    .values([
      {
        name: 'Central Warehouse',
        code: 'WH1',
        address: '123 Main St, Springfield',
      },
      {
        name: 'East Distribution Center',
        code: 'WH2',
        address: '456 East St, Riverdale',
      },
      { name: 'West Storage', code: 'WH3', address: '789 West Ave, Hilltown' },
    ])
    .returning();
  context.warehouseIds.push(...warehouses.map((w) => w.id));
  console.log(`   Created ${warehouses.length} warehouses`);

  console.log('Warehouse Locations:');
  const warehouseLocations = await db
    .insert(warehouseLocationTable)
    .values([
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
    ])
    .returning();

  context.warehouseLocationIds.push(...warehouseLocations.map((l) => l.id));
  console.log(`   Created ${warehouseLocations.length} warehouse locations`);

  console.log('Stock Operation Types:');
  void (await db.insert(stockOperationTypeTable).values(
    Object.entries(StockOperationType).map(([name, value]) => ({
      name: value,
      code: name,
      description: `Operation type for ${name.toLowerCase()}`,
    })),
  ));
  console.log(
    `   Created ${Object.keys(StockOperationType).length} stock operation types`,
  );

  console.log('Stock Operations:');
  void (await db.insert(stockOperationTable).values([
    {
      name: 'test',
      status: StockOperationStatus.PROCESSING,
      type_id: 2,
      destination_warehouse_id: 3,
      destination_location_id: null,
    },
    {
      name: 'test 2',
      status: StockOperationStatus.PROCESSING,
      type_id: 2,
      destination_warehouse_id: 3,
      destination_location_id: null,
    },
    {
      name: 'test 3',
      status: StockOperationStatus.PROCESSING,
      type_id: 2,
      destination_warehouse_id: 3,
      destination_location_id: null,
    },
  ]));
  console.log('   Created 3 stock operations');

  console.log('Stock Operation Lines:');
  void (await db.insert(stockOperationLineTable).values([
    // Operation 1 - Import
    {
      stock_operation_id: 1,
      product_id: 2,
      reference_id: 1004,
      planned_quantity: '100',
      processed_quantity: '0',
      quantity_uom_id: 1,
      unit_cost_price: '4.75',
      subtotal_cost: '475.0',
      status: StockOperationLineStatus.PENDING,
      remarks: { batch: 'A1' },
    },
    {
      stock_operation_id: 1,
      product_id: 3,
      reference_id: 1005,
      planned_quantity: '60',
      processed_quantity: '20',
      quantity_uom_id: 1,
      unit_cost_price: '3.2',
      subtotal_cost: '192.0',
      status: StockOperationLineStatus.RESERVED,
      remarks: { batch: 'A2' },
    },
    {
      stock_operation_id: 1,
      product_id: 4,
      reference_id: 1006,
      planned_quantity: '10',
      processed_quantity: '10',
      quantity_uom_id: 1,
      unit_cost_price: '12.0',
      subtotal_cost: '120.0',
      status: StockOperationLineStatus.COMPLETED,
      remarks: { note: 'Urgent' },
    },

    // Operation 2 - Export
    {
      stock_operation_id: 2,
      product_id: 2,
      reference_id: 1007,
      planned_quantity: '40',
      processed_quantity: '20',
      quantity_uom_id: 1,
      unit_cost_price: '6.5',
      subtotal_cost: '260.0',
      status: StockOperationLineStatus.RESERVED,
      remarks: { comment: 'Shipping soon' },
    },
    {
      stock_operation_id: 2,
      product_id: 4,
      reference_id: 1008,
      planned_quantity: '25',
      processed_quantity: '0',
      quantity_uom_id: 1,
      unit_cost_price: '7.0',
      subtotal_cost: '175.0',
      status: StockOperationLineStatus.PENDING,
      remarks: { priority: 'Low' },
    },

    // Operation 3 - Transfer
    {
      stock_operation_id: 3,
      product_id: 4,
      reference_id: 1009,
      planned_quantity: '80',
      processed_quantity: '40',
      quantity_uom_id: 1,
      unit_cost_price: '9.9',
      subtotal_cost: '792.0',
      status: StockOperationLineStatus.RESERVED,
      remarks: { from: 'Zone A', to: 'Zone B' },
    },
    {
      stock_operation_id: 3,
      product_id: 2,
      reference_id: 1010,
      planned_quantity: '50',
      processed_quantity: '50',
      quantity_uom_id: 1,
      unit_cost_price: '8.25',
      subtotal_cost: '412.5',
      status: StockOperationLineStatus.COMPLETED,
      remarks: { validated: true },
    },
    {
      stock_operation_id: 3,
      product_id: 3,
      reference_id: 1011,
      planned_quantity: '35',
      processed_quantity: '0',
      quantity_uom_id: 1,
      unit_cost_price: '10.0',
      subtotal_cost: '350.0',
      status: StockOperationLineStatus.PENDING,
      remarks: { hazmat: false },
    },
  ]));
  console.log('   Created 9 stock operation lines');

  console.log('');
}

async function seedPurchaseData(context: SeedContext): Promise<void> {
  console.log('=== PURCHASE DATA ===');

  const firstPartner = context.partnerIds[0];
  const secondPartner = context.partnerIds[1];
  const firstProduct = context.productIds[0];
  const secondProduct = context.productIds[1];

  if (!firstPartner || !secondPartner || !firstProduct || !secondPartner) {
    throw new Error(
      'Required partner IDs or product IDs not found for purchases',
    );
  }

  console.log('Purchases:');

  const purchaseRequisitionData: InferInsertModel<
    typeof purchaseRequisitionTable
  >[] = [
    {
      // id 1
      title: faker.company.catchPhrase(),
      priority: 'high',
      total_expected_cost: '50',
      status: 'RFQ sent',
      created_by: 2,
      updated_by: 2,
    },
  ];

  const purchaseRequisitionItemData: InferInsertModel<
    typeof purchaseRequisitionItemTable
  >[] = [
    {
      purchase_requisition_id: 1,
      product_id: firstProduct,
      quantity: 2,
      estimated_cost: '50',
    },
  ];

  const purchaseRequisitionPartnerData: InferInsertModel<
    typeof purchaseRequisitionPartnerTable
  >[] = [
    {
      supplier_id: firstPartner,
      purchase_requisition_id: 1,
    },
  ];

  const quotationData: InferInsertModel<typeof quotationTable>[] = [
    {
      supplier_id: firstPartner,
      quotation_type: 'standard',
      total_value: '120',
      created_by: 1,
      updated_by: 1,
    },
  ];

  const purchaseRequisitionQuotationData: InferInsertModel<
    typeof purchaseRequisitionQuotationTable
  >[] = [
    {
      purchase_requisition_id: 1,
      quotation_id: 1,
    },
  ];

  const quotationItemData: InferInsertModel<typeof quotationItemTable>[] = [
    {
      quotation_id: 1,
      product_id: firstProduct,
      unit_price: '60',
      unit_price_with_tax: '60',
      moq: 2,
    },
  ];

  await db.insert(purchaseRequisitionTable).values(purchaseRequisitionData);
  await db
    .insert(purchaseRequisitionItemTable)
    .values(purchaseRequisitionItemData);
  await db
    .insert(purchaseRequisitionPartnerTable)
    .values(purchaseRequisitionPartnerData);
  await db.insert(quotationTable).values(quotationData);
  await db
    .insert(purchaseRequisitionQuotationTable)
    .values(purchaseRequisitionQuotationData);
  await db.insert(quotationItemTable).values(quotationItemData);
}

async function seedSalesData(context: SeedContext): Promise<void> {
  console.log('=== SALES DATA ===');

  const usdId = context.currencyIds.USD;
  const partnerId = context.partnerIds[0];

  if (!usdId || !partnerId) {
    throw new Error('Required currency or partner IDs not found for sales');
  }

  console.log('Orders:');
  const orders = await db
    .insert(orderTable)
    .values([
      {
        name: 'S00001',
        state: 'Sale',
        currency_id: usdId,
        partner_id: partnerId,
        amount_untaxed: '15.47',
        amount_tax: '0.00',
        amount_total: '15.47',
      },
      {
        name: 'S00002',
        state: 'Sale',
        currency_id: usdId,
        partner_id: partnerId,
        amount_untaxed: '13.97',
        amount_tax: '0.00',
        amount_total: '13.97',
      },
      {
        name: 'S00003',
        state: 'Sale',
        currency_id: usdId,
        partner_id: partnerId,
        amount_untaxed: '12.47',
        amount_tax: '0.00',
        amount_total: '12.47',
      },
      {
        name: 'S00004',
        state: 'Sale',
        currency_id: usdId,
        partner_id: partnerId,
        amount_untaxed: '11.98',
        amount_tax: '0.00',
        amount_total: '11.98',
      },
    ])
    .returning();

  context.salesOrderIds.push(...orders.map((o) => o.id));
  console.log(`   Created ${orders.length} orders`);

  if (context.salesOrderIds.length < 4) {
    throw new Error('Not enough orders created for sales data');
  }

  const [order1Id, order2Id, order3Id, order4Id] = context.salesOrderIds;
  if (!order1Id || !order2Id || !order3Id || !order4Id) {
    throw new Error('Missing required order IDs');
  }

  console.log('Order Lines:');
  const orderLines = await db
    .insert(orderLineTable)
    .values([
      // Order 1
      {
        order_id: order1Id,
        sequence: 1,
        product_id: context.productIds[6] || 7, // fallback to hardcoded if not enough products
        description: 'Classic beef patty with cheese, lettuce, tomato',
        type: 'Product' as const,
        quantity: '1',
        unit_price: '8.99',
        price_subtotal: '8.99',
        price_tax: '0.00',
        price_total: '8.99',
      },
      {
        order_id: order1Id,
        sequence: 2,
        product_id: context.productIds[3] || 4,
        description: 'Golden crispy potato fries - salted to perfection',
        type: 'Product' as const,
        quantity: '1',
        unit_price: '3.49',
        price_subtotal: '3.49',
        price_tax: '0.00',
        price_total: '3.49',
      },
      {
        order_id: order1Id,
        sequence: 3,
        product_id: context.productIds[0] || 1,
        description: 'Classic Coke - refreshing cola beverage',
        type: 'Product' as const,
        quantity: '1',
        unit_price: '2.99',
        price_subtotal: '2.99',
        price_tax: '0.00',
        price_total: '2.99',
      },

      // Order 2
      {
        order_id: order2Id,
        sequence: 1,
        product_id: context.productIds[7] || 8,
        description: 'Grilled chicken breast with mayo and pickles',
        type: 'Product' as const,
        quantity: '1',
        unit_price: '7.99',
        price_subtotal: '7.99',
        price_tax: '0.00',
        price_total: '7.99',
      },
      {
        order_id: order2Id,
        sequence: 2,
        product_id: context.productIds[5] || 6,
        description: 'Beer-battered onion rings - crispy and savory',
        type: 'Product' as const,
        quantity: '1',
        unit_price: '4.29',
        price_subtotal: '4.29',
        price_tax: '0.00',
        price_total: '4.29',
      },
      {
        order_id: order2Id,
        sequence: 3,
        product_id: context.productIds[1] || 2,
        description: 'Pepsi cola - bold and refreshing',
        type: 'Product' as const,
        quantity: '1',
        unit_price: '2.99',
        price_subtotal: '2.99',
        price_tax: '0.00',
        price_total: '2.99',
      },

      // Order 3
      {
        order_id: order3Id,
        sequence: 1,
        product_id: context.productIds[8] || 9,
        description: 'Crispy fish fillet with tartar sauce',
        type: 'Product' as const,
        quantity: '1',
        unit_price: '6.99',
        price_subtotal: '6.99',
        price_tax: '0.00',
        price_total: '6.99',
      },
      {
        order_id: order3Id,
        sequence: 2,
        product_id: context.productIds[4] || 5,
        description: '6-piece chicken nuggets - tender and juicy',
        type: 'Product' as const,
        quantity: '1',
        unit_price: '5.99',
        price_subtotal: '5.99',
        price_tax: '0.00',
        price_total: '5.99',
      },
      {
        order_id: order3Id,
        sequence: 3,
        product_id: context.productIds[2] || 3,
        description: 'Lemon-lime soda - crisp and clean taste',
        type: 'Product' as const,
        quantity: '1',
        unit_price: '2.99',
        price_subtotal: '2.99',
        price_tax: '0.00',
        price_total: '2.99',
      },

      // Order 4 - Combo
      {
        order_id: order4Id,
        sequence: 1,
        product_id: context.productIds[11] || 12,
        description: 'Cheeseburger, fries, and a drink - perfect combo',
        type: 'Product' as const,
        quantity: '1',
        unit_price: '9.99',
        price_subtotal: '9.99',
        price_tax: '0.00',
        price_total: '9.99',
        parent_order_line_id: null,
        combo_product_id: null,
      },
    ])
    .returning();

  // Get the parent order line ID for combo components
  const lastOrderLine = orderLines[orderLines.length - 1];
  if (!lastOrderLine) {
    throw new Error('Failed to get parent order line for combo');
  }
  const parentOrderLineId = lastOrderLine.id;

  // Insert combo components
  await db.insert(orderLineTable).values([
    {
      order_id: order4Id,
      sequence: 2,
      product_id: context.productIds[6] || 7,
      description: 'Classic beef patty with cheese, lettuce, tomato',
      type: 'Product' as const,
      quantity: '1',
      unit_price: '0',
      price_subtotal: '0',
      price_tax: '0.00',
      price_total: '0',
      parent_order_line_id: parentOrderLineId,
      combo_product_id: null,
    },
    {
      order_id: order4Id,
      sequence: 3,
      product_id: context.productIds[3] || 4,
      description: 'Golden crispy potato fries - salted to perfection',
      type: 'Product' as const,
      quantity: '1',
      unit_price: '0',
      price_subtotal: '0',
      price_tax: '0.00',
      price_total: '0',
      parent_order_line_id: parentOrderLineId,
      combo_product_id: null,
    },
    {
      order_id: order4Id,
      sequence: 4,
      product_id: context.productIds[10] || 11,
      description: 'Chilled espresso with milk and ice - refreshing',
      type: 'Product' as const,
      quantity: '1',
      unit_price: '1.99',
      price_subtotal: '1.99',
      price_tax: '0.00',
      price_total: '1.99',
      parent_order_line_id: parentOrderLineId,
      combo_product_id: null,
    },
  ]);

  console.log(`   Created ${orderLines.length + 3} order lines`);
  console.log('');
}

async function seedRepairData(context: SeedContext): Promise<void> {
  console.log('=== REPAIR DATA ===');

  console.log('Repair Orders:');
  const repairOrderCount = 75;
  const baseTimestamp = Date.now().toString().slice(-8);

  const repairOrderData = Array.from(
    { length: repairOrderCount },
    (_, index) => {
      const statusWeights = [
        { value: 'new' as const, weight: 0.4 },
        { value: 'confirmed' as const, weight: 0.3 },
        { value: 'under_repair' as const, weight: 0.2 },
        { value: 'repaired' as const, weight: 0.1 },
      ];
      const status = faker.helpers.weightedArrayElement(statusWeights);

      const priorityWeights = [
        { value: 'normal' as const, weight: 0.5 },
        { value: 'high' as const, weight: 0.3 },
        { value: 'low' as const, weight: 0.15 },
        { value: 'urgent' as const, weight: 0.05 },
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
      if (status === 'confirmed' || status === 'under_repair') {
        scheduledRepairDate = faker.date.soon({ days: 30 });
      }

      const assignedTechnicianId =
        status === 'confirmed' || status === 'under_repair'
          ? faker.helpers.arrayElement(context.userIds)
          : null;

      const createdByUserId = faker.helpers.arrayElement(context.userIds);
      const lastModifiedById = faker.datatype.boolean(0.3)
        ? faker.helpers.arrayElement(context.userIds)
        : createdByUserId;

      return {
        company_id: faker.helpers.arrayElement(context.entityIds),
        customer_id: faker.helpers.arrayElement(context.partnerIds),
        assigned_technician_id: assignedTechnicianId,
        product_id: faker.helpers.arrayElement(context.productIds),
        reference_number: `RO${baseTimestamp}${String(index + 1).padStart(3, '0')}`,
        status: status,
        priority: priority,
        custom_properties: customProperties,
        technician_notes: technicianNotes,
        warranty_covered: warrantyCovered,
        parts_delivery_delayed: partsDeliveryDelayed,
        scheduled_repair_date: scheduledRepairDate,
        created_by: createdByUserId,
        updated_by: lastModifiedById,
      };
    },
  );

  const repairOrders = await db
    .insert(repairOrderTable)
    .values(repairOrderData)
    .returning();
  console.log(`   Created ${repairOrders.length} repair orders`);

  console.log('');
}

async function seedServiceData(_context: SeedContext): Promise<void> {
  console.log('=== SERVICE DATA ===');

  console.log('Appointment Types:');
  void (await db.insert(appointmentTypeTable).values([
    {
      name: 'Swim Class (A)',
      appointment_duration: '1',
      appointment_manual_confirmation: false,
      slot_creation_interval: '1',
      min_schedule_hours: '1',
      min_cancellation_hours: '1',
      schedule_based_on: 'users',
      resource_manage_capacity: false,
    },
    {
      name: 'Swim Class (B)',
      appointment_duration: '1',
      appointment_manual_confirmation: false,
      slot_creation_interval: '1',
      min_schedule_hours: '1',
      min_cancellation_hours: '1',
      schedule_based_on: 'users',
      resource_manage_capacity: false,
    },
  ]));
  console.log('   Created 2 appointment types');

  console.log('');
}

async function seedAllData(): Promise<void> {
  const startTime = Date.now();
  console.log('🌱 UNIFIED DATABASE SEEDING STARTED\n');

  const context: SeedContext = {
    countryIds: {},
    currencyIds: {},
    userIds: [],
    entityIds: [],
    partnerIds: [],
    productIds: [],
    templateIds: [],
    salesOrderIds: [],
    purchaseRequisitionIds: [],
    purchaseQuotationIds: [],
    purchaseOrderIds: [],
    warehouseIds: [],
    warehouseLocationIds: [],
  };

  try {
    void (await clearAllTables());
    void (await seedResourceData(context));
    void (await seedAccountingData(context));
    void (await seedProductData(context));
    void (await seedStockData(context));
    void (await seedSalesData(context));
    void (await seedRepairData(context));
    void (await seedServiceData(context));
    void (await seedPurchaseData(context));

    const duration = Date.now() - startTime;
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`Duration: ${duration}ms\n`);

    console.log('📊 SUMMARY:');
    console.log(`Countries: ${Object.keys(context.countryIds).length}`);
    console.log(`Currencies: ${Object.keys(context.currencyIds).length}`);
    console.log(`Users: ${context.userIds.length}`);
    console.log(`Entities: ${context.entityIds.length}`);
    console.log(`Partners: ${context.partnerIds.length}`);
    console.log(`Products: ${context.productIds.length}`);
    console.log(`Templates: ${context.templateIds.length}`);
    console.log(`Sales Orders: ${context.salesOrderIds.length}`);
    console.log(
      `Purchase Requisitions: ${context.purchaseRequisitionIds.length}`,
    );
    console.log(`Purchase Quotations: ${context.purchaseQuotationIds.length}`);
    console.log(`Purchase Orders: ${context.purchaseOrderIds.length}`);
    console.log(`Warehouses: ${context.warehouseIds.length}`);
    console.log(`Warehouse Locations: ${context.warehouseLocationIds.length}`);
    console.log('');
  } catch (error) {
    console.error('❌ SEEDING FAILED:', error);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--clear')) {
    await clearAllTables();
    console.log('✅ Database cleared successfully!');
  } else {
    await seedAllData();
  }
}

if (import.meta.main) {
  await main();
}
