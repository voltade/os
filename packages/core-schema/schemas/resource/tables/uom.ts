import { boolean, decimal, index, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { resourceSchema } from '../schema.ts';

/**
 * Represents a unit of measurement (UoM) for a product.
 * Handles unit conversions and rounding.
 */
export const uomTable = resourceSchema.table(
  'uom',
  {
    ...DEFAULT_COLUMNS,

    // Identification
    /**
     * Human-readable name of the UoM; e.g., kilogram, square meter, etc.
     */
    name: text().notNull(),
    /**
     * Standard unit; e.g., kg, m^2, etc.
     */
    code: text().unique().notNull(),

    // Categorization
    /**
     * Category of units this UoM belongs to; e.g., weight, volume, length, etc.
     * Units in the same category should be convertible to one another.
     */
    category: text(),
    /**
     * Whether this UoM serves as the conversion / rounding reference
     * for all other UoMs in the same category.
     *
     * Reference UoMs do not require conversion / rounding specification.
     */
    is_reference: boolean().default(false),

    /**
     * Ratio to multiply to convert current UoM to reference UoM, if any.
     */
    conversion_ratio: decimal({ precision: 18, scale: 8 }),
    /**
     * Specify rounding for all values of this UoM.
     */
    rounding: decimal({ precision: 10, scale: 4 }),
  },
  (table) => [index('uom_code_idx').on(table.code)],
);
