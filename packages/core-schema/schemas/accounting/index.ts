/**
 * This file is to support the typed [include relations](https://orm.drizzle.team/docs/rqb#include-relations) from drizzle query (the drizzle easy mode)
 */

export * from './enums.ts';
export * from './tables/account.ts';
export * from './tables/journal.ts';
export * from './tables/journal_entry.ts';
export * from './tables/journal_line.ts';
export * from './tables/payment_term.ts';
export * from './tables/payment_term_line.ts';
export * from './tables/tax.ts';
export * from './tables/tax_distribution_line.ts';
export * from './tables/tax_distribution_line_tax_tag_rel.ts';
export * from './tables/tax_group.ts';
export * from './tables/tax_tag.ts';
