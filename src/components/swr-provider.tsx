'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { simpleFetcher } from '@afx/utils/swr-fetcher';

interface ISWRProviderProps {
  children: ReactNode;
}

/**
 * Global SWR configuration provider
 * Place this at the root of your app to configure SWR globally
 */
export function SWRProvider({ children }: ISWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher: simpleFetcher,
        revalidateOnFocus: false, // Don't refetch on window focus for better performance
        revalidateOnReconnect: true, // Refetch on reconnect
        dedupingInterval: 2000, // Deduplicate requests within 2 seconds
        errorRetryCount: 3, // Retry failed requests 3 times
        errorRetryInterval: 5000, // Retry every 5 seconds
        keepPreviousData: true, // Keep previous data when fetching new data
        refreshInterval: 0, // Don't auto-refresh by default
        shouldRetryOnError: true,
        loadingTimeout: 10000, // Timeout after 10 seconds
        onError: (error, key) => {
          // Global error handler
          if (error.status !== 403 && error.status !== 404) {
            console.error(`SWR Error fetching ${key}:`, error);
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
