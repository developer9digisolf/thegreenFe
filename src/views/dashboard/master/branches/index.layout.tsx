'use client';

import dynamic from 'next/dynamic';

const MapPicker = dynamic(
  () => import('@afx/components/ui/maps/MapPicker'),
  { ssr: false }
);
import { useModel } from "@afx/model-reg";
import BranchView from "./main.layout";

export default useModel(BranchView, () => [
  require("@afx/models/dashboard/master/branches.model").default,
]);
