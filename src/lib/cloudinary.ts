import { v4 as uuidv4 } from "uuid";

export async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "video",
  progressCallback?: (progress: number) => void
): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "video_unsigned");
  formData.append("resource_type", resourceType);

  // Add unique identifier to avoid caching issues
  formData.append("public_id", `${resourceType}_${uuidv4()}`);

  try {
    // Use XMLHttpRequest to track upload progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/dggu1xqaf/${resourceType}/upload`
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && progressCallback) {
          const progress = Math.round((event.loaded / event.total) * 100);
          progressCallback(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Upload failed"));
      };

      xhr.send(formData);
    });
  } catch (error) {
    console.error(`Cloudinary ${resourceType} upload error:`, error);
    return null;
  }
}
