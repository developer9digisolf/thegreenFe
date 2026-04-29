"use client";

import { useModel } from "@afx/model-reg";
import BookingCompanyView from "./main.layout";

export default useModel(BookingCompanyView, () => [
  require("@afx/models/dashboard/master/companies.model").default,
]);
