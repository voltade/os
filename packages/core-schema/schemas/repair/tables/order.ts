import {
  boolean,
  foreignKey,
  integer,
  jsonb,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { productTable } from '../../product/tables/product.ts';
import { entityTable } from '../../resource/tables/entity.ts';
import { partnerTable } from '../../resource/tables/partner.ts';
import { userTable } from '../../resource/tables/user.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { repairOrderPriorityEnum, repairOrderStatusEnum } from '../enums.ts';
import { repairSchema } from '../schema.ts';

export const repairOrderTable = repairSchema
  .table(
    'order',
    {
      ...DEFAULT_COLUMNS,
      company_id: integer(),
      customer_id: integer(),
      assigned_technician_id: integer(),
      product_id: integer(),
      reference_number: varchar({ length: 20 }).notNull().unique(),
      status: repairOrderStatusEnum().default('new'),
      priority: repairOrderPriorityEnum().default('normal'),
      custom_properties: jsonb(),
      technician_notes: text(),
      warranty_covered: boolean().default(false),
      parts_delivery_delayed: boolean('parts_delivery_delayed').default(false),
      scheduled_repair_date: timestamp('scheduled_repair_date'),
      created_by: integer('created_by'),
      updated_by: integer('updated_by'),
    },
    (table) => [
      foreignKey({
        name: 'repair_order_company_id_fk',
        columns: [table.company_id],
        foreignColumns: [entityTable.id],
      }),
      foreignKey({
        name: 'repair_order_customer_id_fk',
        columns: [table.customer_id],
        foreignColumns: [partnerTable.id],
      }),
      foreignKey({
        name: 'repair_order_assigned_technician_id_fk',
        columns: [table.assigned_technician_id],
        foreignColumns: [userTable.id],
      }),
      foreignKey({
        name: 'repair_order_product_id_fk',
        columns: [table.product_id],
        foreignColumns: [productTable.id],
      }),
      foreignKey({
        name: 'repair_order_created_by_user_id_fk',
        columns: [table.created_by],
        foreignColumns: [userTable.id],
      }),
      foreignKey({
        name: 'repair_order_last_modified_by_id_fk',
        columns: [table.updated_by],
        foreignColumns: [userTable.id],
      }),
    ],
  )
  .enableRLS();
