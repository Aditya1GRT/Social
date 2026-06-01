import { publicRequest } from "../requestMethods";

// Uploads a file to the backend and resolves to its public URL.
// Replaces the previous Firebase Storage upload flow.
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await publicRequest.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  return res.data.url;
};
