import { faker } from '@faker-js/faker';
import type { InferInsertModel } from 'drizzle-orm';

import { db } from '../../lib/db.ts';
import {
  countryTable,
  currencyTable,
  entityTable,
  partnerTable,
  sequenceTable,
  uomTable,
  userTable,
} from '../../schemas/index.ts';
import {
  type CountryIds,
  type CurrencyIds,
  clearTables,
  type SeedContext,
} from './utils.ts';

/**
 * Seeds the countries table with predefined countries.
 * Returns a mapping of country names to their IDs.
 */
async function seedCountries(): Promise<CountryIds> {
  console.log('Countries:');

  const seedCountry: InferInsertModel<typeof countryTable>[] = [
    { code: 'SG', name: 'Singapore' },
    { code: 'US', name: 'United States' },
  ];

  const countries = await db
    .insert(countryTable)
    .values(seedCountry)
    .returning();

  console.log(`   Created ${countries.length} countries`);
  if (countries.length !== seedCountry.length)
    console.warn(
      `   Warning: Expected ${seedCountry.length} countries ` +
        `but got ${countries.length} countries`,
    );

  return countries.reduce<CountryIds>((acc, country) => {
    acc[country.name] = country.id;
    return acc;
  }, {} as CountryIds);
}

/**
 * Seeds the currencies table with predefined currencies.
 * Returns a mapping of currency names to their IDs.
 */
async function seedCurrencies(): Promise<CurrencyIds> {
  console.log('Currencies:');

  const seedCurrencies = [
    {
      name: 'SGD',
      full_name: 'Singapore Dollar',
      symbol: '$',
      decimal_places: 2,
    },
    { name: 'USD', full_name: 'US Dollar', symbol: '$', decimal_places: 2 },
  ];

  const currencies = await db
    .insert(currencyTable)
    .values(seedCurrencies)
    .returning();

  console.log(`   Created ${currencies.length} currencies`);
  if (currencies.length !== seedCurrencies.length)
    console.warn(
      `   Warning: Expected ${seedCurrencies.length} currencies ` +
        `but got ${currencies.length} currencies`,
    );

  return currencies.reduce<CurrencyIds>((acc, currency) => {
    acc[currency.name] = currency.id;
    return acc;
  }, {} as CurrencyIds);
}

/**
 * Seeds the users table with a system user and additional random users.
 * Returns an array of user IDs.
 */
async function seedUsers(): Promise<number[]> {
  const userIds: number[] = [];

  console.log('System User (ID 1):');
  const [systemUser] = await db
    .insert(userTable)
    .values([
      {
        first_name: 'System',
        last_name: 'User',
      },
    ])
    .returning();

  if (!systemUser) throw new Error('Failed to create System User');
  userIds.push(systemUser.id);
  console.log(`   Created System User with ID ${systemUser.id}`);

  console.log('Users:');
  const userData = Array.from(
    { length: faker.number.int({ min: 20, max: 50 }) },
    () => {
      const user: InferInsertModel<typeof userTable> = {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        created_by: systemUser.id,
        updated_by: systemUser.id,
      };
      return user;
    },
  );

  const users = await db.insert(userTable).values(userData).returning();
  console.log(`   Created ${users.length} additional users`);
  if (users.length !== userData.length)
    console.warn(
      `   Warning: Expected ${userData.length + 1} users ` +
        `but got ${users.length + 1} users`,
    );

  userIds.push(...users.map((u) => u.id));
  return userIds;
}

/**
 * Seeds the entities table with a predefined entity and additional random entities.
 * Returns an array of entity IDs.
 */
async function seedEntities(
  countryIds: CountryIds,
  currencyIds: CurrencyIds,
): Promise<number[]> {
  // Ensure we have the required country and currency IDs
  const sgdId = currencyIds.SGD;
  const usdId = currencyIds.USD;
  const sgCountryId = countryIds.Singapore;
  const usCountryId = countryIds['United States'];

  if (!sgdId || !usdId || !sgCountryId || !usCountryId)
    throw new Error('Required country or currency IDs not found');

  console.log('Entities:');
  const entityIds: number[] = [];

  const [sgEntity] = await db
    .insert(entityTable)
    .values({
      name: 'Voltade Pte Ltd',
      country_id: sgCountryId,
      currency_id: sgdId,
      email: 'team@voltade.com',
      email_domain: 'voltade.com',
    })
    .returning();

  if (!sgEntity) throw new Error('Failed to create Singapore entity');
  entityIds.push(sgEntity.id);

  const entityData = Array.from(
    { length: faker.number.int({ min: 10, max: 20 }) },
    () => {
      const companyName = faker.company.name().trim();
      const emailDomain = `${companyName
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .toLowerCase()
        .split(' ')
        .join('.')}.com`;
      const value: InferInsertModel<typeof entityTable> = {
        name: companyName,
        country_id: usCountryId,
        currency_id: usdId,
        email: faker.internet.email({
          provider: emailDomain,
          allowSpecialCharacters: true,
        }),
        email_domain: emailDomain,
      };
      return value;
    },
  );

  const entities = await db.insert(entityTable).values(entityData).returning();
  console.log(`   Created ${entities.length} additional entities`);
  if (entities.length !== entityData.length)
    console.warn(
      `   Warning: Expected ${entityData.length + 1} entities ` +
        `but got ${entities.length + 1} entities`,
    );

  entityIds.push(...entities.map((e) => e.id));
  return entityIds;
}

/**
 * Seeds the partners table with random partners.
 * Returns an array of partner IDs.
 */
async function seedPartners(currencyIds: CurrencyIds): Promise<number[]> {
  // Ensure we have the required currency ID
  const usdId = currencyIds.USD;
  if (!usdId) throw new Error('USD currency ID not found');

  console.log('Partners:');
  const partnerData = Array.from(
    { length: faker.number.int({ min: 10, max: 20 }) },
    () => {
      const companyName = faker.company.name().trim();
      const emailDomain = `${companyName
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .toLowerCase()
        .split(' ')
        .join('.')}.com`;
      const value: InferInsertModel<typeof partnerTable> = {
        name: companyName,
        currency_id: usdId,
        phone: faker.phone.number({ style: 'international' }),
        email: faker.internet.email({
          provider: emailDomain,
          allowSpecialCharacters: true,
        }),
        email_domain: emailDomain,
      };
      return value;
    },
  );

  const partners = await db
    .insert(partnerTable)
    .values(partnerData)
    .returning();
  console.log(`   Created ${partners.length} partners`);
  if (partners.length !== partnerData.length)
    console.warn(
      `   Warning: Expected ${partnerData.length} partners ` +
        `but got ${partners.length} partners`,
    );

  return partners.map((p) => p.id);
}

/**
 * Seeds the units of measure table with predefined units.
 * This includes both reference units and derived units.
 */
async function seedUnitsOfMeasure(): Promise<number[]> {
  console.log('Units of Measure:');

  const uomData: InferInsertModel<typeof uomTable>[] = [
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
  ];

  const uom = await db.insert(uomTable).values(uomData).returning();
  console.log(`   Created ${uom.length} units of measure`);
  if (uom.length !== uomData.length)
    console.warn(
      `   Warning: Expected ${uomData.length} units of measure ` +
        `but got ${uom.length} units of measure`,
    );

  return uom.map((u) => u.id);
}

/**
 * Seeds the sequences table with predefined sequences for purchase requisitions,
 * purchase orders, and purchase quotations.
 */
async function seedSequences(): Promise<void> {
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

  const sequences = await db
    .insert(sequenceTable)
    .values(sequenceData)
    .returning();
  console.log(`   Created ${sequences.length} sequence(s)`);
  if (sequences.length !== sequenceData.length)
    console.warn(
      `   Warning: Expected ${sequenceData.length} sequences ` +
        `but got ${sequences.length} sequences`,
    );
}

/**
 * Seeds the resource data including countries, currencies, users,
 * entities, partners, units of measure, and sequences.
 *
 * @param context - The seed context to update with created IDs.
 * @returns Updated seed context with new IDs.
 */
export async function seedResourceData(
  context: SeedContext,
): Promise<SeedContext> {
  console.log('=== RESOURCE DATA ===');

  const countryIds = await seedCountries();
  const currencyIds = await seedCurrencies();
  context = {
    ...context,
    countryIds,
    currencyIds,
  };

  context.userIds = await seedUsers();
  context.entityIds = await seedEntities(countryIds, currencyIds);
  context.partnerIds = await seedPartners(currencyIds);
  context.uomIds = await seedUnitsOfMeasure();
  await seedSequences();

  console.log('=== RESOURCE DATA SEEDING COMPLETE ===\n');
  return context;
}

/**
 * Clears all resource-related data from the database.
 * This includes countries, currencies, users, entities, partners,
 * units of measure, and sequences.
 *
 * The order of truncation should follow the reverse order of seeding
 * to avoid foreign key constraints.
 */
export async function clearResourceData(): Promise<void> {
  console.log('Clearing resource data...');

  // Clear the tables in reverse order of seeding
  await clearTables(
    sequenceTable,
    uomTable,
    partnerTable,
    entityTable,
    userTable,
    currencyTable,
    countryTable,
  );

  console.log('Resource data cleared successfully\n');
}
