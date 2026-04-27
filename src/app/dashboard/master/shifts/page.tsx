import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "Master Shift Kerja | The Green Spa",
  description: "Kelola jam operasional dan pembagian waktu kerja karyawan di The Green Spa",
};

const Shifts = lazy(
  () => import("@afx/views/dashboard/master/shifts/ShiftsView"),
);

export default function ShiftsRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-medium">Memuat Data Shift...</div>}>
      <Shifts />
    </Suspense>
  );
}
