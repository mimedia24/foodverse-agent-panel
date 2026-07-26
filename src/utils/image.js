import { image_uri, PLACEHOLDER_IMAGE } from "./constants";

export function normalizeImageUrl(value, fallback = PLACEHOLDER_IMAGE) {
  const source = String(value || "").trim();
  if (!source) return fallback;

  if (/^(https?:|data:|blob:)/i.test(source)) return source;

  const base = String(image_uri || "").replace(/\/+$/, "");
  const path = source.startsWith("/") ? source : `/${source}`;
  return `${base}${path}`;
}

export function useImageFallback(event, fallback = PLACEHOLDER_IMAGE) {
  const image = event?.currentTarget;
  if (!image || image.dataset.fallbackApplied === "true") return;
  image.dataset.fallbackApplied = "true";
  image.src = fallback;
}
