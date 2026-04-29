import { Metadata } from "next";
import { lazy } from "react";

export const metadata: Metadata = {
  title: "Employees | The Green Spa",
  description: "Manage your employees in The Green Spa system",
};

const Employees = lazy(
  () => import("@afx/views/dashboard/organizations/employees/index.layout"),
);

export default function EmployeesRoute() {
  return <Employees />;
}
