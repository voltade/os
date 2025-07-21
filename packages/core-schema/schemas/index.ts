/**
 * This file is to support the typed [include relations](https://orm.drizzle.team/docs/rqb#include-relations) from drizzle query (the drizzle easy mode)
 */

import * as accounting from './accounting/index.ts';
import * as approval from './approval/index.ts';
import * as hr from './hr/index.ts';
import * as manufacturing from './manufacturing/index.ts';
import * as mrp from './mrp/index.ts';
import * as payment from './payment/index.ts';
import * as product from './product/index.ts';
import * as project from './project/index.ts';
import * as purchase from './purchase/index.ts';
import * as repair from './repair/index.ts';
import * as resource from './resource/index.ts';
import * as sales from './sales/index.ts';
import * as services from './service/index.ts';
import * as stock from './stock/index.ts';

const schema = {
  ...accounting,
  ...approval,
  ...hr,
  ...manufacturing,
  ...mrp,
  ...payment,
  ...product,
  ...project,
  ...purchase,
  ...repair,
  ...sales,
  ...services,
  ...stock,
  ...resource,
};

export default schema;

export type Schema = typeof schema;

// Re-export all individual tables and types for direct imports
export * from './accounting/index.ts';
export * from './approval/index.ts';
export * from './hr/index.ts';
export * from './manufacturing/index.ts';
export * from './mrp/index.ts';
export * from './payment/index.ts';
export * from './product/index.ts';
export * from './project/index.ts';
export * from './purchase/index.ts';
export * from './repair/index.ts';
export * from './resource/index.ts';
export * from './sales/index.ts';
export * from './service/index.ts';
export * from './stock/index.ts';
