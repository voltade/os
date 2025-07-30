import { enumToPgEnum } from '../utils.ts';
import { accountingSchema } from './schema.ts';

export const accountCategoryEnum = accountingSchema.enum('category_enum', [
  // Balance Sheet
  // ├── Asset
  // │   ├── Current Assets
  'Bank and Cash',
  'Prepayment',
  'Current Asset',
  // │   ├── Fixed Assets
  'Fixed Asset',
  // │   └─ Non-current Assets
  'Non-current Asset',
  // ├── Liability
  // │   ├─ Current Liabilities
  'Payable',
  'Credit Card',
  'Current Liability',
  // │   └─ Non-current Liabilities
  'Non-current Liability',
  // ├── Equity
  'Equity',
  'Current Year Earning',
  // Profit and Loss
  // ├── Income
  'Income',
  'Other Income',
  // ├── Expense
  'Expense',
  'Cost of Revenue',
  'Depreciation',
  // └─ Other
  'Off-Balance Sheet',
]);

/**
 * Enum for journal types.
 *
 * - GENERAL: General journal entries.
 * - SALES: Journal entries related to sales transactions.
 * - PURCHASES: Journal entries related to purchase transactions.
 * - CASH: Journal entries related to cash transactions.
 * - BANK: Journal entries related to bank transactions.
 * - CREDIT_CARD: Journal entries related to credit card transactions.
 * - OTHER: Any other type of journal entry.
 */
export enum JournalType {
  GENERAL = 'General',
  SALES = 'Sales',
  PURCHASES = 'Purchases',
  CASH = 'Cash',
  BANK = 'Bank',
  CREDIT_CARD = 'Credit Card',
  OTHER = 'Other',
}

/**
 * Enum for journal types as a `pgEnum`.
 *
 * - GENERAL: General journal entries.
 * - SALES: Journal entries related to sales transactions.
 * - PURCHASES: Journal entries related to purchase transactions.
 * - CASH: Journal entries related to cash transactions.
 * - BANK: Journal entries related to bank transactions.
 * - CREDIT_CARD: Journal entries related to credit card transactions.
 * - OTHER: Any other type of journal entry.
 */
export const journalTypeEnum = accountingSchema.enum(
  'account_journal_type_enum',
  enumToPgEnum(JournalType),
);

export const journalEntryStatusEnum = accountingSchema.enum(
  'account_journal_entry_status_enum',
  ['Draft', 'Posted', 'Cancelled'],
);

export const journalEntryTypeEnum = accountingSchema.enum(
  'account_transaction_type_enum',
  [
    'Journal Entry',
    'Customer Invoice',
    'Customer Credit Note',
    'Vendor Bill',
    'Vendor Credit Note',
    'Sales Receipt',
    'Purchase Receipt',
  ],
);

export const paymentTypeEnum = accountingSchema.enum(
  'account_payment_type_enum',
  ['Inbound', 'Outbound'],
);

export const paymentPartnerType = accountingSchema.enum(
  'account_payment_partner_type_enum',
  ['Customer', 'Vendor', 'Employee', 'Other'],
);

export const paymentTermLineValueTypeEnum = accountingSchema.enum(
  'account_payment_term_line_value_type_enum',
  ['Fixed', 'Percentage'],
);

export const paymentTermLineDelayTypeEnum = accountingSchema.enum(
  'account_payment_term_line_delay_type_enum',
  [
    'Days after invoice date',
    'Days after invoice date, on the',
    'Days after end of this month',
    'Days after end of the next month',
  ],
);

export const taxTypeEnum = accountingSchema.enum('account_tax_type_enum', [
  'Sales',
  'Purchases',
]);

export const taxScopeEnum = accountingSchema.enum('account_tax_scope_enum', [
  'Goods',
  'Services',
]);

export const taxPriceIncludeEnum = accountingSchema.enum(
  'account_tax_price_include_override_enum',
  ['Tax included', 'Tax excluded'],
);

/**
 * The type of tax distribution line.
 *
 * - BASE: Represents the base amount before tax.
 * - TAX: Represents the tax amount.
 */
export enum TaxDistributionLineType {
  BASE = 'Base',
  TAX = 'Tax',
}

/**
 * The type of tax distribution line as a `pgEnum`.
 *
 * - Base: Represents the base amount before tax.
 * - Tax: Represents the tax amount.
 */
export const taxDistributionLineTypeEnum = accountingSchema.enum(
  'account_tax_distribution_type_enum',
  enumToPgEnum(TaxDistributionLineType),
);

/**
 * The document type for tax distribution lines.
 *
 * - INVOICE: Represents a standard invoice document.
 * - REFUND: Represents a refund document.
 */
export enum TaxDistributionLineDocumentType {
  INVOICE = 'Invoice',
  REFUND = 'Refund',
}

/**
 * The document type for tax distribution lines as a `pgEnum`.
 *
 * - INVOICE: Represents a standard invoice document.
 * - REFUND: Represents a refund document.
 */
export const taxDistributionLineDocumentTypeEnum = accountingSchema.enum(
  'account_tax_distribution_document_type_enum',
  enumToPgEnum(TaxDistributionLineDocumentType),
);
