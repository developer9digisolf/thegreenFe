import { Metadata } from "next";
import { lazy } from "react";

export const metadata: Metadata = {
  title: "Companies | The Green Spa",
  description: "Manage your companies in The Green Spa system",
};

const Companies = lazy(
  () => import("@afx/views/dashboard/master/companies/index.layout"),
);

export default function BookingCashierRoute() {
  return <Companies />;
}
