export const BUCKETS = {
  audio: "podcast-audio",
  documents: "podcast-documents",
  covers: "podcast-covers",
} as const;

export function storagePath(
  userId: string,
  podcastId: string,
  type: "audio" | "source" | "cover",
  fileName: string,
) {
  return `users/${userId}/podcasts/${podcastId}/${type}/${fileName}`;
}
