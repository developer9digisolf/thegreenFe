'use client';

import { useModel } from "@afx/model-reg";
import DepartmentView from "./main.layout";

export default useModel(DepartmentView, () => [
  require("@afx/models/dashboard/master/departments.model").default,
]);
