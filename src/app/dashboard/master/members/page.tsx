import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "Master Member | The Green Spa",
  description: "Kelola data pelanggan, saldo credit, dan riwayat member di The Green Spa",
};

const Members = lazy(
  () => import("@afx/views/dashboard/master/members/MembersView"),
);

export default function MembersRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-medium">Memuat Data Member...</div>}>
      <Members />
    </Suspense>
  );
}
