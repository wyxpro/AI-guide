export const SCENIC_IMAGE_PLACEHOLDER = "/images/spots/placeholder.svg";

export function getLocalScenicImage(imageUrl?: string | null) {
  if (
    imageUrl?.startsWith("/images/spots/") &&
    !imageUrl.includes("..")
  ) {
    return imageUrl;
  }

  return SCENIC_IMAGE_PLACEHOLDER;
}
