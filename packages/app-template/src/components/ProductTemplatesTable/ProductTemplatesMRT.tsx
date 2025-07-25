import 'mantine-react-table/styles.css';

import { Stack } from '@mantine/core';
import {
  type Database,
  useProductTemplates,
} from '@voltade/core-schema/supabase';
import {
  MantineReactTable,
  type MRT_ColumnDef,
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
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'list_price',
    header: 'List Price',
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
];

export default function ProductTemplatesMRT() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [rowCount, setRowCount] = useState(0);

  const { data, isLoading } = useProductTemplates({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    supabase,
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
    state: { pagination, isLoading },
    manualPagination: true,
    enablePagination: true,
    enableSorting: false, // TODO: Backend sorting.
    enableFilters: false, // TODO: Backend filtering.
    rowCount,
  });

  return (
    <Stack>
      <MantineReactTable table={table} />
    </Stack>
  );
}
