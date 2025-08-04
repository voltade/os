import 'mantine-react-table/styles.css';

import { Stack } from '@mantine/core';
import {
  type Database,
  useProductTemplates,
} from '@voltade/core-schema/pgRest';
import {
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFilterFnsState,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
  useMantineReactTable,
} from 'mantine-react-table';
import { useEffect, useState } from 'react';

import { pgRest } from '#lib/pg-rest';

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

  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const { data, isLoading } = useProductTemplates({
    pagination,
    pgRest,
    columnFilters,
    columnFilterFns,
    sorting,
  });

  useEffect(() => {
    if (data?.count !== undefined) {
      setRowCount(data.count);
    }
  }, [data?.count]);

  // Reset to first page when page size, column filters, or sorting changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: This is intentional to reset pagination.
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, [pagination.pageSize, columnFilters, sorting]);

  const table = useMantineReactTable({
    columns,
    data: data?.data ?? [],
    onPaginationChange: setPagination,
    state: { pagination, isLoading, columnFilterFns, columnFilters, sorting },
    rowCount,

    // Pagination
    manualPagination: true,
    enablePagination: true,

    // Sorting
    enableSorting: true,
    manualSorting: true,
    onSortingChange: setSorting,

    // Filtering
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
