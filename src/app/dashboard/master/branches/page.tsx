import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "Branches | The Green Spa",
  description: "Manage your branches in The Green Spa system",
};

const Branches = lazy(
  () => import("@afx/views/dashboard/master/branches/index.layout"),
);

export default function BranchesRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Branches />
    </Suspense>
  );
}