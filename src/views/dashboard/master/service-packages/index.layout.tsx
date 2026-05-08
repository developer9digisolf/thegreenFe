'use client';

import { useModel } from "@afx/model-reg";
import ServicePackageView from "./main.layout";

export default useModel(ServicePackageView, () => [
  require("@afx/models/dashboard/master/service-packages.model").default,
]);
