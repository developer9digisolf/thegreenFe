import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "Master Layanan | The Green Spa",
  description: "Kelola menu layanan spa, durasi, dan variasi harga di The Green Spa",
};

const Services = lazy(
  () => import("@afx/views/dashboard/master/services/ServicesView"),
);

export default function ServicesRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-medium">Memuat Data Layanan...</div>}>
      <Services />
    </Suspense>
  );
}
