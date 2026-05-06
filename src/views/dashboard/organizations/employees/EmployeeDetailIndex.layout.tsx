"use client";

import { useModel } from "@afx/model-reg";
import EmployeeDetailView from "./EmployeeDetailView";

export default useModel(EmployeeDetailView, () => [
  require("@afx/models/dashboard/master/employees.model").default,
  require("@afx/models/dashboard/master/departments.model").default,
  require("@afx/models/dashboard/master/positions.model").default,
  require("@afx/models/dashboard/master/employee-shifts.model").default,
  require("@afx/models/dashboard/master/shifts.model").default,
]);
