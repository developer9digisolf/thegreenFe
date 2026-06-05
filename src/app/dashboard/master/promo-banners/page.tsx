import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "Promo Banner | The Green Spa",
  description: "Kelola promo banner di The Green Spa",
};

const PromoBanners = lazy(
  () => import("@afx/views/dashboard/master/promo-banners/index.layout"),
);

export default function PromoBannersRoute() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 font-medium">
          Memuat Data Promo Banner...
        </div>
      }
    >
      <PromoBanners />
    </Suspense>
  );
}
