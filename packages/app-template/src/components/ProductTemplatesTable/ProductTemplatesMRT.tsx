import 'mantine-react-table/styles.css';

import { Stack } from '@mantine/core';
import {
  type Database,
  useProductTemplates,
} from '@voltade/core-schema/supabase';
import {
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFilterFnsState,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  useMantineReactTable,
} from 'mantine-react-table';
import { useEffect, useState } from 'react';

import { supabase } from '#lib/supabase.ts';

type ProductTemplate =
  Database['public']['Views']['product_template_view']['Row'];

const columns: MRT_ColumnDef<ProductTemplate>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    filterFn: 'equals',
  },
  {
    accessorKey: 'name',
    header: 'Name',
    filterFn: 'contains',
  },
  {
    accessorKey: 'description',
    header: 'Description',
    filterFn: 'contains',
  },
  {
    accessorKey: 'list_price',
    header: 'List Price',
    filterFn: 'equals',
  },
  {
    // TODO: Improve UX for category filtering.
    // Currently, entering a non-existing category will cause a database-level error.
    accessorKey: 'category',
    header: 'Category',
    filterFn: 'equals',
  },
];

export default function ProductTemplatesMRT() {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [rowCount, setRowCount] = useState(0);

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    [],
  );

  const [columnFilterFns, setColumnFilterFns] =
    useState<MRT_ColumnFilterFnsState>(
      Object.fromEntries(
        columns.map(({ accessorKey, filterFn }) => [accessorKey, filterFn]),
      ) as MRT_ColumnFilterFnsState,
    );

  const { data, isLoading } = useProductTemplates({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    supabase,
    columnFilters,
    columnFilterFns,
  });

  useEffect(() => {
    if (data?.count !== undefined) {
      setRowCount(data.count);
    }
  }, [data?.count]);

  const table = useMantineReactTable({
    columns,
    data: data?.data ?? [],
    onPaginationChange: setPagination,
    state: { pagination, isLoading, columnFilterFns, columnFilters },
    manualPagination: true,
    enablePagination: true,
    enableSorting: false, // TODO: Backend sorting.
    rowCount,
    manualFiltering: true,
    enableFilterMatchHighlighting: false,
    enableColumnFilters: true,
    enableGlobalFilter: false,
    onColumnFilterFnsChange: setColumnFilterFns,
    onColumnFiltersChange: setColumnFilters,
  });

  return (
    <Stack>
      <MantineReactTable table={table} />
    </Stack>
  );
}
