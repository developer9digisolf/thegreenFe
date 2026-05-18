import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function UploadImageService(file: File) {
  const formData = new FormData();
  formData.append("file", file, file.name);

  return request<any>({
    url: rest.imageUpload,
    data: formData,
    method: "POST",
    bodyType: "formData",
  });
}

export function UploadMultipleImageService(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file, file.name);
  });

  return request<any>({
    url: rest.imageUploadMultiple,
    data: formData,
    method: "POST",
    bodyType: "formData",
  });
}
