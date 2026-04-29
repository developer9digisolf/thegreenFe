'use client';

import dynamic from 'next/dynamic';
import { useModel } from "@afx/model-reg";
import EmployeeView from "./main.layout";

export default useModel(EmployeeView, () => [
  require("@afx/models/dashboard/master/employees.model").default,
  require("@afx/models/dashboard/master/departments.model").default,
  require("@afx/models/dashboard/master/positions.model").default,
]);
