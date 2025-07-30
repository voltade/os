import { enumToPgEnum } from '../utils.ts';
import { productSchema } from './schema.ts';

/**
 * Enum for product types.
 *
 * - GOODS: Physical products that can be sold.
 * - COMBO: A combination of multiple products sold as a single unit.
 * - SERVICE: Non-physical products that provide a service.
 */
export enum ProductType {
  GOODS = 'Goods',
  COMBO = 'Combo',
  SERVICE = 'Service',
}

/**
 * Enum for product types as a `pgEnum`.
 *
 * - GOODS: Physical products that can be sold.
 * - COMBO: A combination of multiple products sold as a single unit.
 * - SERVICE: Non-physical products that provide a service.
 */
export const productTypeEnum = productSchema.enum(
  'product_type_enum',
  enumToPgEnum(ProductType),
);

/**
 * Enum for product tracking policies.
 *
 * - NONE: No tracking of product quantities.
 * - QUANTITY: Track the quantity of products.
 * - BATCH: Track products in batches.
 * - SERIAL: Track products by serial numbers.
 */
export enum ProductTracking {
  NONE = 'None',
  QUANTITY = 'Quantity',
  BATCH = 'Batch',
  SERIAL = 'Serial',
}

/**
 * Enum for product tracking policies as a `pgEnum`.
 *
 * - NONE: No tracking of product quantities.
 * - QUANTITY: Track the quantity of products.
 * - BATCH: Track products in batches.
 * - SERIAL: Track products by serial numbers.
 */
export const productTrackingEnum = productSchema.enum(
  'product_tracking_enum',
  enumToPgEnum(ProductTracking),
);

/**
 * Enum for product categories.
 *
 * - AUTOMOTIVE: Products related to vehicles.
 * - BEAUTY_AND_PERSONAL_CARE: Products for personal grooming and beauty.
 * - BOOKS_AND_MEDIA: Printed and digital media products.
 * - CLOTHING_AND_APPAREL: Wearable products.
 * - ELECTRONICS: Electronic devices and gadgets.
 * - FOOD_AND_GROCERY: Edible products and household supplies.
 * - HEALTH_AND_WELLNESS: Products for health and well-being.
 * - HOME_AND_KITCHEN: Household products and kitchenware.
 * - OFFICE_SUPPLIES: Products for office use.
 * - SPORTS_AND_OUTDOORS: Sporting goods and outdoor equipment.
 * - TOYS_AND_GAMES: Play items for children and adults.
 */
export enum ProductCategory {
  AUTOMOTIVE = 'Automotive',
  BEAUTY_AND_PERSONAL_CARE = 'Beauty & Personal Care',
  BOOKS_AND_MEDIA = 'Books & Media',
  CLOTHING_AND_APPAREL = 'Clothing & Apparel',
  ELECTRONICS = 'Electronics',
  FOOD_AND_GROCERY = 'Food & Grocery',
  HEALTH_AND_WELLNESS = 'Health & Wellness',
  HOME_AND_KITCHEN = 'Home & Kitchen',
  OFFICE_SUPPLIES = 'Office Supplies',
  SPORTS_AND_OUTDOORS = 'Sports & Outdoors',
  TOYS_AND_GAMES = 'Toys & Games',
}

/**
 * Enum for product categories as a `pgEnum`.
 *
 * - AUTOMOTIVE: Products related to vehicles.
 * - BEAUTY_AND_PERSONAL_CARE: Products for personal grooming and beauty.
 * - BOOKS_AND_MEDIA: Printed and digital media products.
 * - CLOTHING_AND_APPAREL: Wearable products.
 * - ELECTRONICS: Electronic devices and gadgets.
 * - FOOD_AND_GROCERY: Edible products and household supplies.
 * - HEALTH_AND_WELLNESS: Products for health and well-being.
 * - HOME_AND_KITCHEN: Household products and kitchenware.
 * - OFFICE_SUPPLIES: Products for office use.
 * - SPORTS_AND_OUTDOORS: Sporting goods and outdoor equipment.
 * - TOYS_AND_GAMES: Play items for children and adults.
 */
export const productCategoryEnum = productSchema.enum(
  'product_category_enum',
  enumToPgEnum(ProductCategory),
);

/**
 * Enum for product lifecycle statuses.
 *
 * - DRAFT: Product is in draft state, not yet active.
 * - ACTIVE: Product is active and available for sale.
 * - DISCONTINUED: Product is no longer available for sale.
 * - END_OF_LIFE: Product is at the end of its lifecycle, typically replaced by a newer version.
 */
export enum ProductLifecycleStatus {
  DRAFT = 'Draft',
  ACTIVE = 'Active',
  DISCONTINUED = 'Discontinued',
  END_OF_LIFE = 'EndOfLife',
}

/**
 * Enum for product lifecycle statuses as a `pgEnum`.
 *
 * - DRAFT: Product is in draft state, not yet active.
 * - ACTIVE: Product is active and available for sale.
 * - DISCONTINUED: Product is no longer available for sale.
 * - END_OF_LIFE: Product is at the end of its lifecycle, typically replaced by a newer version.
 */
export const productLifecycleStatusEnum = productSchema.enum(
  'product_lifecycle_status_enum',
  enumToPgEnum(ProductLifecycleStatus),
);
