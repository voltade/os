import { faker } from '@faker-js/faker';
import { ClientWriteStatus, type TupleKey } from '@openfga/sdk';
import type { InferInsertModel } from 'drizzle-orm';

import { db } from '../../lib/db.ts';
import fgaClient from '../../lib/openfga.ts';
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
import { appEnvVariables } from '../../utils/env.ts';
import {
  type ComboIds,
  clearTables,
  FoodProducts,
  ORG_FOLDERS,
  ORG_TEAMS,
  type ProductIds,
  type SeedContext,
  type UomIds,
} from './utils.ts';

const { FGA_AUTHORIZATION_MODEL_ID } = appEnvVariables;

type ProductTemplateIds = ProductIds & {
  TEMPLATE_1: number;
  TEMPLATE_2: number;
  TEMPLATE_3: number;
};

// region OpenFGA
/**
 * Seeds the inventory folder in OpenFGA.
 * This folder is used to aggregate inventory-related permissions.
 */
async function seedInventoryFolder(): Promise<void> {
  console.log('Inventory Folder:');

  const inventoryFolderTuples = Object.values(ORG_TEAMS).map((team) => {
    const tuple: TupleKey = {
      user: team,
      relation: team === ORG_TEAMS.PRODUCT ? 'owner_team' : 'viewer_team',
      object: ORG_FOLDERS.INVENTORY,
    };
    return tuple;
  });

  const result = await fgaClient?.writeTuples(inventoryFolderTuples, {
    authorizationModelId: FGA_AUTHORIZATION_MODEL_ID,
  });

  let failedCount = 0;
  result?.writes.forEach((write) => {
    if (write.status === ClientWriteStatus.SUCCESS) return;
    failedCount++;
    console.error(
      `Failed write for tuple ${JSON.stringify(write.tuple_key)}: ${write.err?.message || 'Unknown error'}`,
    );
  });

  if (failedCount > 0)
    console.warn(
      `   Failed to write ${failedCount}/${inventoryFolderTuples.length} folder-inventory tuples to OpenFGA`,
    );
  else
    console.log(
      `   Successfully wrote ${inventoryFolderTuples.length} folder-inventory tuples to OpenFGA`,
    );
}

/**
 * Seeds product template tuples in OpenFGA.
 */
async function seedProductTemplateTuples(
  productTemplateIds: ProductTemplateIds,
): Promise<void> {
  console.log('Product Template Tuples:');

  const productTemplateTuples = Object.values(productTemplateIds).map(
    (templateId) => {
      const tuple: TupleKey = {
        user: ORG_FOLDERS.INVENTORY,
        relation: 'crud_folder',
        object: `inventory:${templateId}`,
      };
      return tuple;
    },
  );

  const result = await fgaClient?.writeTuples(productTemplateTuples, {
    authorizationModelId: FGA_AUTHORIZATION_MODEL_ID,
  });

  let failedCount = 0;
  result?.writes.forEach((write) => {
    if (write.status === ClientWriteStatus.SUCCESS) return;
    failedCount++;
    console.error(
      `Failed write for tuple ${JSON.stringify(write.tuple_key)}: ${write.err?.message || 'Unknown error'}`,
    );
  });

  if (failedCount > 0)
    console.warn(
      `   Failed to write ${failedCount}/${productTemplateTuples.length} product-template tuples to OpenFGA`,
    );
  else
    console.log(
      `   Successfully wrote ${productTemplateTuples.length} product-template tuples to OpenFGA`,
    );
}
// endregion

// region Database
/**
 * Seeds product templates with various products.
 */
async function seedProductTemplates(
  uomIds: UomIds,
): Promise<ProductTemplateIds> {
  console.log('Product templates:');

  // Hardcoded templates for food and grocery
  const cocaCola: InferInsertModel<typeof productTemplateTable> = {
    name: FoodProducts.COCA_COLA,
    description: 'Classic Coke - refreshing cola beverage',
    uom_id: uomIds.PC,
    type: ProductType.GOODS,
    category: ProductCategory.FOOD_AND_GROCERY,
    list_price: '2.99',
  };
  const pepsiCola: InferInsertModel<typeof productTemplateTable> = {
    name: FoodProducts.PEPSI_COLA,
    description: 'Pepsi cola - bold and refreshing',
    uom_id: uomIds.PC,
    type: ProductType.GOODS,
    category: ProductCategory.FOOD_AND_GROCERY,
    list_price: '2.99',
  };
  const sprite: InferInsertModel<typeof productTemplateTable> = {
    name: FoodProducts.SPRITE,
    description: 'Lemon-lime soda - crisp and clean taste',
    uom_id: uomIds.PC,
    type: ProductType.GOODS,
    category: ProductCategory.FOOD_AND_GROCERY,
    list_price: '2.99',
  };
  const frenchFries: InferInsertModel<typeof productTemplateTable> = {
    name: FoodProducts.FRENCH_FRIES,
    description: 'Golden crispy potato fries - salted to perfection',
    uom_id: uomIds.PC,
    type: ProductType.GOODS,
    category: ProductCategory.FOOD_AND_GROCERY,
    list_price: '3.49',
  };
  const chickenNuggets: InferInsertModel<typeof productTemplateTable> = {
    name: FoodProducts.CHICKEN_NUGGETS,
    description: '6-piece chicken nuggets - tender and juicy',
    uom_id: uomIds.PC,
    type: ProductType.GOODS,
    category: ProductCategory.FOOD_AND_GROCERY,
    list_price: '5.99',
  };
  const onionRings: InferInsertModel<typeof productTemplateTable> = {
    name: FoodProducts.ONION_RINGS,
    description: 'Beer-battered onion rings - crispy and savory',
    uom_id: uomIds.PC,
    type: ProductType.GOODS,
    category: ProductCategory.FOOD_AND_GROCERY,
    list_price: '4.29',
  };
  const cheeseburger: InferInsertModel<typeof productTemplateTable> = {
    name: FoodProducts.CHEESEBURGER,
    description: 'Classic beef patty with cheese, lettuce, tomato',
    uom_id: uomIds.PC,
    type: ProductType.GOODS,
    category: ProductCategory.FOOD_AND_GROCERY,
    list_price: '8.99',
  };
  const chickenSandwich: InferInsertModel<typeof productTemplateTable> = {
    name: FoodProducts.CHICKEN_SANDWICH,
    description: 'Grilled chicken breast with mayo and pickles',
    uom_id: uomIds.PC,
    type: ProductType.GOODS,
    category: ProductCategory.FOOD_AND_GROCERY,
    list_price: '7.99',
  };
  const fishSandwich: InferInsertModel<typeof productTemplateTable> = {
    name: FoodProducts.FISH_SANDWICH,
    description: 'Crispy fish fillet with tartar sauce',
    uom_id: uomIds.PC,
    type: ProductType.GOODS,
    category: ProductCategory.FOOD_AND_GROCERY,
    list_price: '6.99',
  };
  const applePie: InferInsertModel<typeof productTemplateTable> = {
    name: FoodProducts.APPLE_PIE,
    description: 'Warm apple pie with cinnamon - sweet finish',
    uom_id: uomIds.PC,
    type: ProductType.GOODS,
    category: ProductCategory.FOOD_AND_GROCERY,
    list_price: '2.49',
  };
  const icedLatte: InferInsertModel<typeof productTemplateTable> = {
    name: FoodProducts.ICED_LATTE,
    description: 'Chilled espresso with milk and ice - refreshing',
    uom_id: uomIds.PC,
    type: ProductType.GOODS,
    category: ProductCategory.FOOD_AND_GROCERY,
    list_price: '4.99',
  };
  const cheeseburgerCombo: InferInsertModel<typeof productTemplateTable> = {
    name: FoodProducts.CHEESEBURGER_VALUE_MEAL,
    description: 'Cheeseburger, fries, and a drink - perfect combo',
    uom_id: uomIds.PC,
    type: ProductType.COMBO,
    category: ProductCategory.FOOD_AND_GROCERY,
    list_price: '9.99',
  };
  const foodData = [
    cocaCola,
    pepsiCola,
    sprite,
    frenchFries,
    chickenNuggets,
    onionRings,
    cheeseburger,
    chickenSandwich,
    fishSandwich,
    applePie,
    icedLatte,
    cheeseburgerCombo,
  ];

  const foodTemplates = await db
    .insert(productTemplateTable)
    .values(foodData)
    .returning();
  console.log(`   Created ${foodTemplates.length} food product templates`);
  if (foodTemplates.length !== foodData.length)
    throw new Error(
      `Expected ${foodData.length} templates ` +
        `but got ${foodTemplates.length} templates`,
    );

  const productTemplateIds: ProductTemplateIds = foodTemplates.reduce(
    (acc, template) => {
      acc[
        template.name
          .replace(/\s+/g, '_')
          .toUpperCase() as keyof typeof FoodProducts
      ] = template.id;
      return acc;
    },
    {} as ProductTemplateIds,
  );

  // Add generic templates
  const templateData = Array.from(
    { length: faker.number.int({ min: 3, max: 5 }) },
    () => {
      const genericTemplate: InferInsertModel<typeof productTemplateTable> = {
        name: faker.commerce.product(),
        description: faker.commerce.productDescription(),
        uom_id: uomIds.PC,
        type: ProductType.GOODS,
        category: faker.helpers.enumValue(ProductCategory),
        list_price: faker.commerce.price({ min: 1, max: 100, dec: 2 }),
      };
      return genericTemplate;
    },
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

  templates.forEach((template, index) => {
    productTemplateIds[`TEMPLATE_${index + 1}`] = template.id;
  });
  await seedProductTemplateTuples(productTemplateIds);

  return productTemplateIds;
}

/**
 * Seeds products based on the provided template IDs.
 */
async function seedProducts(
  templateIds: ProductTemplateIds,
): Promise<ProductIds> {
  console.log('Products:');

  // Hardcoded products from food templates
  // WARNING: This is very flaky and can break quite easily if the templates change.
  const foodData = Object.entries(templateIds)
    .filter(([name]) => Object.hasOwn(FoodProducts, name))
    .map(([_, templateId]) => {
      const foodProduct: InferInsertModel<typeof productTable> = {
        template_id: templateId,
        sku: `SKU-${templateId.toString().padStart(4, '0')}`,
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

  const productIds: ProductIds = productsFromFoodTemplates.reduce<ProductIds>(
    (acc, product) => {
      const templateEntry = Object.entries(templateIds).find(
        ([_, templateId]) => templateId === product.template_id,
      );
      if (!templateEntry)
        throw new Error(
          `Template ID ${product.template_id} not found in provided template IDs`,
        );

      const [name] = templateEntry as [keyof typeof FoodProducts, number];
      acc[name] = product.id;
      return acc;
    },
    {} as ProductIds,
  );

  // Generate products from generic templates
  const productData = Array.from(
    { length: faker.number.int({ min: 20, max: 50 }) },
    () => {
      const templateId = faker.helpers.arrayElement([
        templateIds.TEMPLATE_1,
        templateIds.TEMPLATE_2,
        templateIds.TEMPLATE_3,
      ]);
      const timestamp = faker.date
        .past({ years: 5 })
        .toISOString()
        .slice(0, 10);
      const isTracked = faker.datatype.boolean();
      const trackedIndividually = isTracked && faker.datatype.boolean();

      const product: InferInsertModel<typeof productTable> = {
        template_id: templateId,
        sku: `SKU-${timestamp}-${templateId.toString().padStart(4, '0')}`,
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

  productsFromGenericTemplate.forEach((product) => {
    const templateEntry = Object.entries(templateIds).find(
      ([_, templateId]) => templateId === product.template_id,
    );
    if (!templateEntry)
      throw new Error(
        `Template ID ${product.template_id} not found in provided template IDs`,
      );

    const [name] = templateEntry;
    productIds[name] = product.id;
  });

  return productIds;
}

/**
 * Seeds combos for linking to products.
 */
async function seedCombos(): Promise<ComboIds> {
  console.log('Combos:');

  // Hardcoded combos
  const cheeseburgerCombo: InferInsertModel<typeof comboTable> = {
    name: 'Cheeseburger Choice',
  };
  const friesCombo: InferInsertModel<typeof comboTable> = {
    name: 'Fries Choice',
  };
  const drinkCombo: InferInsertModel<typeof comboTable> = {
    name: 'Drink Choice',
  };
  const comboData = [cheeseburgerCombo, friesCombo, drinkCombo];

  const combos = await db.insert(comboTable).values(comboData).returning();
  console.log(`   Created ${combos.length} combos`);
  if (combos.length !== comboData.length)
    console.warn(
      `   Warning: Expected ${comboData.length} combos ` +
        `but got ${combos.length} combos`,
    );

  const comboIds: ComboIds = combos.reduce<ComboIds>((acc, combo) => {
    acc[
      combo.name
        .slice(0, combo.name.indexOf(' '))
        .toUpperCase() as keyof ComboIds
    ] = combo.id;
    return acc;
  }, {} as ComboIds);

  return comboIds;
}

/**
 * Seeds combo products linking combos to products.
 */
async function seedComboProducts(
  comboIds: ComboIds,
  productIds: ProductIds,
): Promise<void> {
  console.log('Combo Products:');

  // Hardcoded combo products
  const cheeseburgerComboProduct: InferInsertModel<typeof comboProductTable> = {
    combo_id: comboIds.CHEESEBURGER,
    product_id: productIds.CHEESEBURGER,
    extra_price: '0.00',
  };
  const friesComboProduct: InferInsertModel<typeof comboProductTable> = {
    combo_id: comboIds.FRIES,
    product_id: productIds.FRENCH_FRIES,
    extra_price: '0.00',
  };
  const colaComboProduct: InferInsertModel<typeof comboProductTable> = {
    combo_id: comboIds.DRINK,
    product_id: productIds.COCA_COLA,
    extra_price: '0.00',
  };
  const pepsiComboProduct: InferInsertModel<typeof comboProductTable> = {
    combo_id: comboIds.DRINK,
    product_id: productIds.PEPSI_COLA,
    extra_price: '0.00',
  };
  const spriteComboProduct: InferInsertModel<typeof comboProductTable> = {
    combo_id: comboIds.DRINK,
    product_id: productIds.SPRITE,
    extra_price: '0.00',
  };
  const icedLatteComboProduct: InferInsertModel<typeof comboProductTable> = {
    combo_id: comboIds.DRINK,
    product_id: productIds.ICED_LATTE,
    extra_price: '1.99',
  };
  const comboProductsData = [
    cheeseburgerComboProduct,
    friesComboProduct,
    colaComboProduct,
    pepsiComboProduct,
    spriteComboProduct,
    icedLatteComboProduct,
  ];

  const comboProducts = await db
    .insert(comboProductTable)
    .values(comboProductsData)
    .returning();
  console.log(`   Created ${comboProducts.length} combo products`);
  if (comboProducts.length !== comboProductsData.length)
    console.warn(
      `   Warning: Expected ${comboProductsData.length} combo products ` +
        `but got ${comboProducts.length} combo products`,
    );
}

/**
 * Seeds template combos linking templates to combos.
 */
async function seedTemplateCombos(
  comboIds: ComboIds,
  templateIds: ProductTemplateIds,
): Promise<void> {
  console.log('Template Combos:');

  // Hardcoded template combos
  const cheeseburgerTemplateCombo: InferInsertModel<typeof templateComboTable> =
    {
      template_id: templateIds.CHEESEBURGER_VALUE_MEAL,
      combo_id: comboIds.CHEESEBURGER,
    };
  const friesTemplateCombo: InferInsertModel<typeof templateComboTable> = {
    template_id: templateIds.CHEESEBURGER_VALUE_MEAL,
    combo_id: comboIds.FRIES,
  };
  const drinkTemplateCombo: InferInsertModel<typeof templateComboTable> = {
    template_id: templateIds.CHEESEBURGER_VALUE_MEAL,
    combo_id: comboIds.DRINK,
  };
  const templateComboData = [
    cheeseburgerTemplateCombo,
    friesTemplateCombo,
    drinkTemplateCombo,
  ];

  const templateCombos = await db
    .insert(templateComboTable)
    .values(templateComboData)
    .returning();
  console.log(`   Created ${templateCombos.length} template combos`);
  if (templateCombos.length !== templateComboData.length)
    console.warn(
      `   Warning: Expected ${templateComboData.length} template combos ` +
        `but got ${templateCombos.length} template combos`,
    );
}
// endregion

// region Drivers
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

  // Ensure required context is available
  if (!context.uomIds)
    throw new Error('Required UOM IDs not found for product data');

  await seedInventoryFolder();

  const templateIds = await seedProductTemplates(context.uomIds);
  const productIds = await seedProducts(templateIds);
  const comboIds = await seedCombos();

  context = {
    ...context,
    productIds,
    comboIds,
  };

  await seedComboProducts(comboIds, productIds);
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
// endregion
