import { Metadata } from "next";
import { lazy } from "react";

export const metadata: Metadata = {
  title: "Positions | The Green Spa",
  description: "Manage your positions in The Green Spa system",
};

const Positions = lazy(
  () => import("@afx/views/dashboard/organizations/positions/index.layout"),
);

export default function PositionsRoute() {
  return <Positions />;
}
