import { IReqPagination } from "../common.iface";

export interface IReqCompany extends IReqPagination {}
export interface IResCompany {}

export interface IReqFormCompany {
  code: string;
  name: string;
  parentId: number;
  description: string;
  address: string;
  phone: string;
  email: string;
}
