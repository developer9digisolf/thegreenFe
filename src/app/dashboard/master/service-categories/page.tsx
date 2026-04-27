import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "Master Kategori Layanan | The Green Spa",
  description: "Kelola kategori layanan untuk pengelompokan menu pada POS dan Dashboard di The Green Spa",
};

const ServiceCategories = lazy(
  () => import("@afx/views/dashboard/master/service-categories/ServiceCategoriesView"),
);

export default function ServiceCategoriesRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-medium">Memuat Data Kategori...</div>}>
      <ServiceCategories />
    </Suspense>
  );
}
