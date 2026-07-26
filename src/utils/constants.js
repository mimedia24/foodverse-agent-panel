const apiBase =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_PATH ||
  "https://api.foodversedelivery.com/api/v3";

export const image_uri =
  import.meta.env.VITE_IMAGE_API ||
  String(apiBase).replace(/\/api(?:\/v\d+)?\/?$/i, "");

export const PLACEHOLDER_IMAGE = "/vite.svg";
