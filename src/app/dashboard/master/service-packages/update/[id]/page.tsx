"use client";

import { useModel } from "@afx/model-reg";
import { FormServicePackagePage } from "@afx/views/dashboard/master/service-packages/layouts/form-page.layout";
import { useParams } from "next/navigation";

const UpdatePage = useModel(
  () => {
    const params = useParams();
    const id = params.id ? Number(params.id) : null;
    return <FormServicePackagePage formType="update" id={id} />;
  },
  () => [require("@afx/models/dashboard/master/service-packages.model").default]
);

export default UpdatePage;
