// lib/uploads.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export type UploadedMedia = { url: string; type: 'image' | 'video' | 'document' | 'file' };

/** Mirrors the ceilings enforced in backend/uploads/uploads.go. */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export const ACCEPTED_POST_MEDIA =
    'image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm,video/quicktime';

/** Catches oversized files before the upload round-trip. Returns an error message, or null when fine. */
export function validatePostMedia(file: File): string | null {
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) return `${file.name}: only images and videos can be attached`;

    const limit = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > limit) {
        return `${file.name} is too large (max ${limit / 1024 / 1024}MB)`;
    }
    return null;
}

export async function uploadMedia(file: File): Promise<UploadedMedia> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/uploads/media`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });
    if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message ?? 'Upload failed');
    }
    return res.json();
}

export async function extractFileText(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/uploads/extract-text`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });
    if (!res.ok) throw new Error('Text extraction failed');
    const data = await res.json();
    return data.text;
}
