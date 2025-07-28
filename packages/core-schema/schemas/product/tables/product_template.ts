import { relations, type SQL, sql } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  index,
  integer,
  numeric,
  pgPolicy,
  text,
} from 'drizzle-orm/pg-core';

import { uomTable } from '../../resource/tables/uom.ts';
import { DEFAULT_COLUMNS, priceCol } from '../../utils.ts';
import { productCategoryEnum, productTypeEnum } from '../enums.ts';
import { productSchema } from '../schema.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`allow('${sql.raw(relation)}', 'inventory:' || cast(id as varchar))`;
}

/**
 * This table represents the abstract definition of a product, commonly known as a "template" or "product model".
 * A product template defines all shared characteristics of a group of variant products, such as their name,
 * category, pricing tiers, and physical attributes like weight and volume.
 *
 * Templates are used to organize and manage product families before defining specific variants (e.g., size, color).
 * Each template can have one or more actual `product` entries (variants) tied to it.
 *
 * Example: A product template might represent a T-shirt model called "Soft Cotton Tee"
 *          while the corresponding product entries represent individual variants like:
 *          - Soft Cotton Tee, Size M, Blue
 *          - Soft Cotton Tee, Size L, Black
 *
 * Note: This table should not store variant-specific data like SKU, GTIN, or inventory quantities —
 *       those belong in the `product` table.
 */
export const productTemplateTable = productSchema.table(
  'template',
  {
    ...DEFAULT_COLUMNS,

    // General information
    name: text().notNull(),
    description: text(),
    weight: numeric({ precision: 18, scale: 3 }),
    volume: numeric({ precision: 18, scale: 3 }),
    uom_id: integer(),

    // Product categorization
    type: productTypeEnum().notNull().default('Goods'),
    category: productCategoryEnum(),

    // Tracking
    /**
     * Indicates whether the product family can be purchased.
     */
    purchase_ok: boolean().default(true).notNull(),
    /**
     * Indicates whether the product family can be sold.
     */
    sale_ok: boolean().default(true).notNull(),

    // Finance & accounting
    /**
     * The list price (MSRP) is the recommended retail price for the product.
     * This is not necessarily the price at which the product is sold.
     */
    list_price: priceCol('list_price').notNull(),
    /**
     * The retail price is the actual price at which the product is sold,
     * which may be lower than the list price due to discounts / promotions.
     */
    retail_price: priceCol('retail_price'),
    /**
     * The wholesale price is the price charged to retailers / distributors,
     * typically lower than the retail price.
     */
    wholesale_price: priceCol('wholesale_price'),
    /**
     * The cost price is the price for businesses to product / acquire the product.
     */
    cost_price: priceCol('cost_price'),
  },
  (table) => [
    foreignKey({
      name: 'product_template_uom_fk',
      columns: [table.uom_id],
      foreignColumns: [uomTable.id],
    }),

    // Product template indexes
    index('product_template_type_idx').on(table.type),
    index('product_template_category_idx').on(table.category),

    /**
     * RLS policies for the product template table.
     * @see {@link openfga/inventory.fga}
     */
    pgPolicy('product_template_select_policy', {
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_products'),
    }),
    pgPolicy('product_template_insert_policy', {
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_products'),
    }),
    pgPolicy('product_template_update_policy', {
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_products'),
    }),
    pgPolicy('product_template_delete_policy', {
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_products'),
    }),
  ],
);

export const productTemplateRelations = relations(
  productTemplateTable,
  ({ one }) => ({
    uom: one(uomTable, {
      fields: [productTemplateTable.uom_id],
      references: [uomTable.id],
    }),
  }),
);
