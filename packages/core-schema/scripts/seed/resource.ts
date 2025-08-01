import { faker } from '@faker-js/faker';
import { ClientWriteStatus, type TupleKey } from '@openfga/sdk';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import { db } from '../../lib/db.ts';
import fgaClient from '../../lib/openfga.ts';
import {
  countryTable,
  currencyTable,
  entityTable,
  partnerTable,
  sequenceTable,
  uomTable,
  userTable,
} from '../../schemas/index.ts';
import { appEnvVariables } from '../../utils/env.ts';
import {
  type CountryIds,
  type CurrencyIds,
  clearTables,
  type EntityIds,
  ORG_ROLES,
  ORG_TEAMS,
  type PartnerIds,
  type SeedContext,
  type UomIds,
  type UserIds,
} from './utils.ts';

const { FGA_AUTHORIZATION_MODEL_ID } = appEnvVariables;

// region OpenFGA
/**
 * Seeds the organization data.
 */
async function seedOrganization(): Promise<void> {
  console.log('Organization:');

  const teamTuples = Object.values(ORG_TEAMS).map((team) => {
    // All teams are members of the single organization
    const tuple: TupleKey = {
      user: `${team}#member`,
      relation: 'member',
      object: 'organization:organization',
    };
    return tuple;
  });

  const result = await fgaClient?.writeTuples(teamTuples, {
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
      `   Failed to write ${failedCount}/${teamTuples.length} organization-team tuples to OpenFGA`,
    );
  else
    console.log(
      `   Successfully wrote ${teamTuples.length} organization-team tuples to OpenFGA`,
    );
}

/**
 * Seeds the teams in OpenFGA.
 */
async function seedTeams(
  users: InferSelectModel<typeof userTable>[],
): Promise<UserIds> {
  console.log('Teams:');
  const roleWeights: Array<{
    value: ORG_ROLES;
    weight: number;
  }> = [
    { value: ORG_ROLES.MEMBER, weight: 0.5 },
    { value: ORG_ROLES.MANAGER, weight: 0.4 },
    { value: ORG_ROLES.HEAD, weight: 0.1 },
  ];

  // Create tuples for each user in each team
  const tupleMap: { [tuple: string]: number } = {};
  const userTuples = users.map((user) => {
    const team = faker.helpers.enumValue(ORG_TEAMS);
    const role = faker.helpers.weightedArrayElement(roleWeights);

    const tuple: TupleKey = {
      user: `user:${user.id}`,
      relation: role,
      object: team,
    };
    tupleMap[JSON.stringify(tuple)] = user.id;

    return tuple;
  });

  const result = await fgaClient?.writeTuples(userTuples, {
    authorizationModelId: FGA_AUTHORIZATION_MODEL_ID,
  });

  let failedCount = 0;
  result?.writes.forEach((write) => {
    if (write.status === ClientWriteStatus.SUCCESS) return;

    failedCount++;
    console.error(
      `Failed write for tuple ${JSON.stringify(write.tuple_key)}: ${write.err?.message || 'Unknown error'}`,
    );
    delete tupleMap[JSON.stringify(write.tuple_key)];
  });

  if (failedCount > 0)
    console.warn(
      `   Failed to write ${failedCount}/${userTuples.length} team-user tuples to OpenFGA`,
    );
  else
    console.log(
      `   Successfully wrote ${userTuples.length} team-user tuples to OpenFGA`,
    );

  return Object.entries(tupleMap).reduce((acc, [tuple, userId]) => {
    const { relation, object } = JSON.parse(tuple) as TupleKey;
    const team = object as keyof typeof ORG_TEAMS;
    const role = relation as keyof typeof ORG_ROLES;

    if (!acc[team]) acc[team] = {} as Record<keyof typeof ORG_ROLES, number[]>;
    if (!acc[team][role]) acc[team][role] = [];
    acc[team][role].push(userId);
    return acc;
  }, {} as UserIds);
}
// endregion

// region Database
/**
 * Seeds the countries table with predefined countries.
 * Returns a mapping of country names to their IDs.
 */
async function seedCountries(): Promise<CountryIds> {
  console.log('Countries:');

  // Hardcoded countries for Singapore and US
  const countrySg: InferInsertModel<typeof countryTable> = {
    code: 'SG',
    name: 'Singapore',
  };
  const countryUs: InferInsertModel<typeof countryTable> = {
    code: 'US',
    name: 'United States',
  };
  const countryData = [countrySg, countryUs];

  const countries = await db
    .insert(countryTable)
    .values(countryData)
    .returning();

  if (countries.length !== countryData.length)
    throw new Error(
      `Expected ${countryData.length} countries ` +
        `but got ${countries.length} countries`,
    );
  console.log(`   Created ${countries.length} countries`);

  const countryIds: CountryIds = {
    // biome-ignore lint/style/noNonNullAssertion: country is guaranteed to exist
    SG: countries[countryData.indexOf(countrySg)]!.id,
    // biome-ignore lint/style/noNonNullAssertion: country is guaranteed to exist
    US: countries[countryData.indexOf(countryUs)]!.id,
  };
  return countryIds;
}

/**
 * Seeds the currencies table with predefined currencies.
 * Returns a mapping of currency names to their IDs.
 */
async function seedCurrencies(): Promise<CurrencyIds> {
  console.log('Currencies:');

  // Hardcoded currencies for Singapore and US
  const currencySg: InferInsertModel<typeof currencyTable> = {
    name: 'SGD',
    full_name: 'Singapore Dollar',
    symbol: '$',
    decimal_places: 2,
  };
  const currencyUs: InferInsertModel<typeof currencyTable> = {
    name: 'USD',
    full_name: 'US Dollar',
    symbol: '$',
    decimal_places: 2,
  };
  const currencyData = [currencySg, currencyUs];

  const currencies = await db
    .insert(currencyTable)
    .values(currencyData)
    .returning();

  if (currencies.length !== currencyData.length)
    throw new Error(
      `Expected ${currencyData.length} currencies ` +
        `but got ${currencies.length} currencies`,
    );
  console.log(`   Created ${currencies.length} currencies`);

  const currencyIds: CurrencyIds = {
    // biome-ignore lint/style/noNonNullAssertion: currency is guaranteed to exist
    SG: currencies[currencyData.indexOf(currencySg)]!.id,
    // biome-ignore lint/style/noNonNullAssertion: currency is guaranteed to exist
    US: currencies[currencyData.indexOf(currencyUs)]!.id,
  };
  return currencyIds;
}

/**
 * Seeds the users table with a system user and additional random users.
 * Returns an array of user IDs.
 */
async function seedUsers(): Promise<UserIds> {
  // Create the system user
  // The system user is not added to the OpenFGA model
  // as organization admins are only granted time-based access
  console.log('System User:');
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

  return await seedTeams(users);
}

/**
 * Seeds the entities table with a predefined entity and additional random entities.
 * Returns an array of entity IDs.
 */
async function seedEntities(
  countryIds: CountryIds,
  currencyIds: CurrencyIds,
): Promise<EntityIds> {
  console.log('Entities:');

  // Hardcoded entity for Singapore
  const [sgEntity] = await db
    .insert(entityTable)
    .values({
      name: 'Voltade Pte Ltd',
      country_id: countryIds.SG,
      currency_id: currencyIds.SG,
      email: 'team@voltade.com',
      email_domain: 'voltade.com',
    })
    .returning();

  if (!sgEntity) throw new Error('Failed to create Singapore entity');
  console.log(`   Created Singapore entity with ID ${sgEntity.id}`);
  const entityIds: EntityIds = { SG: sgEntity.id };

  // Add additional random entities
  const entityData = Array.from(
    { length: faker.number.int({ min: 10, max: 20 }) },
    () => {
      const companyName = faker.company.name().trim();
      const emailDomain = `${companyName
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .toLowerCase()
        .split(' ')
        .filter(Boolean)
        .join('.')}.com`;

      const value: InferInsertModel<typeof entityTable> = {
        name: companyName,
        country_id: countryIds.US,
        currency_id: currencyIds.US,
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

  entities.forEach((entity) => {
    entityIds[entity.name] = entity.id;
  });
  return entityIds;
}

/**
 * Seeds the partners table with random partners.
 * Returns an array of partner IDs.
 */
async function seedPartners(currencyIds: CurrencyIds): Promise<PartnerIds> {
  console.log('Partners:');

  // Create a hardcoded partner for Singapore
  const sgPartner: InferInsertModel<typeof partnerTable> = {
    name: 'Voltade Pte Ltd',
    currency_id: currencyIds.SG,
    phone: '+65 1234 5678',
    email: 'team@voltade.com',
    email_domain: 'voltade.com',
  };

  const [partnerSg] = await db
    .insert(partnerTable)
    .values(sgPartner)
    .returning();
  if (!partnerSg) throw new Error('Failed to create Singapore partner');
  console.log(`   Created Singapore partner with ID ${partnerSg.id}`);
  const partnerIds: PartnerIds = { SG: partnerSg.id };

  // Create additional random partners
  const partnerData = Array.from(
    { length: faker.number.int({ min: 10, max: 20 }) },
    () => {
      const companyName = faker.company.name().trim();
      const emailDomain = `${companyName
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .toLowerCase()
        .split(' ')
        .filter(Boolean)
        .join('.')}.com`;

      const value: InferInsertModel<typeof partnerTable> = {
        name: companyName,
        currency_id: currencyIds.US,
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

  partners.forEach((partner) => {
    partnerIds[partner.name] = partner.id;
  });
  return partnerIds;
}

/**
 * Seeds the units of measure table with predefined units.
 * This includes both reference units and derived units.
 */
async function seedUnitsOfMeasure(): Promise<UomIds> {
  console.log('Units of Measure:');

  // Predefined units of measure
  // Reference units are the base units for each category
  const pcUom: InferInsertModel<typeof uomTable> = {
    name: 'Piece',
    code: 'pc',
    category: 'piece',
    is_reference: true,
    conversion_ratio: '1',
    rounding: '1',
  };
  const kgUom: InferInsertModel<typeof uomTable> = {
    name: 'Kilogram',
    code: 'kg',
    category: 'weight',
    is_reference: true,
    conversion_ratio: '1',
    rounding: '0.01',
  };
  const lUom: InferInsertModel<typeof uomTable> = {
    name: 'Liter',
    code: 'l',
    category: 'volume',
    is_reference: true,
    conversion_ratio: '1',
    rounding: '0.01',
  };
  const mUom: InferInsertModel<typeof uomTable> = {
    name: 'Meter',
    code: 'm',
    category: 'length',
    is_reference: true,
    conversion_ratio: '1',
    rounding: '0.01',
  };
  const sqmUom: InferInsertModel<typeof uomTable> = {
    name: 'Square meter',
    code: 'm²',
    category: null,
    is_reference: false,
    conversion_ratio: null,
    rounding: '0.01',
  };
  const setUom: InferInsertModel<typeof uomTable> = {
    name: 'Set',
    code: 'set',
    category: null,
    is_reference: false,
    conversion_ratio: null,
    rounding: '1',
  };
  const prUom: InferInsertModel<typeof uomTable> = {
    name: 'Pair',
    code: 'pr',
    category: null,
    is_reference: false,
    conversion_ratio: null,
    rounding: '1',
  };

  // Derived units are based on the reference units with conversion ratios
  const packUom: InferInsertModel<typeof uomTable> = {
    name: 'Pack',
    code: 'pk',
    category: 'piece',
    is_reference: false,
    conversion_ratio: '10',
    rounding: '1',
  };
  const boxUom: InferInsertModel<typeof uomTable> = {
    name: 'Box',
    code: 'bx',
    category: 'piece',
    is_reference: false,
    conversion_ratio: '24',
    rounding: '1',
  };
  const dozenUom: InferInsertModel<typeof uomTable> = {
    name: 'Dozen',
    code: 'dz',
    category: 'piece',
    is_reference: false,
    conversion_ratio: '12',
    rounding: '1',
  };
  const gramUom: InferInsertModel<typeof uomTable> = {
    name: 'Gram',
    code: 'g',
    category: 'weight',
    is_reference: false,
    conversion_ratio: '0.001',
    rounding: '0.01',
  };
  const poundUom: InferInsertModel<typeof uomTable> = {
    name: 'Pound',
    code: 'lb',
    category: 'weight',
    is_reference: false,
    conversion_ratio: '0.45359237',
    rounding: '0.01',
  };
  const ounceUom: InferInsertModel<typeof uomTable> = {
    name: 'Ounce',
    code: 'oz',
    category: 'weight',
    is_reference: false,
    conversion_ratio: '0.02834952',
    rounding: '0.01',
  };
  const milliliterUom: InferInsertModel<typeof uomTable> = {
    name: 'Milliliter',
    code: 'ml',
    category: 'volume',
    is_reference: false,
    conversion_ratio: '0.001',
    rounding: '0.01',
  };
  const gallonUom: InferInsertModel<typeof uomTable> = {
    name: 'Gallon',
    code: 'gal',
    category: 'volume',
    is_reference: false,
    conversion_ratio: '3.78541',
    rounding: '0.01',
  };
  const centimeterUom: InferInsertModel<typeof uomTable> = {
    name: 'Centimeter',
    code: 'cm',
    category: 'length',
    is_reference: false,
    conversion_ratio: '0.01',
    rounding: '0.01',
  };
  const inchUom: InferInsertModel<typeof uomTable> = {
    name: 'Inch',
    code: 'in',
    category: 'length',
    is_reference: false,
    conversion_ratio: '0.0254',
    rounding: '0.01',
  };
  const footUom: InferInsertModel<typeof uomTable> = {
    name: 'Foot',
    code: 'ft',
    category: 'length',
    is_reference: false,
    conversion_ratio: '0.3048',
    rounding: '0.01',
  };

  const uomData = [
    pcUom,
    kgUom,
    lUom,
    mUom,
    sqmUom,
    setUom,
    prUom,
    packUom,
    boxUom,
    dozenUom,
    gramUom,
    poundUom,
    ounceUom,
    milliliterUom,
    gallonUom,
    centimeterUom,
    inchUom,
    footUom,
  ];

  const uom = await db.insert(uomTable).values(uomData).returning();
  console.log(`   Created ${uom.length} units of measure`);
  if (uom.length !== uomData.length)
    console.warn(
      `   Warning: Expected ${uomData.length} units of measure ` +
        `but got ${uom.length} units of measure`,
    );

  const uomIds: UomIds = uom.reduce<UomIds>((acc, u) => {
    acc[u.code.toUpperCase()] = u.id;
    return acc;
  }, {} as UomIds);
  return uomIds;
}

/**
 * Seeds the sequences table with predefined sequences for purchase requisitions,
 * purchase orders, and purchase quotations.
 */
async function seedSequences(): Promise<void> {
  console.log('Sequences:');

  /**
   * Predefined sequences for purchase requisitions, orders, and quotations.
   *
   * @see {@link schemas/resources/functions/alter_reference_defaults.sql}
   */
  const prSequence: InferInsertModel<typeof sequenceTable> = {
    type: 'purchase_requisition',
    prefix: 'PR',
  };
  const poSequence: InferInsertModel<typeof sequenceTable> = {
    type: 'purchase_order',
    prefix: 'PO',
  };
  const qoSequence: InferInsertModel<typeof sequenceTable> = {
    type: 'purchase_quotation',
    prefix: 'QO',
  };
  const soSequence: InferInsertModel<typeof sequenceTable> = {
    type: 'sales_order',
    prefix: 'SO',
  };
  const sequenceData = [prSequence, poSequence, qoSequence, soSequence];

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
// endregion

// region Drivers
/**
 * Seeds the resource data including countries, currencies, users,
 * entities, partners, units of measure, and sequences.
 *
 * @param context - The seed context to update with created IDs.
 * @returns Updated seed context with new IDs.
 */
export async function seedResourceData(
  context: SeedContext = {},
): Promise<SeedContext> {
  console.log('=== RESOURCE DATA ===');

  await seedOrganization();

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
// endregion
