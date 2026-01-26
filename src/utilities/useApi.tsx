import { useCallback } from 'react';
import request from './request.utils';

export function useApi() {
    const get = useCallback(async (url: string, params?: any) => {
        try {
            const response = await request({
                url,
                method: 'GET',
                data: params
            });
            return response;
        } catch (error: any) {
            return error;
        }
    }, []);

    const post = useCallback(async (url: string, data?: any) => {
        try {
            const response = await request({
                url,
                method: 'POST',
                data
            });
            return response;
        } catch (error: any) {
            return error;
        }
    }, []);

    const put = useCallback(async (url: string, data?: any) => {
        try {
            const response = await request({
                url,
                method: 'PUT',
                data
            });
            return response;
        } catch (error: any) {
            return error;
        }
    }, []);

    const del = useCallback(async (url: string, data?: any) => {
        try {
            const response = await request({
                url,
                method: 'DELETE',
                data
            });
            return response;
        } catch (error: any) {
            return error;
        }
    }, []);

    const patch = useCallback(async (url: string, data?: any) => {
        try {
            const response = await request({
                url,
                method: 'PATCH',
                data
            });
            return response;
        } catch (error: any) {
            return error;
        }
    }, []);

    return { get, post, put, del, patch };
}
