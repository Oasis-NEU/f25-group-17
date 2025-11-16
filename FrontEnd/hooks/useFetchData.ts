import { useState, useCallback } from 'react';
import { supabase } from '../../supabase/lib/supabase';

interface UseFetchDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  fetchData: (table: string, column: string, pageSize?: number) => Promise<void>;
}

export function useFetchData<T extends Record<string, any>>(): UseFetchDataReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (
    table: string,
    column: string,
    pageSize: number = 1000
  ) => {
    setLoading(true);
    setError(null);

    try {
      let allData: T[] = [];
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        const { data: pageData, error: fetchError } = await supabase
          .from(table)
          .select(column)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (fetchError) throw new Error(fetchError.message);
        if (!pageData?.length) break;

        allData.push(...(pageData as T[]));
        hasMore = pageData.length === pageSize;
        page++;
      }

      // Remove duplicates and sort if items are strings
      const uniqueData = [...new Set(
        allData.map(item => {
          if (typeof item === 'string') return item;
          // For objects, return as is
          return item;
        })
      )] as T[];

      setData(uniqueData);
    } catch (err) {
      console.error(`Error fetching ${table}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
  };
}
