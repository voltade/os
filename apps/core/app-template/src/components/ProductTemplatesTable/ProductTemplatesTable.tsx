import { Group, Pagination, Select, Stack, Table } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { productTemplateTable } from '@voltade/core-schema/schemas';
import { useEffect, useMemo, useState } from 'react';

import { api } from '#lib/api.ts';
import UneditableMoneyCell from './UneditableMoneyCell.tsx';
import UneditableNumberCell from './UneditableNumberCell.tsx';
import UneditableTextCell from './UneditableTextCell.tsx';

type ProductTemplate = typeof productTemplateTable.$inferSelect;

const columns: ColumnDef<ProductTemplate>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ getValue }) => (
      <UneditableNumberCell value={getValue() as number} />
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue }) => <UneditableTextCell value={getValue() as string} />,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ getValue }) => <UneditableTextCell value={getValue() as string} />,
  },
  {
    accessorKey: 'list_price',
    header: 'List Price',
    cell: ({ getValue }) => (
      <UneditableMoneyCell value={getValue() as number} />
    ),
  },
  // TODO: Boolean columns.
  // {
  //   accessorKey: 'is_active',
  //   header: 'Active',
  //   cell: ({ getValue }) => <UneditableTextCell value={String(getValue())} />,
  // },

  // TODO: Enum columns.
  // {
  //   accessorKey: 'category',
  //   header: 'Category',
  //   cell: ({ getValue }) => <UneditableTextCell value={getValue() as string} />,
  // },
];

export default function ProductsTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [numOfPages, setNumOfPages] = useState(1);

  const {
    data: dataAndPagination,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products', { page, limit: pageSize }],
    queryFn: async () => {
      const response = await api.product['product-templates'].$get({
        query: { page: page.toString(), limit: pageSize.toString() },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const dataAndPagination = await response.json();
      return {
        data: dataAndPagination.data.map((productTemplate) => ({
          ...productTemplate,
          created_at: new Date(productTemplate.created_at),
          updated_at: new Date(productTemplate.updated_at),
        })),
        pagination: {
          ...dataAndPagination.pagination,
        },
      };
    },
  });

  useEffect(() => {
    if (dataAndPagination) {
      setNumOfPages(dataAndPagination.pagination.total_pages);
    }
  }, [dataAndPagination]);

  const table = useReactTable<ProductTemplate>({
    data: dataAndPagination?.data ?? [],
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
    return <div>Error: {error.message}</div>;
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
