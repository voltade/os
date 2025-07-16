import { internalSchema } from '../../schema.ts';

const unitsEnum = internalSchema.enum('units_enum', [
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

const productionStatusEnum = internalSchema.enum('production_status', [
  'draft',
  'confirmed',
  'completed',
  'cancelled',
]);

export { unitsEnum, productionStatusEnum };
