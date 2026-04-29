import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "Recurring Shifts | The Green Spa",
  description: "Manage permanent weekly shift patterns for employees at The Green Spa",
};

const RecurringShifts = lazy(
  () => import("@afx/views/dashboard/organizations/employees/recurring-shifts/index.layout"),
);

export default function RecurringShiftsRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-medium italic animate-pulse">Loading Schedule...</div>}>
      <RecurringShifts />
    </Suspense>
  );
}
