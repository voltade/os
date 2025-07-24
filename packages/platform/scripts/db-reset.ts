import { superuserSql as sql } from './utils/sql.ts';

await sql`drop database if exists app with (force)`;
await sql`create database app owner app`;
