import { Metadata } from "next";
import { lazy } from "react";

export const metadata: Metadata = {
  title: "Departments | The Green Spa",
  description: "Manage your departments in The Green Spa system",
};

const Departments = lazy(
  () => import("@afx/views/dashboard/organizations/departments/index.layout"),
);

export default function DepartmentsRoute() {
  return <Departments />;
}
