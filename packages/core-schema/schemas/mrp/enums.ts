import { mrpSchema } from './schema.ts';

export const productionWorkorderStateEnum = mrpSchema.enum(
  'production_workorder_state',
  ['pending', 'in_progress', 'completed', 'cancelled'],
);

const unitsEnum = mrpSchema.enum('units_enum', [
  'unit',
  'kg',
  'g',
  'l',
  'ml',
  'mm',
  'cm',
  'm',
  'km',
  'inch',
  'feet',
  'yard',
  'mile',
  'pcs',
  'box',
  'bag',
  'can',
  'bottle',
  'jar',
  'tube',
  'packet',
]);

const productionStatusEnum = mrpSchema.enum('production_status', [
  'draft',
  'confirmed',
  'completed',
  'cancelled',
]);

export { unitsEnum, productionStatusEnum };
