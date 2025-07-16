import { eq } from 'drizzle-orm';

import { productTable } from '../../product/tables/product.ts';
import { productTemplateTable } from '../../product/tables/product_template.ts';
import { purchaseSchema } from '../schema.ts';

export const distinctProductsByTemplate = purchaseSchema
  .view('distinct_products_by_template_view')
  .as((qb) =>
    qb
      .selectDistinctOn([productTemplateTable.name], {
        id: productTable.id,
        name: productTemplateTable.name,
      })
      .from(productTable)
      .innerJoin(
        productTemplateTable,
        eq(productTemplateTable.id, productTable.template_id),
      )
      .orderBy(productTemplateTable.name, productTable.id),
  );
