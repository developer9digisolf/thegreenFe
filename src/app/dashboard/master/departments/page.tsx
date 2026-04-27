import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "Departments | The Green Spa",
  description: "Manage company departments in The Green Spa system",
};

const Departments = lazy(
  () => import("@afx/views/dashboard/master/departments/index.layout"),
);

export default function DepartmentsRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Departments />
    </Suspense>
  );
}
