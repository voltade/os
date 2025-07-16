import { eq, sql } from 'drizzle-orm';
import { pgView } from 'drizzle-orm/pg-core';

import { productTable } from '../../product/tables/product.ts';
import { productTemplateTable } from '../../product/tables/product_template.ts';
import { entityTable } from '../../resource/tables/entity.ts';
import { partnerTable } from '../../resource/tables/partner.ts';
import { userTable } from '../../resource/tables/user.ts';
import { repairOrderTable } from '../tables/repair_order.ts';

export const repairOrderView = pgView('repair_order_view').as((qb) =>
  qb
    .select({
      id: repairOrderTable.id,
      reference_number: repairOrderTable.reference_number,
      status: repairOrderTable.status,
      priority: repairOrderTable.priority,
      technician_notes: repairOrderTable.technician_notes,
      warranty_covered: repairOrderTable.warranty_covered,
      parts_delivery_delayed: repairOrderTable.parts_delivery_delayed,
      scheduled_repair_date: repairOrderTable.scheduled_repair_date,
      custom_properties: repairOrderTable.custom_properties,
      // created_at: repairOrderTable.created_at,
      // updated_at: repairOrderTable.updated_at,

      // Company information
      company_id: repairOrderTable.company_id,
      company_name: sql<string>`${entityTable.name}`.as('company_name'),

      // Customer/Partner information
      customer_id: repairOrderTable.customer_id,
      customer_name: sql<string>`${partnerTable.name}`.as('customer_name'),

      // Product information
      product_id: repairOrderTable.product_id,
      product_name: sql<string>`${productTemplateTable.name}`.as(
        'product_name',
      ),

      // Assigned technician information
      assigned_technician_id: repairOrderTable.assigned_technician_id,
      assigned_technician_first_name: sql<string>`${userTable.first_name}`.as(
        'assigned_technician_first_name',
      ),
      assigned_technician_last_name: sql<string>`${userTable.last_name}`.as(
        'assigned_technician_last_name',
      ),

      // Created by user information
      created_by: repairOrderTable.created_by,

      // Last modified by user information
      updated_by: repairOrderTable.updated_by,
    })
    .from(repairOrderTable)
    .leftJoin(entityTable, eq(repairOrderTable.company_id, entityTable.id))
    .leftJoin(partnerTable, eq(repairOrderTable.customer_id, partnerTable.id))
    .leftJoin(productTable, eq(repairOrderTable.product_id, productTable.id))
    .leftJoin(
      productTemplateTable,
      eq(productTable.template_id, productTemplateTable.id),
    )
    .leftJoin(
      userTable,
      eq(repairOrderTable.assigned_technician_id, userTable.id),
    )
    .orderBy(repairOrderTable.created_at),
);
