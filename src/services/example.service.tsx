import { IExample } from '@afx/interfaces/example.iface'
import { rest } from '@afx/utils/config.rest'
import request from '@afx/utils/request.utils'

export function ExamplePostService(data: IExample) {
  return request<any>({
    url: rest.examplePost,
    data,
    method: 'POST'
  })
}

export function ExampleGetService() {
  return request<any>({
    url: rest.exampleGet,
    method: 'GET'
  })
}

export function ExampleDelService(id: any) {
  return request<any>({
    url: rest.exampleDel.replace(":ID", id),
    method: 'DELETE'
  })
}
