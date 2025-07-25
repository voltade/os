import { Group, Pagination, Select, Stack, Table } from '@mantine/core';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { Database } from '@voltade/core-schema/supabase';
import { useProductTemplates } from '@voltade/core-schema/supabase';
import { useEffect, useMemo, useState } from 'react';

import { supabase } from '#lib/supabase.ts';
import UneditableMoneyCell from './UneditableMoneyCell.tsx';
import UneditableNumberCell from './UneditableNumberCell.tsx';
import UneditableTextCell from './UneditableTextCell.tsx';

type ProductTemplate =
  Database['public']['Views']['product_template_view']['Row'];

const columns: ColumnDef<ProductTemplate>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ getValue }) => {
      const value = getValue() as ProductTemplate['id'];
      return value ? <UneditableNumberCell value={value} /> : null;
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue }) => {
      const value = getValue() as ProductTemplate['name'];
      return value ? <UneditableTextCell value={value} /> : null;
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ getValue }) => {
      const value = getValue() as ProductTemplate['description'];
      return value ? <UneditableTextCell value={value} /> : null;
    },
  },
  {
    accessorKey: 'list_price',
    header: 'List Price',
    cell: ({ getValue }) => {
      const value = getValue() as ProductTemplate['list_price'];
      return value ? <UneditableMoneyCell value={value} /> : null;
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ getValue }) => {
      const value = getValue() as ProductTemplate['category'];
      return value ? <UneditableTextCell value={value} /> : null;
    },
  },
];

export default function ProductsTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const {
    data: products,
    isLoading,
    error,
  } = useProductTemplates({ page, pageSize, supabase });

  useEffect(() => {
    if (products?.count !== undefined) {
      setTotalCount(products.count);
    }
  }, [products?.count]);

  const numOfPages = Math.ceil(totalCount / pageSize);

  const table = useReactTable<ProductTemplate>({
    data: products?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const controls = useMemo(
    () => (
      <Group justify="space-between">
        <Pagination total={numOfPages} value={page} onChange={setPage} />
        <Select
          data={[1, 2, 5, 10, 20, 50, 100].map((value) => ({
            value: value.toString(),
            label: `Show ${value} per page`,
          }))}
          value={pageSize.toString()}
          onChange={(value) => {
            setPageSize(Number(value));
            setPage(1);
          }}
          label="Items per page"
          placeholder="Select items per page"
        />
      </Group>
    ),
    [numOfPages, page, pageSize],
  );

  if (error) {
    return <div>Error: {(error as Error).message}</div>;
  }

  return (
    <Stack>
      {controls}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Table striped withTableBorder highlightOnHover withColumnBorders>
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}
