"use client";

import { useModel } from "@afx/model-reg";
import { FormServicePackagePage } from "@afx/views/dashboard/master/service-packages/layouts/form-page.layout";

const CreatePage = useModel(
  () => <FormServicePackagePage formType="create" />,
  () => [require("@afx/models/dashboard/master/service-packages.model").default]
);

export default CreatePage;
