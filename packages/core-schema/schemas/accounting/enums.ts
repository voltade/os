import { enumToPgEnum } from '../utils.ts';
import { accountingSchema } from './schema.ts';

/**
 * Enum for account categories.
 *
 * This enum categorizes accounts into various types of balance sheets.
 * The categories are structured to represent a typical accounting hierarchy, including assets, liabilities, equity, and income/expense accounts.
 *
 * The hierarchy is as follows:
 * ```text
 * Balance Sheet
 * ├── Asset
 * │   ├── Current Assets
 * │   ├── Fixed Assets
 * │   └── Non-current Assets
 * ├── Liability
 * │   ├── Current Liabilities
 * │   └── Non-current Liabilities
 * ├── Equity
 * │   └── Retained Earnings
 * └── Income Statement
 *     ├── Revenue
 *     └── Expenses
 * ```
 *
 * - BANK_AND_CASH: Represents bank and cash accounts.
 * - PREPAYMENT: Represents prepayment accounts.
 * - CURRENT_ASSET: Represents current asset accounts.
 * - FIXED_ASSET: Represents fixed asset accounts.
 * - NON_CURRENT_ASSET: Represents non-current asset accounts.
 * - PAYABLE: Represents payable accounts.
 * - CREDIT_CARD: Represents credit card accounts.
 * - CURRENT_LIABILITY: Represents current liability accounts.
 * - NON_CURRENT_LIABILITY: Represents non-current liability accounts.
 * - EQUITY: Represents equity accounts.
 * - CURRENT_YEAR_EARNING: Represents current year earning accounts.
 * - INCOME: Represents income accounts.
 * - OTHER_INCOME: Represents other income accounts.
 * - EXPENSE: Represents expense accounts.
 * - COST_OF_REVENUE: Represents cost of revenue accounts.
 * - DEPRECIATION: Represents depreciation accounts.
 * - OFF_BALANCE_SHEET: Represents off-balance sheet accounts.
 */
export enum AccountCategory {
  // Balance Sheet
  // ├── Asset
  // │   ├── Current Assets
  BANK_AND_CASH = 'Bank and Cash',
  PREPAYMENT = 'Prepayment',
  CURRENT_ASSET = 'Current Asset',
  // │   ├── Fixed Assets
  FIXED_ASSET = 'Fixed Asset',
  // │   └─ Non-current Assets
  NON_CURRENT_ASSET = 'Non-current Asset',
  // ├── Liability
  // │   ├─ Current Liabilities
  PAYABLE = 'Payable',
  CREDIT_CARD = 'Credit Card',
  CURRENT_LIABILITY = 'Current Liability',
  // │   └─ Non-current Liabilities
  NON_CURRENT_LIABILITY = 'Non-current Liability',
  // ├── Equity
  EQUITY = 'Equity',
  CURRENT_YEAR_EARNING = 'Current Year Earning',
  // Profit and Loss
  // ├── Income
  INCOME = 'Income',
  OTHER_INCOME = 'Other Income',
  // ├── Expense
  EXPENSE = 'Expense',
  COST_OF_REVENUE = 'Cost of Revenue',
  DEPRECIATION = 'Depreciation',
  // └─ Other
  OFF_BALANCE_SHEET = 'Off-Balance Sheet',
}

/**
 * Enum for account categories as a `pgEnum`.
 *
 * This enum categorizes accounts into various types of balance sheets.
 * The categories are structured to represent a typical accounting hierarchy, including assets, liabilities, equity, and income/expense accounts.
 *
 * The hierarchy is as follows:
 * ```text
 * Balance Sheet
 * ├── Asset
 * │   ├── Current Assets
 * │   ├── Fixed Assets
 * │   └── Non-current Assets
 * ├── Liability
 * │   ├── Current Liabilities
 * │   └── Non-current Liabilities
 * ├── Equity
 * │   └── Retained Earnings
 * └── Income Statement
 *     ├── Revenue
 *     └── Expenses
 * ```
 *
 * - BANK_AND_CASH: Represents bank and cash accounts.
 * - PREPAYMENT: Represents prepayment accounts.
 * - CURRENT_ASSET: Represents current asset accounts.
 * - FIXED_ASSET: Represents fixed asset accounts.
 * - NON_CURRENT_ASSET: Represents non-current asset accounts.
 * - PAYABLE: Represents payable accounts.
 * - CREDIT_CARD: Represents credit card accounts.
 * - CURRENT_LIABILITY: Represents current liability accounts.
 * - NON_CURRENT_LIABILITY: Represents non-current liability accounts.
 * - EQUITY: Represents equity accounts.
 * - CURRENT_YEAR_EARNING: Represents current year earning accounts.
 * - INCOME: Represents income accounts.
 * - OTHER_INCOME: Represents other income accounts.
 * - EXPENSE: Represents expense accounts.
 * - COST_OF_REVENUE: Represents cost of revenue accounts.
 * - DEPRECIATION: Represents depreciation accounts.
 * - OFF_BALANCE_SHEET: Represents off-balance sheet accounts.
 */
export const accountCategoryEnum = accountingSchema.enum(
  'category_enum',
  enumToPgEnum(AccountCategory),
);

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

/**
 * Enum for tax types.
 *
 * - SALES: Represents sales tax.
 * - PURCHASES: Represents purchase tax.
 */
export enum TaxType {
  SALES = 'Sales',
  PURCHASES = 'Purchases',
}

/**
 * Enum for tax types as a `pgEnum`.
 *
 * - SALES: Represents sales tax.
 * - PURCHASES: Represents purchase tax.
 */
export const taxTypeEnum = accountingSchema.enum(
  'account_tax_type_enum',
  enumToPgEnum(TaxType),
);

/**
 * Enum for tax scopes.
 *
 * - GOODS: Represents tax applicable to goods.
 * - SERVICES: Represents tax applicable to services.
 */
export enum TaxScope {
  GOODS = 'Goods',
  SERVICES = 'Services',
}

/**
 * Enum for tax scopes as a `pgEnum`.
 *
 * - GOODS: Represents tax applicable to goods.
 * - SERVICES: Represents tax applicable to services.
 */
export const taxScopeEnum = accountingSchema.enum(
  'account_tax_scope_enum',
  enumToPgEnum(TaxScope),
);

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

export const journalLineReferenceTypeEnum = accountingSchema.enum(
  'account_journal_line_reference_type_enum',
  ['education.class', 'product.product'],
);
