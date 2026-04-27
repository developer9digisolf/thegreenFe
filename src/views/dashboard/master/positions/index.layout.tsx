'use client';

import { useModel } from "@afx/model-reg";
import PositionView from "./main.layout";

export default useModel(PositionView, () => [
  require("@afx/models/dashboard/master/positions.model").default,
]);
