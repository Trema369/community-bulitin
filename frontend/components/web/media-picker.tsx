// components/web/media-picker.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { ImagePlus, Loader2, X, AlertCircle } from 'lucide-react';
import {
    ACCEPTED_POST_MEDIA,
    uploadMedia,
    validatePostMedia,
} from '@/lib/uploads';

export const MAX_POST_MEDIA = 4;

/** What the backend stores against a post. */
export type PostMediaInput = {
    url: string;
    type: 'image' | 'video';
    alt?: string;
};

type Attachment = {
    key: string;
    previewUrl: string;
    type: 'image' | 'video';
    url?: string; // set once the upload lands
    error?: string;
};

type MediaPickerProps = {
    /** Fires with the attachments that finished uploading. */
    onChange: (media: PostMediaInput[]) => void;
    /** Fires while any upload is in flight, so the parent can hold off submitting. */
    onUploadingChange?: (uploading: boolean) => void;
    disabled?: boolean;
};

export function MediaPicker({
    onChange,
    onUploadingChange,
    disabled,
}: MediaPickerProps) {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [rejected, setRejected] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const uploading = attachments.some((a) => !a.url && !a.error);

    // Keep the parent in sync with whatever has successfully uploaded.
    useEffect(() => {
        onChange(
            attachments
                .filter((a): a is Attachment & { url: string } => Boolean(a.url))
                .map((a) => ({ url: a.url, type: a.type }))
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attachments]);

    useEffect(() => {
        onUploadingChange?.(uploading);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploading]);

    // Release object URLs when the picker goes away.
    useEffect(() => {
        return () => {
            attachments.forEach((a) => URL.revokeObjectURL(a.previewUrl));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFiles = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        setRejected([]);

        const room = MAX_POST_MEDIA - attachments.length;
        const incoming = Array.from(fileList);
        const problems: string[] = [];

        if (incoming.length > room) {
            problems.push(`You can attach up to ${MAX_POST_MEDIA} files.`);
        }

        const accepted: File[] = [];
        for (const file of incoming.slice(0, Math.max(room, 0))) {
            const problem = validatePostMedia(file);
            if (problem) problems.push(problem);
            else accepted.push(file);
        }

        setRejected(problems);

        const pending: Attachment[] = accepted.map((file) => ({
            key: `${file.name}-${file.lastModified}-${Math.random()}`,
            previewUrl: URL.createObjectURL(file),
            type: file.type.startsWith('video/') ? 'video' : 'image',
        }));

        setAttachments((prev) => [...prev, ...pending]);

        await Promise.all(
            accepted.map(async (file, i) => {
                const { key } = pending[i];
                try {
                    const uploaded = await uploadMedia(file);
                    setAttachments((prev) =>
                        prev.map((a) =>
                            a.key === key ? { ...a, url: uploaded.url } : a
                        )
                    );
                } catch (err) {
                    setAttachments((prev) =>
                        prev.map((a) =>
                            a.key === key
                                ? {
                                    ...a,
                                    error:
                                        err instanceof Error
                                            ? err.message
                                            : 'Upload failed',
                                }
                                : a
                        )
                    );
                }
            })
        );
    };

    const remove = (key: string) => {
        setAttachments((prev) => {
            const target = prev.find((a) => a.key === key);
            if (target) URL.revokeObjectURL(target.previewUrl);
            return prev.filter((a) => a.key !== key);
        });
    };

    const full = attachments.length >= MAX_POST_MEDIA;

    return (
        <div className="flex flex-col gap-2">
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_POST_MEDIA}
                multiple
                hidden
                onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = ''; // let the same file be picked again
                }}
            />

            {attachments.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                    {attachments.map((a) => (
                        <div
                            key={a.key}
                            className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
                        >
                            {a.type === 'image' ? (
                                // preview is a local blob URL, so plain <img> rather than next/image
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={a.previewUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <video
                                    src={a.previewUrl}
                                    className="h-full w-full object-cover"
                                    muted
                                />
                            )}

                            {!a.url && !a.error && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                                </div>
                            )}

                            {a.error && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-red-500/70"
                                    title={a.error}
                                >
                                    <AlertCircle className="h-4 w-4 text-white" />
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => remove(a.key)}
                                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                                aria-label="Remove attachment"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit gap-1.5"
                disabled={disabled || full}
                onClick={() => inputRef.current?.click()}
            >
                <ImagePlus className="h-4 w-4" />
                {full
                    ? `Limit of ${MAX_POST_MEDIA} reached`
                    : 'Add photos or videos'}
            </Button>

            {rejected.length > 0 && (
                <ul className="text-xs text-red-500">
                    {rejected.map((msg) => (
                        <li key={msg}>{msg}</li>
                    ))}
                </ul>
            )}

            {attachments.some((a) => a.error) && (
                <p className="text-xs text-red-500">
                    Some uploads failed — remove them or try again.
                </p>
            )}
        </div>
    );
}
