import { faker } from '@faker-js/faker';
import type { InferInsertModel } from 'drizzle-orm';

import { db } from '../../lib/db.ts';
import {
  comboProductTable,
  comboTable,
  ProductCategory,
  ProductTracking,
  ProductType,
  productTable,
  productTemplateTable,
  templateComboTable,
} from '../../schemas/index.ts';
import { clearTables, type SeedContext } from './utils.ts';

const NUM_GENERIC_TEMPLATES = 3;

/**
 * Seeds product templates with various products.
 */
async function seedProductTemplates(uomIds: number[] = []): Promise<number[]> {
  // Ensure required IDs are available
  const uomPcId = uomIds[0];
  if (!uomPcId) throw new Error('No UOM IDs provided for product templates');

  console.log('Product templates:');
  const templateData = Array.from(
    { length: faker.number.int({ min: 30, max: 50 }) },
    () => {
      const template: InferInsertModel<typeof productTemplateTable> = {
        name: faker.food.dish(),
        description: faker.commerce.productDescription(),
        uom_id: uomPcId,
        type: ProductType.GOODS,
        category: ProductCategory.FOOD_AND_GROCERY,
        list_price: faker.commerce.price({ min: 1, max: 100, dec: 2 }),
      };
      return template;
    },
  );
  // Add generic templates
  templateData.push(
    ...Array.from({ length: NUM_GENERIC_TEMPLATES }, () => {
      const genericTemplate: InferInsertModel<typeof productTemplateTable> = {
        name: faker.commerce.product(),
        description: faker.commerce.productDescription(),
        uom_id: uomPcId,
        type: ProductType.GOODS,
        category: faker.helpers.enumValue(ProductCategory),
        list_price: faker.commerce.price({ min: 1, max: 100, dec: 2 }),
      };
      return genericTemplate;
    }),
  );

  const templates = await db
    .insert(productTemplateTable)
    .values(templateData)
    .returning();
  console.log(`   Created ${templates.length} product templates`);
  if (templates.length !== templateData.length)
    console.warn(
      `   Warning: Expected ${templateData.length} templates ` +
        `but got ${templates.length} templates`,
    );

  return templates.map((t) => t.id);
}

/**
 * Seeds products based on the provided template IDs.
 */
async function seedProducts(templateIds: number[] = []): Promise<number[]> {
  // Ensure required IDs are available
  if (templateIds.length <= NUM_GENERIC_TEMPLATES)
    throw new Error('Not enough template IDs provided for product seeding');

  console.log('Products:');
  const productIds: number[] = [];

  const foodData = templateIds
    .slice(0, -NUM_GENERIC_TEMPLATES)
    .map((templateId) => {
      const timestamp = faker.date
        .past({ years: 5, refDate: new Date() })
        .toISOString()
        .slice(0, 10);
      const foodProduct: InferInsertModel<typeof productTable> = {
        template_id: templateId,
        sku: `SKU-${timestamp}-${templateId.toString().padStart(4, '0')}`,
        tracking_policy: ProductTracking.QUANTITY,
      };
      return foodProduct;
    });

  const productsFromFoodTemplates = await db
    .insert(productTable)
    .values(foodData)
    .returning();
  console.log(`   Created products, one for each of the other templates`);
  if (productsFromFoodTemplates.length !== foodData.length)
    console.warn(
      `   Warning: Expected ${foodData.length} products ` +
        `but got ${productsFromFoodTemplates.length} products`,
    );
  productIds.push(...productsFromFoodTemplates.map((p) => p.id));

  const productData = Array.from(
    { length: faker.number.int({ min: 20, max: 50 }) },
    (_, index) => {
      const templateId = faker.helpers.arrayElement(
        templateIds.slice(-NUM_GENERIC_TEMPLATES),
      );
      const timestamp = faker.date
        .past({ years: 5, refDate: new Date() })
        .toISOString()
        .slice(0, 10);
      const isTracked = faker.datatype.boolean();
      const trackedIndividually = isTracked && faker.datatype.boolean();

      const product: InferInsertModel<typeof productTable> = {
        template_id: templateId,
        sku: `SKU-${timestamp}-${templateId}-${String(index + 1).padStart(4, '0')}`,
        tracking_policy: !isTracked
          ? ProductTracking.NONE
          : trackedIndividually
            ? faker.helpers.arrayElement([
                ProductTracking.SERIAL,
                ProductTracking.BATCH,
              ])
            : ProductTracking.QUANTITY,
        upc: trackedIndividually ? faker.string.numeric(12) : null,
        ean: trackedIndividually ? faker.string.numeric(13) : null,
        isbn: trackedIndividually ? faker.commerce.isbn(13) : null,
      };
      return product;
    },
  );

  const productsFromGenericTemplate = await db
    .insert(productTable)
    .values(productData)
    .returning();
  console.log(
    `   Created ${productsFromGenericTemplate.length} products for generic templates`,
  );
  if (productsFromGenericTemplate.length !== productData.length)
    console.warn(
      `   Warning: Expected ${productData.length} products ` +
        `but got ${productsFromGenericTemplate.length} products`,
    );
  productIds.push(...productsFromGenericTemplate.map((p) => p.id));

  return productIds;
}

/**
 * Seeds combos for linking to products.
 */
async function seedCombos(): Promise<number[]> {
  console.log('Combos:');

  const comboData = Array.from(
    { length: faker.number.int({ min: 3, max: 5 }) },
    (_, index) => {
      const combo: InferInsertModel<typeof comboTable> = {
        name: `Combo ${index + 1}`,
      };
      return combo;
    },
  );

  const combos = await db.insert(comboTable).values(comboData).returning();
  console.log(`   Created ${combos.length} combos`);
  if (combos.length !== comboData.length)
    console.warn(
      `   Warning: Expected ${comboData.length} combos ` +
        `but got ${combos.length} combos`,
    );

  return combos.map((c) => c.id);
}

/**
 * Seeds combo products linking combos to products.
 */
async function seedComboProducts(
  comboIds: number[] = [],
  productIds: number[] = [],
  templateIds: number[] = [],
): Promise<void> {
  // Ensure required IDs are available
  if (
    comboIds.length === 0 ||
    productIds.length < templateIds.length - NUM_GENERIC_TEMPLATES
  )
    throw new Error(
      'Not enough combo or product IDs provided for combo product seeding',
    );

  console.log('Combo Products:');
  const comboProductsData = Array.from(
    { length: faker.number.int({ min: 10, max: 20 }) },
    () => {
      const comboProduct: InferInsertModel<typeof comboProductTable> = {
        combo_id: faker.helpers.arrayElement(comboIds),
        product_id: faker.helpers.arrayElement(productIds),
        extra_price: faker.helpers.maybe(
          () => faker.commerce.price({ min: 0, max: 5, dec: 2 }),
          { probability: 0.7 },
        ),
      };
      return comboProduct;
    },
  );

  const uniqueRelations: {
    [key: string]: InferInsertModel<typeof comboProductTable>;
  } = {};
  comboProductsData.forEach((line) => {
    const { combo_id, product_id } = line;
    const key = `${combo_id}-${product_id}`;
    if (!uniqueRelations[key]) uniqueRelations[key] = line;
  });

  const comboProducts = await db
    .insert(comboProductTable)
    .values(Object.values(uniqueRelations))
    .returning();
  console.log(`   Created ${comboProducts.length} combo products`);
  if (comboProducts.length !== Object.values(uniqueRelations).length)
    console.warn(
      `   Warning: Expected ${Object.values(uniqueRelations).length} combo products ` +
        `but got ${comboProducts.length} combo products`,
    );
}

/**
 * Seeds template combos linking templates to combos.
 */
async function seedTemplateCombos(
  comboIds: number[] = [],
  templateIds: number[] = [],
): Promise<void> {
  // Ensure required IDs are available
  if (comboIds.length === 0 || templateIds.length < NUM_GENERIC_TEMPLATES)
    throw new Error(
      'Not enough combo or template IDs provided for template combo seeding',
    );

  console.log('Template Combos:');
  const templateCombosData = Array.from(
    { length: faker.number.int({ min: 3, max: 10 }) },
    () => {
      const templateCombo: InferInsertModel<typeof templateComboTable> = {
        template_id: faker.helpers.arrayElement(templateIds),
        combo_id: faker.helpers.arrayElement(comboIds),
      };
      return templateCombo;
    },
  );

  const uniqueTemplateCombos: {
    [key: string]: InferInsertModel<typeof templateComboTable>;
  } = {};
  templateCombosData.forEach((relation) => {
    const { template_id, combo_id } = relation;
    const key = `${template_id}-${combo_id}`;
    if (!uniqueTemplateCombos[key]) uniqueTemplateCombos[key] = relation;
  });

  const templateCombos = await db
    .insert(templateComboTable)
    .values(Object.values(uniqueTemplateCombos))
    .returning();
  console.log(`   Created ${templateCombos.length} template combos`);
  if (templateCombos.length !== Object.values(uniqueTemplateCombos).length)
    console.warn(
      `   Warning: Expected ${Object.values(uniqueTemplateCombos).length} template combos ` +
        `but got ${templateCombos.length} template combos`,
    );
}

/**
 * Seeds product data including templates and products.
 *
 * This function creates product templates and products, linking them appropriately.
 * It also creates combos and associates them with products.
 *
 * @param context - The seed context to update with created IDs.
 * @returns Updated seed context with new IDs.
 */
export async function seedProductData(
  context: SeedContext,
): Promise<SeedContext> {
  console.log('=== PRODUCT DATA ===');

  const templateIds = await seedProductTemplates(context.uomIds);
  context.templateIds = templateIds;

  const productIds = await seedProducts(templateIds);
  const comboIds = await seedCombos();
  context = {
    ...context,
    productIds,
    comboIds,
  };

  await seedComboProducts(comboIds, productIds, templateIds);
  await seedTemplateCombos(comboIds, templateIds);

  console.log('=== PRODUCT DATA SEEDING COMPLETE ===\n');
  return context;
}

/**
 * Clears all product-related data from the database.
 *
 * The order of truncation should follow the reverse order of seeding
 * to avoid foreign key constraints.
 */
export async function clearProductData(): Promise<void> {
  console.log('Clearing product data...');

  await clearTables(
    templateComboTable,
    comboProductTable,
    comboTable,
    productTable,
    productTemplateTable,
  );

  console.log('Product data cleared successfully');
}
