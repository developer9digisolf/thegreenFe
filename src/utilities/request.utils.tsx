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
  data: T
  meta: { success: boolean; code: string | number; message: string }
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
    const [token] = UseStorages.getItem('EXAMPLE@UTOKEN').data
  const baseUrl = process.env.BASEURL

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
      .then(response => resolve(response.data))
      .catch(error => {
        const msg = error?.response?.data?.meta
        const newMsg = []
        if (
          msg?.message &&
          typeof msg?.message === 'object' &&
          !Array.isArray(msg?.message)
        ) {
          for (const a in msg?.message) {
            newMsg.push(msg?.message?.[a])
          }
          newMsg.flat()
        } else if (typeof msg?.message === 'string') {
          newMsg.push(msg?.message)
        }

        if (
          error?.response?.data?.meta?.code == '40100' &&
          globalThis?.window?.location?.pathname !== 'auth/login'
        ) {
          const [authKey] = UseStorages.getItem('EXAMPLE@UNIQAUTH', true).data

          if (authKey != randomAuthKey) {
            UseStorages.setItem('EXAMPLE@UNIQAUTH', randomAuthKey, true)
            typeof window !== 'undefined' &&
              Modal.warning({
                title: 'Not Authenticated',
                content: 'Please login first',
                onOk: () => {
                  if (globalThis?.window?.location?.replace) {
                    globalThis.window.location.replace(
                      `${window.location.origin}/auth/login`
                    )
                  }
                  UseStorages.dropAll()
                },
                onCancel: undefined
              })
          }
        }
        return reject(error?.response?.data)
      })
  )
}