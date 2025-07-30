import { useQuery } from '@tanstack/react-query';
import type {
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
  MRT_SortingState,
} from 'mantine-react-table';

import type { Database, SupabaseClient } from '../../../supabase/index.ts';

type ProductTemplate =
  Database['public']['Views']['product_template_view']['Row'];

interface UseProductTemplatesOptions {
  pagination: MRT_PaginationState;
  supabase: SupabaseClient;
  columnFilters: MRT_ColumnFiltersState;
  columnFilterFns: MRT_ColumnFilterFnsState;
  sorting: MRT_SortingState;
}

interface UseProductTemplatesResult {
  data: ProductTemplate[];
  count: number;
}

export function useProductTemplates({
  pagination,
  supabase,
  columnFilters,
  columnFilterFns,
  sorting,
}: UseProductTemplatesOptions) {
  return useQuery({
    queryKey: [
      'product_template',
      { pagination, columnFilters, columnFilterFns, sorting },
    ],
    queryFn: async (): Promise<UseProductTemplatesResult> => {
      const from = pagination.pageIndex * pagination.pageSize;
      const to = from + pagination.pageSize - 1;

      const query = supabase
        .from('product_template_view')
        .select('*', { count: 'exact' });

      // Apply filtering.
      for (const columnId in columnFilterFns) {
        // TODO: Support other filter functions.
        if (columnFilterFns[columnId] === 'contains') {
          const filter = columnFilters.find((f) => f.id === columnId);
          if (filter) {
            query.ilike(columnId, `%${filter.value}%`);
          }
        } else if (columnFilterFns[columnId] === 'equals') {
          const filter = columnFilters.find((f) => f.id === columnId);
          if (filter) {
            query.eq(columnId, `${filter.value}`);
          }
        }
      }

      // Apply sorting.
      if (sorting.length === 0 || !sorting[0]) {
        query.order('id', { ascending: true }); // Sort by ID by default for consistent pagination.
      } else {
        query.order(sorting[0].id, { ascending: !sorting[0].desc });
      }

      // Apply pagination.
      query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
      }

      return {
        data: data || [],
        count: count || 0,
      };
    },
  });
}
