import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "Master Metode Pembayaran | The Green Spa",
  description: "Kelola berbagai pilihan pembayaran untuk pelanggan dan integrasi POS di The Green Spa",
};

const PaymentMethods = lazy(
  () => import("@afx/views/dashboard/master/payment-methods/PaymentMethodsView"),
);

export default function PaymentMethodsRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-medium">Memuat Data Pembayaran...</div>}>
      <PaymentMethods />
    </Suspense>
  );
}
