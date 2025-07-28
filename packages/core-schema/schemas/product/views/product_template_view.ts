import { pgView } from 'drizzle-orm/pg-core';

import { productTemplateTable } from '../tables/product_template.ts';

export const productTemplateView = pgView('product_template_view')
  .with({
    checkOption: 'cascaded',
    securityBarrier: true,
    securityInvoker: true,
  })
  .as((qb) =>
    qb
      .select({
        id: productTemplateTable.id,
        name: productTemplateTable.name,
        description: productTemplateTable.description,
        list_price: productTemplateTable.list_price,
        category: productTemplateTable.category,
      })
      .from(productTemplateTable),
  );
