import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "Paket Voucher | The Green Spa",
  description: "Kelola paket voucher layanan spa di The Green Spa",
};

const ServicePackages = lazy(
  () => import("@afx/views/dashboard/master/service-packages/index.layout"),
);

export default function ServicePackagesRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-medium">Memuat Data Paket Voucher...</div>}>
      <ServicePackages />
    </Suspense>
  );
}
