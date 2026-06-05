"use client";

import { useModel } from "@afx/model-reg";
import PromoBannerView from "./main.layout";

export default useModel(PromoBannerView, () => [
  require("@afx/models/dashboard/master/promo-banners.model").default,
]);
