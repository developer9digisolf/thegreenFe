"use client";

import { IReqCompany } from "@afx/interfaces/master/company.iface";
import {
  IActionCompany,
  IStateCompany,
} from "@afx/models/dashboard/master/companies.model";
import { useStore } from "@afx/store/core";
import { useEffect } from "react";

export default function BookingCompanyView() {
  const {
    useActions,
    isLoading,
    state: { companies },
  } = useStore<IStateCompany, IActionCompany>("companies");

  const getCompanies = () => {
    const params: IReqCompany = {
      page: 1,
      pageSize: 10,
      search: "",
      sortColumn: "",
      sortDirection: "asc",
    };
    useActions<"getCompanies">("getCompanies", [params], true);
  };

  useEffect(() => {
    getCompanies();
  }, []);

  return <div className="">holaa!!</div>;
}
