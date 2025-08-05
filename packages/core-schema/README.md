# core-schema

## Naming Conventions

⚠️ NOTE: The schema does not strictly enforce these conventions yet. These naming conventions are a draft.

### Table Names

- **Snake case**: All PostgreSQL table names are in lower snake case.
- **Singular form**: Tables are named in singular, not plural.
- **Schema-prefixed**: Tables are organized by schema. The TypeScript name should be prefixed with the schema name, but the PostgreSQL table name itself should not include the schema prefix.
  ```typescript
  // ✅ Good
  export const productProductTable = productSchema.table('product', { ... });
  export const salesOrderLineTable = salesSchema.table('order_line', { ... });
  ```
- **Many-to-many relationships**: Use junction table names of the form `{table_A}_join_{table_B}`
  ```typescript
  export const productJoinCategoryTable = productSchema.table(
    'product_join_category',
    {...}
  );
  ```
  TODO: Enforce this.

### Column Names

- **Snake case**: All column names are in lower snake case.
- **Descriptive suffixes**: Use consistent suffixes for foreign keys and special columns.
  - `_id` for foreign key references: `product_id`, `currency_id`
  - `_at` for timestamps: `created_at`, `updated_at`, `reserved_at`
  - `_by` for user references: `created_by`, `updated_by`
  ```typescript
  // ✅ Good
  {
    product_id: integer().notNull(),
    created_at: timestampCol('created_at').defaultNow(),
    updated_by: integer(),
  }
  ```

### Primary Keys

- **Always `id`**: All tables use `id` as the primary key column name.
- **Identity generation**: Use `generatedAlwaysAsIdentity()` for auto-incrementing IDs
  ```typescript
  // Standard pattern from utils.ts
  export const id = integer("id").primaryKey().generatedAlwaysAsIdentity();
  ```

### Foreign Key Constraints

- **Descriptive naming**: Foreign key constraint names follow the pattern `{table}_{column}_fk`
  ```typescript
  foreignKey({
    name: "order_currency_id_fk",
    columns: [table.currency_id],
    foreignColumns: [currencyTable.id],
  });
  ```

### Enum Naming

- TODO.

### View Naming

- **Descriptive suffixes**: Views end with `_view`
- **Domain context**: Include the primary entity name
  ```typescript
  export const repairOrderView = repairSchema.view('order_view').as((qb) => ...);
  ```

### Common Patterns

- **Audit fields**: Standard audit columns in `DEFAULT_COLUMNS`
  ```typescript
  export const DEFAULT_COLUMNS = {
    id,
    created_at,
    updated_at,
    is_active,
  };
  ```
- **Price columns**: Use `priceCol()` utility for monetary values
- **Timestamp columns**: Use `timestampCol()` utility for consistent timezone handling

### File Organization

- **Table files**: `{schema}/tables/{table_name}.ts`
- **Enum files**: `{schema}/enums.ts`
- **View files**: `{schema}/views/{view_name}.ts`
- **Schema files**: `{schema}/schema.ts`
