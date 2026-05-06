"use client";

import { use } from "react";
import { lazy, Suspense } from "react";

const EmployeeDetail = lazy(
  () => import("@afx/views/dashboard/organizations/employees/EmployeeDetailIndex.layout"),
);

export default function EmployeeDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = parseInt(resolvedParams.id);

  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-medium">Memuat Detail Karyawan...</div>}>
      <EmployeeDetail id={id} />
    </Suspense>
  );
}
