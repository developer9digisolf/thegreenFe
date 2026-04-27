import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "Master Ruangan | The Green Spa",
  description: "Kelola kapasitas dan status ketersediaan ruangan treatment di The Green Spa",
};

const Rooms = lazy(
  () => import("@afx/views/dashboard/master/rooms/RoomsView"),
);

export default function RoomsRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-medium">Memuat Data Ruangan...</div>}>
      <Rooms />
    </Suspense>
  );
}
