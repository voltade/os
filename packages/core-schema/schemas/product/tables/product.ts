import { isNotNull, relations, type SQL, sql } from 'drizzle-orm';
import {
  foreignKey,
  index,
  integer,
  pgPolicy,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { ProductTracking, productTrackingEnum } from '../enums.ts';
import { productSchema } from '../schema.ts';
import { productTemplateTable } from './product_template.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`exists(select 1 from ${productTemplateTable} pt where template_id = pt.id and allow('${sql.raw(relation)}', 'inventory:' || cast(pt.id as varchar)))`;
}

/**
 * This table represents a specific **variant** of a product defined by a `product_template`.
 *
 * A product is the concrete, purchasable unit tracked by inventory — it includes
 * variant-specific information such as SKU, color, size, GTIN, and identifiers like
 * serial or batch numbers. Products are the units used in real-world operations like
 * purchasing, warehousing, transfers, and sales.
 *
 * Each product belongs to exactly one `product_template`, which defines its shared
 * characteristics (e.g., brand, category, base name). Products inherit these attributes
 * but add distinguishing details for variant management.
 *
 * Example: A `product_template` might define a phone model "iPhone 16"
 *          while this table includes individual variants like:
 *          - iPhone 16, 128GB, Black
 *          - iPhone 16, 256GB, Blue
 *
 * Product entries may be:
 * - **Serialized**: each unit is tracked individually by a unique serial number.
 * - **Batch-tracked**: units are tracked by a shared batch or lot number.
 * - **Untracked**: managed by aggregate stock count only.
 *
 * Inventory quantities for products are derived from associated `product_unit` records.
 *
 * This table is the central reference for any inventory, purchasing, or sales operation.
 */
export const productTable = productSchema.table(
  'product',
  {
    ...DEFAULT_COLUMNS,

    /**
     * Each product belongs to exactly one template.
     */
    template_id: integer().notNull(),
    /**
     * Indicates how (if at all) the product is tracked in inventory.
     */
    tracking_policy: productTrackingEnum()
      .default(ProductTracking.NONE)
      .notNull(),

    /**
     * These fields represent the different types of product identifiers used across retail, manufacturing, distribution,
     * and e-commerce. Each serves a unique role in product traceability, cataloging, supply chain integration,
     * and sales channels (e.g., Amazon, retailers, libraries).
     *
     * Note: Most fields here are optional because not all identifiers are applicable to every product.
     * SKU is typically required internally, while others may depend on sales regions or product type.
     *
     * @see https://www.commport.com/decoding-product-identifiers/
     */

    /**
     * Stock Keeping Unit (SKU) is a unique alphanumeric identifier assigned internally to each product.
     * The structure of a SKU is defined by the business and often encodes details like size, color, supplier, or category.
     * It is used for internal inventory tracking, ordering, and logistics but is not globally standardized.
     */
    sku: text().unique().notNull(),
    /**
     * Universal Product Code (UPC) is a standardized 12-digit barcode used primarily in North America.
     * It is assigned by GS1 and is used to identify products at the point of sale. Most consumer packaged goods in
     * the U.S. and Canada have a UPC. It is machine-readable and typically appears as a barcode on packaging.
     * @example '012345678905'
     */
    upc: text(),
    /**
     * European Article Number (EAN) is the international version of UPC, usually 13 digits long.
     * It is commonly used in Europe and other parts of the world and serves a similar function to the UPC —
     * uniquely identifying products in supply chains and retail environments.
     * @example '4006381333931'
     */
    ean: text(),
    /**
     * Global Trade Item Number (GTIN) is a family of data structures that includes UPC, EAN, and others.
     * It can be 8, 12, 13, or 14 digits depending on packaging level and region. GTIN is used for global commerce,
     * often on marketplaces or for logistics coordination. GTIN-14 is common for cases/pallets.
     * @see https://www.gs1.org/standards/id-keys/gtin
     */
    gtin: text(),
    /**
     * International Standard Book Number (ISBN) is a unique identifier used globally for books and similar publications.
     * ISBNs are either 10 or 13 digits and are required for commercial book sales, distribution, and cataloging.
     * Used heavily by publishers, libraries, and bookstores.
     * @example '9783161484100'
     */
    isbn: text(),
    /**
     * Manufacturer Part Number (MPN) is assigned by the product manufacturer to uniquely identify a specific part or product.
     * It is widely used in manufacturing, wholesale, and B2B contexts to distinguish between variants and configurations.
     * MPNs are often included in procurement, inventory management, and technical documentation.
     */
    mpn: text(),
    /**
     * Amazon Standard Identification Number (ASIN) is Amazon’s proprietary identifier used to catalog products on its marketplace.
     * ASINs are unique within Amazon's catalog and are often used for integration with Amazon Seller Central or other
     * Amazon services. Most ASINs are 10 characters long.
     * @example 'B07N4M94R5'
     */
    asin: text(),
  },
  (table) => [
    foreignKey({
      name: 'product_template_id_fk',
      columns: [table.template_id],
      foreignColumns: [productTemplateTable.id],
    }),

    // Product indexes
    index('product_tracking_policy_idx').on(table.tracking_policy),
    uniqueIndex('product_upc_idx').on(table.upc).where(isNotNull(table.upc)),
    uniqueIndex('product_ean_idx').on(table.ean).where(isNotNull(table.ean)),
    uniqueIndex('product_gtin_idx').on(table.gtin).where(isNotNull(table.gtin)),
    uniqueIndex('product_isbn_idx').on(table.isbn).where(isNotNull(table.isbn)),
    uniqueIndex('product_mpn_idx').on(table.mpn).where(isNotNull(table.mpn)),
    uniqueIndex('product_asin_idx').on(table.asin).where(isNotNull(table.asin)),

    /**
     * RLS policies for the product table.
     * @see {@link openfga/inventory.fga}
     */
    pgPolicy('product_select_policy', {
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_products'),
    }),
    pgPolicy('product_insert_policy', {
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_products'),
    }),
    pgPolicy('product_update_policy', {
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_products'),
    }),
    pgPolicy('product_delete_policy', {
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_products'),
    }),
  ],
);

export const productRelations = relations(productTable, ({ one }) => ({
  template: one(productTemplateTable, {
    fields: [productTable.template_id],
    references: [productTemplateTable.id],
  }),
}));
