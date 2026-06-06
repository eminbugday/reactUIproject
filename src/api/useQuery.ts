import { useState, useEffect, useCallback, useRef, type DependencyList } from 'react';

export function useQuery<TData = unknown>(
  queryFn: () => Promise<TData>,
  deps: DependencyList = []
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryFn();
      if (mounted.current) setData(result);
    } catch (err: any) {
      if (mounted.current) {
        setError(
          err?.response?.data?.message ??
            err?.response?.data?.title ??
            err?.message ??
            'Veri yüklenemedi'
        );
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    refetch();
    return () => {
      mounted.current = false;
    };
  }, [refetch]);

  return { data, loading, error, refetch };
}
