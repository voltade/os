import { productSchema } from './schema.ts';

export const productTypeEnum = productSchema.enum('product_type_enum', [
  'Goods',
  'Combo',
  'Service',
]);

export const productTrackingEnum = productSchema.enum('product_tracking_enum', [
  'None',
  'Quantity',
  'Batch',
  'Serial',
]);

export const productCategoryEnum = productSchema.enum('product_category_enum', [
  'Automotive',
  'Beauty & Personal Care',
  'Books & Media',
  'Clothing & Apparel',
  'Electronics',
  'Food & Grocery',
  'Health & Wellness',
  'Home & Kitchen',
  'Office Supplies',
  'Sports & Outdoors',
  'Toys & Games',
]);

export const productLifecycleStatusEnum = productSchema.enum(
  'product_lifecycle_status_enum',
  ['Draft', 'Active', 'Discontinued', 'EndOfLife'],
);
