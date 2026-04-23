import { lazy } from "react";

const Companies = lazy(
  () => import("@afx/views/dashboard/master/companies/index.layout"),
);

export default function BookingCashierRoute() {
  return <Companies />;
}
