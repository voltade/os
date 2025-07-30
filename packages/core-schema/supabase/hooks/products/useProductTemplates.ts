import { useQuery } from '@tanstack/react-query';
import type {
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
} from 'mantine-react-table';

import type { Database, SupabaseClient } from '../../../supabase/index.ts';

type ProductTemplate =
  Database['public']['Views']['product_template_view']['Row'];

interface UseProductTemplatesOptions {
  page: number;
  pageSize: number;
  supabase: SupabaseClient;
  columnFilters: MRT_ColumnFiltersState;
  columnFilterFns: MRT_ColumnFilterFnsState;
}

interface UseProductTemplatesResult {
  data: ProductTemplate[];
  count: number;
}

export function useProductTemplates({
  page,
  pageSize,
  supabase,
  columnFilters,
  columnFilterFns,
}: UseProductTemplatesOptions) {
  return useQuery({
    queryKey: [
      'product_template',
      { page, limit: pageSize, columnFilters, columnFilterFns },
    ],
    queryFn: async (): Promise<UseProductTemplatesResult> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const query = supabase
        .from('product_template_view')
        .select('*', { count: 'exact' });

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

      const { data, error, count } = await query.range(from, to);

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
