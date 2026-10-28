export async function compressImage(file, { maxDimension = 2048, quality = 0.82, maxBytes = 5 * 1024 * 1024 } = {}) {
  if (!file || !file.type.startsWith("image/")) throw new Error("Please choose a valid image.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  let blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("Image compression failed.");
  if (blob.size > maxBytes) blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.68));
  if (!blob || blob.size > maxBytes) throw new Error("Image is still too large after compression.");
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}
