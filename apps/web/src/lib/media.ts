import type { MediaKind } from '@/lib/server/types';

const MB = 1024 * 1024;

export const MEDIA_LIMITS: Record<MediaKind, number> = {
  image: 10 * MB,
  video: 100 * MB,
};

export const MEDIA_TYPES: Record<MediaKind, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
};

export function mediaKindOf(file: File): MediaKind | null {
  if (MEDIA_TYPES.image.includes(file.type)) return 'image';
  if (MEDIA_TYPES.video.includes(file.type)) return 'video';
  return null;
}

export function readImageSize(file: File): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({});
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}
