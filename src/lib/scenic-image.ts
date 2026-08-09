import { NATIONAL_SPOTS } from "@/lib/data/national-spots";

export const SCENIC_IMAGE_PLACEHOLDER = "/images/spots/10001.webp";

export function getLocalScenicImage(spotOrUrl?: any) {
  if (!spotOrUrl) return SCENIC_IMAGE_PLACEHOLDER;

  // String argument handling
  if (typeof spotOrUrl === "string") {
    if (
      spotOrUrl.startsWith("/images/spots/") ||
      spotOrUrl.startsWith("http://") ||
      spotOrUrl.startsWith("https://") ||
      spotOrUrl.startsWith("data:")
    ) {
      return spotOrUrl;
    }
  }

  // Object argument handling (Spot object)
  if (typeof spotOrUrl === "object") {
    const url = spotOrUrl.imageUrl || spotOrUrl.img || spotOrUrl.image;
    if (url && typeof url === "string" && (url.startsWith("/images/spots/") || url.startsWith("http://") || url.startsWith("https://"))) {
      return url;
    }
    // Match by ID or Name in NATIONAL_SPOTS
    const matched = NATIONAL_SPOTS.find((s) => s.id === spotOrUrl.id || s.name === spotOrUrl.name);
    if (matched?.imageUrl) return matched.imageUrl;
  }

  return SCENIC_IMAGE_PLACEHOLDER;
}
