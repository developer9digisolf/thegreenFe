'use client';

import { useModel } from "@afx/model-reg";
import RecurringShiftsView from "./main.layout";

export default useModel(RecurringShiftsView, () => [
  require("@afx/models/dashboard/master/employee-shifts.model").default,
  require("@afx/models/dashboard/master/employees.model").default,
  require("@afx/models/dashboard/master/shifts.model").default,
]);
