// lib/uploads.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export type UploadedMedia = { url: string; type: 'image' | 'video' | 'document' | 'file' };

export async function uploadMedia(file: File): Promise<UploadedMedia> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/uploads/media`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
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
