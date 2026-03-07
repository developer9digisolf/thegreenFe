'use client';

import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import useSWRMutation, { MutationFetcher } from 'swr/mutation';
import { useCallback } from 'react';
import { simpleFetcher, postFetcher, putFetcher, deleteFetcher } from '@afx/utils/swr-fetcher';

interface IUseApiProps {
  key: string | null | false;
  enabled?: boolean;
  config?: SWRConfiguration;
}

interface IUseApiMutationProps<TData = any, TError = any> {
  key: string | null | false;
  enabled?: boolean;
}

/**
 * Custom hook for GET requests with SWR
 *
 * @param key - The cache key (URL or identifier)
 * @param enabled - Whether to fetch data (default: true)
 * @param config - Additional SWR configuration
 *
 * @example
 * const { data, error, isLoading } = useApi('/api/members');
 */
export function useApi<T = any>({ key, enabled = true, config = {} }: IUseApiProps): SWRResponse<T, any> & { data: T | undefined } {
  const shouldFetch = enabled && key !== null && key !== false;

  return useSWR<T>(
    shouldFetch ? key : null,
    simpleFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
      keepPreviousData: true,
      ...config,
    }
  );
}

/**
 * Custom hook for paginated data
 *
 * @param key - The cache key
 * @param params - Query parameters
 * @param enabled - Whether to fetch data
 *
 * @example
 * const { data, error, isLoading } = usePaginatedApi('/api/members', { page: 1, pageSize: 10 });
 */
export function usePaginatedApi<T = any, P = Record<string, any>>(
  key: string | null,
  params: P | null = null,
  enabled = true
) {
  const queryString = params ? new URLSearchParams(params as any).toString() : '';
  const fullKey = params ? `${key}?${queryString}` : key;

  const response = useSWR<T>(
    enabled && key ? fullKey : null,
    simpleFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
      keepPreviousData: true,
    }
  );

  return {
    ...response,
    data: response.data,
  };
}

/**
 * Custom hook for POST mutations
 *
 * @param key - The cache key for the mutation
 * @param onSuccess - Callback after successful mutation
 *
 * @example
 * const { trigger, isMutating } = usePostMutation('/api/members');
 * await trigger({ name: 'John' });
 */
export function usePostMutation<TData = any, TError = any, TBody = any>(
  key: string | null,
  onSuccess?: (data: TData) => void
) {
  return useSWRMutation<TData, TError, string, TBody>(
    key || '',
    async (url: string, { arg }: { arg: TBody }) => {
      return postFetcher<TData, TBody>({ url, data: arg });
    },
    {
      onSuccess: (data) => {
        onSuccess?.(data);
      },
    }
  );
}

/**
 * Custom hook for PUT mutations
 *
 * @param key - The cache key for the mutation
 * @param onSuccess - Callback after successful mutation
 *
 * @example
 * const { trigger, isMutating } = usePutMutation('/api/members/1');
 * await trigger({ name: 'John Updated' });
 */
export function usePutMutation<TData = any, TError = any, TBody = any>(
  key: string | null,
  onSuccess?: (data: TData) => void
) {
  return useSWRMutation<TData, TError, string, TBody>(
    key || '',
    async (url: string, { arg }: { arg: TBody }) => {
      return putFetcher<TData, TBody>({ url, data: arg });
    },
    {
      onSuccess: (data) => {
        onSuccess?.(data);
      },
    }
  );
}

/**
 * Custom hook for DELETE mutations
 *
 * @param key - The cache key for the mutation
 * @param onSuccess - Callback after successful deletion
 *
 * @example
 * const { trigger, isMutating } = useDeleteMutation('/api/members/1');
 * await trigger();
 */
export function useDeleteMutation<TData = any, TError = any>(
  key: string | null,
  onSuccess?: (data: TData) => void
) {
  return useSWRMutation<TData, TError, string, never>(
    key || '',
    async (url: string) => {
      return deleteFetcher<TData>(url);
    },
    {
      onSuccess: (data) => {
        onSuccess?.(data);
      },
    }
  );
}

/**
 * Custom hook for fetching with manual refresh control
 *
 * @param key - The cache key
 * @param enabled - Whether to fetch data
 *
 * @example
 * const { data, refresh, isLoading } = useApiWithRefresh('/api/members');
 */
export function useApiWithRefresh<T = any>(key: string | null, enabled = true) {
  const response = useSWR<T>(
    enabled && key ? key : null,
    simpleFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  );

  const refresh = useCallback(() => {
    if (key) {
      response.mutate();
    }
  }, [key, response.mutate]);

  return {
    ...response,
    refresh,
  };
}
