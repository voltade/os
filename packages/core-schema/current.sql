/**
 * Use `--!include path/to/file.sql` to link SQL files in the src directory.
 * Run `bun db:current` to execute linked SQL statements in the current database.
 * Run `bun db:commit` to add the linked SQL statements to the drizzle migrations.
 */
--!include extensions/*.sql
/**
 * Import all functions and triggers (triggers may depend on functions).
 */
--!include schemas/*/functions/*.sql
--!include schemas/*/triggers/*.sql
