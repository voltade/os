import { faker } from '@faker-js/faker';
import type { InferInsertModel } from 'drizzle-orm';

import {
  accountTable,
  JournalType,
  journalTable,
  TaxDistributionLineDocumentType,
  TaxDistributionLineType,
  taxDistributionLineTable,
  taxDistributionLineTaxTagRelTable,
  taxGroupTable,
  taxTable,
  taxTagTable,
} from '../../schemas/index.ts';
import { db } from '../../utils/db.ts';
import {
  type CountryIds,
  type CurrencyIds,
  clearTables,
  type SeedContext,
} from './utils.ts';

/**
 * Seeds the accounts table with initial data.
 */
async function seedAccounts(currencyIds: CurrencyIds = {}): Promise<number[]> {
  // Ensure required IDs are available
  const sgdId = currencyIds.SGD;
  if (!sgdId) throw new Error('Required currency IDs not found for accounts');
  console.log('Accounts:');

  const accountData: InferInsertModel<typeof accountTable>[] = [
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
  ];

  const accounts = await db
    .insert(accountTable)
    .values(accountData)
    .returning();
  console.log(`   Created ${accounts.length} accounts`);
  if (accounts.length !== accountData.length)
    console.warn(
      `   Warning: Expected ${accountData.length} accounts ` +
        `but got ${accounts.length} accounts`,
    );

  return accounts.map((account) => account.id);
}

/**
 * Seeds the tax groups table with initial data.
 */
async function seedTaxGroups(
  countryIds: CountryIds = {},
  sgEntityId: number | undefined,
): Promise<void> {
  // Ensure required IDs are available
  const sgCountryId = countryIds.Singapore;
  if (!sgCountryId || !sgEntityId)
    throw new Error('Required country or entity IDs not found for tax group');

  const taxGroupData: InferInsertModel<typeof taxGroupTable>[] = [
    {
      name: '9% GST',
      country_id: sgCountryId,
      entity_id: sgEntityId,
      tax_payable_account_id: 2,
      tax_receivable_account_id: 1,
    },
  ];

  console.log('Tax Groups:');
  const taxGroups = await db
    .insert(taxGroupTable)
    .values(taxGroupData)
    .returning();

  console.log(`   Created ${taxGroups.length} tax groups`);
  if (taxGroups.length !== taxGroupData.length)
    console.warn(
      `   Warning: Expected ${taxGroupData.length} tax groups ` +
        `but got ${taxGroups.length} tax groups`,
    );
}

/**
 * Seeds the taxes table with initial data.
 */
async function seedTaxes(countryIds: CountryIds = {}): Promise<number[]> {
  // Ensure required IDs are available
  const sgCountryId = countryIds.Singapore;
  if (!sgCountryId) throw new Error('Required country ID not found for tax');

  const taxData: InferInsertModel<typeof taxTable>[] = [
    {
      name: '9% SR',
      amount: '9.0',
      type: 'Sales',
      country_id: sgCountryId,
      affect_base_of_subsequent_taxes: false,
      base_affected_by_previous_taxes: true,
    },
  ];

  console.log('Taxes:');
  const taxes = await db.insert(taxTable).values(taxData).returning();
  console.log(`   Created ${taxes.length} taxes`);
  if (taxes.length !== taxData.length)
    console.warn(
      `   Warning: Expected ${taxData.length} taxes ` +
        `but got ${taxes.length} taxes`,
    );

  return taxes.map((tax) => tax.id);
}

/**
 * Seeds tax distribution lines for a given tax.
 */
async function seedTaxDistributionLines(
  accountIds: number[] = [],
  taxIds: number[] = [],
): Promise<number[]> {
  // Ensure required IDs are available
  if (accountIds.length === 0 || taxIds.length === 0)
    throw new Error(
      'Required account or tax IDs not found for tax distribution lines',
    );

  console.log('Tax Distribution Lines:');
  const taxDistributionLineData = Array.from(
    { length: faker.number.int({ min: 5, max: 20 }) },
    () => {
      const taxDistributionLine: InferInsertModel<
        typeof taxDistributionLineTable
      > = {
        tax_id: faker.helpers.arrayElement(taxIds),
        document_type: faker.helpers.enumValue(TaxDistributionLineDocumentType),
        type: faker.helpers.enumValue(TaxDistributionLineType),
        factor_percentage: faker.helpers.maybe(
          () =>
            faker.number
              .float({ min: 0, max: 100, fractionDigits: 2 })
              .toString(),
          { probability: 0.8 },
        ),
        account_id: faker.helpers.maybe(
          () => faker.helpers.arrayElement(accountIds),
          { probability: 0.8 },
        ),
      };
      return taxDistributionLine;
    },
  );

  const taxDistributionLines = await db
    .insert(taxDistributionLineTable)
    .values(taxDistributionLineData)
    .returning();
  console.log(
    `   Created ${taxDistributionLines.length} tax distribution lines`,
  );
  if (taxDistributionLines.length !== taxDistributionLineData.length)
    console.warn(
      `   Warning: Expected ${taxDistributionLineData.length} tax distribution lines ` +
        `but got ${taxDistributionLines.length} tax distribution lines`,
    );

  return taxDistributionLines.map((line) => line.id);
}

/**
 * Seeds tax tags for the accounting system.
 */
async function seedTaxTags(countryIds: CountryIds = {}): Promise<number[]> {
  // Ensure required IDs are available
  const sgCountryId = countryIds.Singapore;
  if (!sgCountryId) throw new Error('Required country ID not found for tax');

  console.log('Tax Tags:');
  const taxTagData = Array.from(
    { length: faker.number.int({ min: 5, max: 20 }) },
    () => {
      const negate = faker.datatype.boolean();
      const taxTag: InferInsertModel<typeof taxTagTable> = {
        name: `${negate ? '-' : '+'}Box ${faker.number.int({ min: 1, max: 6 })}`,
        negate,
        country_id: sgCountryId,
      };
      return taxTag;
    },
  );

  const taxTags = await db.insert(taxTagTable).values(taxTagData).returning();
  console.log(`   Created ${taxTags.length} tax tags`);
  if (taxTags.length !== taxTagData.length)
    console.warn(
      `   Warning: Expected ${taxTagData.length} tax tags ` +
        `but got ${taxTags.length} tax tags`,
    );

  return taxTags.map((tag) => tag.id);
}

/**
 * Seeds the tax distribution line and tax tag relations.
 */
async function seedTaxDistributionLineTaxTagRelations(
  taxDistributionLineIds: number[] = [],
  taxTagIds: number[] = [],
): Promise<void> {
  // Ensure required IDs are available
  if (taxDistributionLineIds.length === 0 || taxTagIds.length === 0)
    throw new Error(
      'Required tax distribution line or tax tag IDs not found for relations',
    );

  console.log('Tax Distribution Line Tax Tag Relations:');
  const taxDistributionLineTaxTagData = Array.from(
    { length: faker.number.int({ min: 5, max: 20 }) },
    () => {
      const taxDistributionLineTaxTag: InferInsertModel<
        typeof taxDistributionLineTaxTagRelTable
      > = {
        tax_distribution_line_id: faker.helpers.arrayElement(
          taxDistributionLineIds,
        ),
        tax_tag_id: faker.helpers.arrayElement(taxTagIds),
      };
      return taxDistributionLineTaxTag;
    },
  );

  const uniqueRelations: {
    [x: string]: InferInsertModel<typeof taxDistributionLineTaxTagRelTable>;
  } = {};
  taxDistributionLineTaxTagData.forEach((relation) => {
    const key = `${relation.tax_distribution_line_id}-${relation.tax_tag_id}`;
    if (!uniqueRelations[key]) uniqueRelations[key] = relation;
  });

  const taxDistributionLineTags = await db
    .insert(taxDistributionLineTaxTagRelTable)
    .values(Object.values(uniqueRelations))
    .returning();
  console.log(`   Created ${taxDistributionLineTags.length} tax tag relations`);
  if (taxDistributionLineTags.length !== Object.values(uniqueRelations).length)
    console.warn(
      `   Warning: Expected ${Object.values(uniqueRelations).length} tax tag relations ` +
        `but got ${taxDistributionLineTags.length} tax tag relations`,
    );
}

/**
 * Seeds the journals table with initial data.
 */
async function seedJournals(): Promise<void> {
  console.log('Journals:');
  const journalData: InferInsertModel<typeof journalTable>[] = [
    {
      name: 'Sales Invoice',
      sequence_prefix: 'INV',
      type: JournalType.SALES,
    },
    {
      name: 'Purchase Invoice',
      sequence_prefix: 'PINV',
      type: JournalType.PURCHASES,
    },
  ];

  const journals = await db
    .insert(journalTable)
    .values(journalData)
    .returning();
  console.log(`   Created ${journals.length} journals`);
  if (journals.length !== journalData.length)
    console.warn(
      `   Warning: Expected ${journalData.length} journals ` +
        `but got ${journals.length} journals`,
    );
}

/**
 * Seeds the accounting data including accounts, tax groups, and related entities.
 *
 * @param context - The seed context to update with created IDs.
 * @returns Updated seed context with new IDs.
 */
export async function seedAccountingData(
  context: SeedContext = {},
): Promise<SeedContext> {
  console.log('=== ACCOUNTING DATA ===');

  const accountIds = await seedAccounts(context.currencyIds);
  const taxIds = await seedTaxes(context.countryIds);
  context = {
    ...context,
    accountIds,
    taxIds,
  };

  await seedTaxGroups(context.countryIds, context.entityIds?.[0]);
  const taxDistributionLineIds = await seedTaxDistributionLines(
    accountIds,
    taxIds,
  );
  const taxTagIds = await seedTaxTags(context.countryIds);
  context = {
    ...context,
    taxDistributionLineIds,
    taxTagIds,
  };

  await seedTaxDistributionLineTaxTagRelations(
    taxDistributionLineIds,
    taxTagIds,
  );
  await seedJournals();

  console.log('=== ACCOUNTING DATA SEEDING COMPLETE ===\n');
  return context;
}

/**
 * Clears all accounting-related data from the database.
 *
 * The order of truncation should follow the reverse order of seeding
 * to avoid foreign key constraints.
 */
export async function clearAccountingData(): Promise<void> {
  console.log('Clearing accounting data...');

  await clearTables(
    journalTable,
    taxDistributionLineTaxTagRelTable,
    taxTagTable,
    taxDistributionLineTable,
    taxGroupTable,
    taxTable,
    accountTable,
  );

  console.log('Accounting data cleared successfully\n');
}
