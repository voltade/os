import { faker } from '@faker-js/faker';
import { ClientWriteStatus, type TupleKey } from '@openfga/sdk';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import { db } from '../../lib/db.ts';
import fgaClient from '../../lib/openfga.ts';
import {
  AccountCategory,
  accountTable,
  JournalType,
  journalTable,
  TaxDistributionLineDocumentType,
  TaxDistributionLineType,
  TaxType,
  taxDistributionLineTable,
  taxDistributionLineTaxTagRelTable,
  taxGroupTable,
  taxTable,
  taxTagTable,
} from '../../schemas/index.ts';
import { appEnvVariables } from '../../utils/env.ts';
import {
  type CountryIds,
  type CurrencyIds,
  clearTables,
  type EntityIds,
  ORG_FOLDERS,
  ORG_TEAMS,
  type SeedContext,
} from './utils.ts';

const { FGA_AUTHORIZATION_MODEL_ID } = appEnvVariables;

type AccountIds = { PAYABLE: number; RECEIVABLE: number } & {
  [name: string]: number;
};
type TaxIds = { SG: number } & {
  [name: string]: number;
};
type TaxTagIds = { TAG_1: number; TAG_2: number } & {
  [name: string]: number;
};
type TaxDistributionLineIds = { LINE_1: number; LINE_2: number } & {
  [name: string]: number;
};

// region OpenFGA
/**
 * Seeds the accounting folder in OpenFGA.
 * This folder is used to aggregate accounting-related permissions.
 */
async function seedAccountingFolder(): Promise<void> {
  console.log('Accounting Folder:');

  const accountingFolder: TupleKey = {
    user: ORG_TEAMS.FINANCE,
    relation: 'owner_team',
    object: ORG_FOLDERS.INVOICES,
  };

  // const result = await fgaClient?.writeTuples([accountingFolder], {
  //   authorizationModelId: FGA_AUTHORIZATION_MODEL_ID,
  // });
  // result?.writes.forEach((write) => {
  //   if (write.status === ClientWriteStatus.SUCCESS)
  //     console.log(`   Created folder: ${accountingFolder.object}`);
  //   else {
  //     console.warn(
  //       `   Warning: Failed to create folder ${accountingFolder.object}`,
  //     );
  //     console.error(
  //       `Failed write for tuple ${JSON.stringify(write.tuple_key)}: ${write.err?.message || 'Unknown error'}`,
  //     );
  //   }
  // });
}

/**
 * Seeds the journal tuples in OpenFGA.
 */
async function seedJournalTuples(
  journals: InferSelectModel<typeof journalTable>[],
): Promise<void> {
  console.log('Journal Tuples:');

  const journalTuples = journals.map((journal) => {
    const tuple: TupleKey = {
      user: ORG_FOLDERS.INVOICES,
      relation: 'crud_folder',
      object: `invoice:${journal.id}`,
    };
    return tuple;
  });

  // const result = await fgaClient?.writeTuples(journalTuples, {
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
  //     `   Failed to write ${failedCount}/${journalTuples.length} folder-invoice tuples to OpenFGA`,
  //   );
  // else
  //   console.log(
  //     `   Successfully wrote ${journalTuples.length} folder-invoice tuples to OpenFGA`,
  //   );
}
// endregion

// region Database
/**
 * Seeds the accounts table with initial data.
 */
async function seedAccounts(currencyIds: CurrencyIds): Promise<AccountIds> {
  console.log('Accounts:');

  // Hardcoded accounts for Singapore
  const gstRefundAccount: InferInsertModel<typeof accountTable> = {
    category: AccountCategory.CURRENT_ASSET,
    code: '101231',
    name: 'GST Receivable/Refund',
    currency_id: currencyIds.SG,
  };
  const gstPayableAccount: InferInsertModel<typeof accountTable> = {
    category: AccountCategory.CURRENT_LIABILITY,
    code: '201120',
    name: 'GST Payable',
    currency_id: currencyIds.SG,
  };
  const outputTaxDueAccount: InferInsertModel<typeof accountTable> = {
    category: AccountCategory.CURRENT_LIABILITY,
    code: '201170',
    name: 'Output Tax Due',
    currency_id: currencyIds.SG,
  };
  const accountData = [
    gstRefundAccount,
    gstPayableAccount,
    outputTaxDueAccount,
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

  const accountIds: AccountIds = {
    // biome-ignore lint/style/noNonNullAssertion: account is guaranteed to exist
    PAYABLE: accounts.find((a) => a.name === gstPayableAccount.name)!.id,
    // biome-ignore lint/style/noNonNullAssertion: account is guaranteed to exist
    RECEIVABLE: accounts.find((a) => a.name === gstRefundAccount.name)!.id,
    // biome-ignore lint/style/noNonNullAssertion: account is guaranteed to exist
    TAX_DUE: accounts.find((a) => a.name === outputTaxDueAccount.name)!.id,
  };
  return accountIds;
}

/**
 * Seeds the tax groups table with initial data.
 */
async function seedTaxGroups(
  countryIds: CountryIds,
  entityIds: EntityIds,
  accountIds: AccountIds,
): Promise<void> {
  console.log('Tax Groups:');

  const sgTaxGroup: InferInsertModel<typeof taxGroupTable> = {
    name: '9% GST',
    country_id: countryIds.SG,
    entity_id: entityIds.SG,
    tax_payable_account_id: accountIds.PAYABLE,
    tax_receivable_account_id: accountIds.RECEIVABLE,
  };
  const taxGroupData = [sgTaxGroup];

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
async function seedTaxes(countryIds: CountryIds): Promise<TaxIds> {
  console.log('Taxes:');

  // Hardcoded tax for Singapore
  const gstTax: InferInsertModel<typeof taxTable> = {
    name: '9% SR',
    amount: '9.0',
    type: TaxType.SALES,
    country_id: countryIds.SG,
    affect_base_of_subsequent_taxes: false,
    base_affected_by_previous_taxes: true,
  };
  const taxData = [gstTax];

  const taxes = await db.insert(taxTable).values(taxData).returning();
  console.log(`   Created ${taxes.length} taxes`);
  if (taxes.length !== taxData.length)
    console.warn(
      `   Warning: Expected ${taxData.length} taxes ` +
        `but got ${taxes.length} taxes`,
    );

  const taxIds: TaxIds = {
    // biome-ignore lint/style/noNonNullAssertion: tax is guaranteed to exist
    SG: taxes.find((t) => t.name === gstTax.name)!.id,
  };
  return taxIds;
}

/**
 * Seeds tax distribution lines for a given tax.
 */
async function seedTaxDistributionLines(
  accountIds: AccountIds,
  taxIds: TaxIds,
): Promise<TaxDistributionLineIds> {
  console.log('Tax Distribution Lines:');

  // Hardcoded tax distribution lines
  const invoiceBaseLine: InferInsertModel<typeof taxDistributionLineTable> = {
    tax_id: taxIds.SG,
    document_type: TaxDistributionLineDocumentType.INVOICE,
    type: TaxDistributionLineType.BASE,
  };
  const invoiceTaxLine: InferInsertModel<typeof taxDistributionLineTable> = {
    tax_id: taxIds.SG,
    document_type: TaxDistributionLineDocumentType.INVOICE,
    type: TaxDistributionLineType.TAX,
    factor_percentage: '100.0',
    account_id: accountIds.RECEIVABLE,
  };

  const hardcodedLines = await db
    .insert(taxDistributionLineTable)
    .values([invoiceBaseLine, invoiceTaxLine])
    .returning();
  if (hardcodedLines.length !== 2)
    throw new Error(
      `Expected 2 hardcoded tax distribution lines but got ${hardcodedLines.length}`,
    );
  console.log(
    `   Created ${hardcodedLines.length} hardcoded tax distribution lines`,
  );

  const lineIds: TaxDistributionLineIds = {
    // biome-ignore lint/style/noNonNullAssertion: line is guaranteed to exist
    LINE_1: hardcodedLines.find(
      (line) => line.type === TaxDistributionLineType.BASE,
    )!.id,
    // biome-ignore lint/style/noNonNullAssertion: line is guaranteed to exist
    LINE_2: hardcodedLines.find(
      (line) => line.type === TaxDistributionLineType.TAX,
    )!.id,
  };

  // Add optional tax distribution lines
  const taxDistributionLineData = Array.from(
    { length: faker.number.int({ min: 5, max: 20 }) },
    () => {
      const taxDistributionLine: InferInsertModel<
        typeof taxDistributionLineTable
      > = {
        tax_id: faker.helpers.objectValue(taxIds),
        document_type: faker.helpers.enumValue(TaxDistributionLineDocumentType),
        type: faker.helpers.enumValue(TaxDistributionLineType),
        factor_percentage: faker.helpers.maybe(
          () =>
            faker.number
              .float({ min: 0, max: 100, fractionDigits: 1 })
              .toString(),
          { probability: 0.8 },
        ),
        account_id: faker.helpers.maybe(
          () => faker.helpers.objectValue(accountIds),
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
    `   Created ${taxDistributionLines.length} additional tax distribution lines`,
  );
  if (taxDistributionLines.length !== taxDistributionLineData.length)
    console.warn(
      `   Warning: Expected ${taxDistributionLineData.length + 2} tax distribution lines ` +
        `but got ${taxDistributionLines.length + 2} tax distribution lines`,
    );

  taxDistributionLines.forEach((line) => {
    lineIds[`LINE_${line.id}`] = line.id;
  });
  return lineIds;
}

/**
 * Seeds tax tags for the accounting system.
 */
async function seedTaxTags(countryIds: CountryIds): Promise<TaxTagIds> {
  console.log('Tax Tags:');

  const taxTagData = Array.from(
    { length: faker.number.int({ min: 5, max: 20 }) },
    () => {
      const negate = faker.datatype.boolean();
      const taxTag: InferInsertModel<typeof taxTagTable> = {
        name: `${negate ? '-' : '+'}Box ${faker.number.int({ min: 1, max: 6 })}`, // TODO: decide whether to hardcode or randomize
        negate,
        country_id: countryIds.SG,
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

  const taxTagIds: TaxTagIds = taxTags.reduce<TaxTagIds>((acc, tag) => {
    acc[`TAG_${tag.id}`] = tag.id;
    return acc;
  }, {} as TaxTagIds);
  return taxTagIds;
}

/**
 * Seeds the tax distribution line and tax tag relations.
 */
async function seedTaxDistributionLineTaxTagRelations(
  taxDistributionLineIds: TaxDistributionLineIds,
  taxTagIds: TaxTagIds,
): Promise<void> {
  console.log('Tax Distribution Line Tax Tag Relations:');

  // Hardcoded relations
  const relation1: InferInsertModel<typeof taxDistributionLineTaxTagRelTable> =
    {
      tax_distribution_line_id: taxDistributionLineIds.LINE_1,
      tax_tag_id: taxTagIds.TAG_1,
    };
  const relation2: InferInsertModel<typeof taxDistributionLineTaxTagRelTable> =
    {
      tax_distribution_line_id: taxDistributionLineIds.LINE_2,
      tax_tag_id: taxTagIds.TAG_1,
    };
  const relation3: InferInsertModel<typeof taxDistributionLineTaxTagRelTable> =
    {
      tax_distribution_line_id: taxDistributionLineIds.LINE_1,
      tax_tag_id: taxTagIds.TAG_2,
    };
  const relation4: InferInsertModel<typeof taxDistributionLineTaxTagRelTable> =
    {
      tax_distribution_line_id: taxDistributionLineIds.LINE_2,
      tax_tag_id: taxTagIds.TAG_2,
    };
  const hardcodedRelations = [relation1, relation2, relation3, relation4];

  const taxDistributionLineTags = await db
    .insert(taxDistributionLineTaxTagRelTable)
    .values(hardcodedRelations)
    .returning();
  console.log(`   Created ${taxDistributionLineTags.length} tax tag relations`);
  if (taxDistributionLineTags.length !== hardcodedRelations.length)
    console.warn(
      `   Warning: Expected ${hardcodedRelations.length} tax tag relations ` +
        `but got ${taxDistributionLineTags.length} tax tag relations`,
    );
}

/**
 * Seeds the journals table with initial data.
 */
async function seedJournals(): Promise<void> {
  console.log('Journals:');

  // Hardcoded journals
  const salesJournal: InferInsertModel<typeof journalTable> = {
    name: 'Sales Invoice',
    sequence_prefix: 'INV',
    type: JournalType.SALES,
  };
  const purchaseJournal: InferInsertModel<typeof journalTable> = {
    name: 'Purchase Invoice',
    sequence_prefix: 'PINV',
    type: JournalType.PURCHASES,
  };
  const journalData = [salesJournal, purchaseJournal];

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

  await seedJournalTuples(journals);
}
// endregion

// region Drivers
/**
 * Seeds the accounting data including accounts, tax groups, and related entities.
 *
 * @param context - The seed context to update with created IDs.
 * @returns Updated seed context with new IDs.
 */
export async function seedAccountingData(
  context: SeedContext,
): Promise<SeedContext> {
  console.log('=== ACCOUNTING DATA ===');

  // Ensure required context is available
  if (!context.currencyIds || !context.countryIds || !context.entityIds)
    throw new Error(
      'Required currency, country, or entity IDs not found for accounting data',
    );

  await seedAccountingFolder();

  const accountIds = await seedAccounts(context.currencyIds);
  const taxIds = await seedTaxes(context.countryIds);

  await seedTaxGroups(context.countryIds, context.entityIds, accountIds);
  const taxDistributionLineIds = await seedTaxDistributionLines(
    accountIds,
    taxIds,
  );
  const taxTagIds = await seedTaxTags(context.countryIds);

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
// endregion
