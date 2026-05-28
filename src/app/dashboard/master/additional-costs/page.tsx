import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "Master Biaya Tambahan | The Green Spa",
  description:
    "Kelola biaya tambahan seperti pajak, tip, dan biaya layanan lainnya di The Green Spa",
};

const AdditionalCosts = lazy(
  () =>
    import("@afx/views/dashboard/master/additional-costs/AdditionalCostsView"),
);

export default function AdditionalCostsRoute() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 font-medium">
          Memuat Data Biaya Tambahan...
        </div>
      }
    >
      <AdditionalCosts />
    </Suspense>
  );
}
