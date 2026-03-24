import request from './request.utils';

interface IFetcherProps {
  url: string;
  data?: any;
}

/**
 * SWR fetcher for GET requests
 * Wraps the existing request utility for SWR compatibility
 */
export async function fetcher<T = any>({ url, data }: IFetcherProps): Promise<T> {
  const response = await request<T>({
    url,
    method: 'GET',
    data,
  });

  if (response.success) {
    return response.data as T;
  }

  throw new Error(response.message || 'Request failed');
}

/**
 * Simple fetcher for GET requests with URL string
 */
export async function simpleFetcher(url: string): Promise<any> {
  return fetcher({ url });
}

/**
 * POST fetcher for mutations
 */
export async function postFetcher<T = any, R = any>({ url, data }: IFetcherProps): Promise<T> {
  const response = await request<T>({
    url,
    method: 'POST',
    data,
  });

  if (response.success) {
    return response.data as T;
  }

  throw new Error(response.message || 'Request failed');
}

/**
 * PUT fetcher for updates
 */
export async function putFetcher<T = any, R = any>({ url, data }: IFetcherProps): Promise<T> {
  const response = await request<T>({
    url,
    method: 'PUT',
    data,
  });

  if (response.success) {
    return response.data as T;
  }

  throw new Error(response.message || 'Request failed');
}

/**
 * DELETE fetcher
 */
export async function deleteFetcher<T = any>(url: string): Promise<T> {
  const response = await request<T>({
    url,
    method: 'DELETE',
  });

  if (response.success) {
    return response.data as T;
  }

  throw new Error(response.message || 'Request failed');
}
