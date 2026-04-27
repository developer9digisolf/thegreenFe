"use client";

import { useModel } from "@afx/model-reg";
import BranchView from "./main.layout";

export default useModel(BranchView, () => [
  require("@afx/models/dashboard/master/branches.model").default,
]);
