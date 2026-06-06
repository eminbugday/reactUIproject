import { useState, useCallback } from 'react';

interface MutationState<TData> {
  data: TData | null;
  loading: boolean;
  error: string | null;
}

export function useMutation<TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  const [state, setState] = useState<MutationState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setState({ data: null, loading: true, error: null });
      try {
        const data = await mutationFn(variables);
        setState({ data, loading: false, error: null });
        return data;
      } catch (err: any) {
        const error =
          err?.response?.data?.message ??
          err?.response?.data?.title ??
          err?.message ??
          'Bir hata oluştu';
        setState({ data: null, loading: false, error });
        throw err;
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, mutate, reset };
}
