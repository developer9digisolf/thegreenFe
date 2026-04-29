import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "One-Time Shifts | The Green Spa",
  description: "Manage specific one-time shifts for employees at The Green Spa",
};

const OneTimeShifts = lazy(
  () => import("@afx/views/dashboard/organizations/employees/one-time-shifts/index.layout"),
);

export default function OneTimeShiftsRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-medium italic animate-pulse">Loading Calendar...</div>}>
      <OneTimeShifts />
    </Suspense>
  );
}
