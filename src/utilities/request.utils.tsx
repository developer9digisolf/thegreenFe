import { Modal } from 'antd'
import axios, { ResponseType } from 'axios'
import UseStorages from './storage.util'

interface IRequestPayloads<T = any> {
  url: string
  method: 'GET' | 'PUT' | 'DELETE' | 'PATCH' | 'POST'
  headers?: any
  data?: T
  bodyType?: 'raw' | 'formData'
  responseType?: ResponseType
}

interface IResponsePayloads<T = any> {
  success: boolean
  message: string
  data: T
  pagination?: any
  meta?: any // Keep meta for backward compatibility if needed, but TheGreenApi doesn't use it
}

const getQueryByName = (name: string, url: string) => {
  const match = RegExp('[?&]' + name + '=([^&]*)').exec(url)

  return match && decodeURIComponent(match[1].replace(/\+/g, ' '))
}

const randomAuthKey = (Math.random() * 1738).toFixed(3)

export default async function request<T = any, R = any>({
  url,
  method = 'GET',
  headers = {},
  bodyType = 'raw',
  responseType = 'json',
  data
}: IRequestPayloads<R>): Promise<IResponsePayloads<T>> {
  const [token] = UseStorages.getItem('THEGREEN@TOKEN').data
  const baseUrl = process.env.BASEURL || "http://localhost:5000/api/"

  let extendedItems: any = {}

  if (method === 'GET') {
    extendedItems = {
      params: data
    }
  } else {
    extendedItems = {
      data: bodyType === 'formData' ? data : JSON.stringify({ ...data })
    }
  }

  return new Promise((resolve, reject) =>
    axios
      .request({
        url: `${baseUrl}${url}`,
        headers: {
          'Content-Type':
            bodyType === 'formData'
              ? 'multipart/form-data'
              : 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          Authorization: `Bearer ${token}`
        },
        method,
        responseType,
        ...extendedItems
      })
      .then(response => {
        // TheGreenApi returns { success, message, data } directly
        // Adapter for old structure if needed:
        // if (response.data.meta) resolve(response.data)

        // Return the whole body
        resolve(response.data)
      })
      .catch(error => {
        return reject(error?.response?.data || error.message)
      })
  )
}