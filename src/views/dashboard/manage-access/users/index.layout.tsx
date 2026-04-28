'use client';

import { useModel } from "@afx/model-reg";
import UserView from "@afx/views/dashboard/manage-access/users/main.layout";

export default useModel(UserView, () => [
  require("@afx/models/dashboard/manage-access/users.model").default,
]);
