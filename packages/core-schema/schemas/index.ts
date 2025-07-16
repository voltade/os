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
import * as services from './services/index.ts';
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
