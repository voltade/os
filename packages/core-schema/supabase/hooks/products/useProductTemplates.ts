import { useQuery } from '@tanstack/react-query';

import type { Database, SupabaseClient } from '../../../supabase/index.ts';

type ProductTemplate =
  Database['public']['Views']['product_template_view']['Row'];

interface UseProductTemplatesOptions {
  page: number;
  pageSize: number;
  supabase: SupabaseClient;
}

interface UseProductTemplatesResult {
  data: ProductTemplate[];
  count: number;
}

export function useProductTemplates({
  page,
  pageSize,
  supabase,
}: UseProductTemplatesOptions) {
  return useQuery({
    queryKey: ['products', { page, limit: pageSize }],
    queryFn: async (): Promise<UseProductTemplatesResult> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('product_template_view')
        .select('*', { count: 'exact' })
        .range(from, to);

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
