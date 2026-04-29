'use client';

import { useModel } from "@afx/model-reg";
import OneTimeShiftsView from "./main.layout";

export default useModel(OneTimeShiftsView, () => [
  require("@afx/models/dashboard/master/employee-shifts.model").default,
  require("@afx/models/dashboard/master/employees.model").default,
]);
