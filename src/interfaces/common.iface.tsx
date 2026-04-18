export interface IReqPagination {
  page: number;
  pageSize: number;
  search: string;
  sortColumn: string;
  sortDirection: "desc" | "asc";
}

export interface IResPagination {
  lastPage: number;
  currentPage: number;
  path: string;
  total: number;
  pageSize: number;
}
