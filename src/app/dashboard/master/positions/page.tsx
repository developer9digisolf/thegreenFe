import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "Positions | The Green Spa",
  description: "Manage employee positions in The Green Spa system",
};

const Positions = lazy(
  () => import("@afx/views/dashboard/master/positions/index.layout"),
);

export default function PositionsRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Positions />
    </Suspense>
  );
}
