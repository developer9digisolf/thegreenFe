import { Metadata } from "next";
import { lazy, Suspense } from "react";

export const metadata: Metadata = {
  title: "User Management | The Green Spa",
  description: "Manage system users and access in The Green Spa",
};

const Users = lazy(
  () => import("@afx/views/dashboard/manage-access/users/index.layout"),
);

export default function UsersRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Users />
    </Suspense>
  );
}
