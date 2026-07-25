// components/web/file-dropzone.tsx
'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, FileText, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractFileText } from '@/lib/uploads';

type ReadyFile = { name: string; chars: number };

type FileDropzoneProps = {
    /** Called with the combined text of every accepted file. */
    onExtracted: (text: string) => void;
};

/**
 * Drop a document, get its text. Extraction runs on drop — there's no second
 * button to press — and the text itself is never rendered: a document's worth of
 * characters on screen would swamp the form.
 */
export function FileDropzone({ onExtracted }: FileDropzoneProps) {
    const [ready, setReady] = useState<ReadyFile[]>([]);
    const [extracting, setExtracting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(
        async (accepted: File[]) => {
            if (accepted.length === 0) return;
            setError(null);
            setExtracting(true);
            try {
                const texts = await Promise.all(accepted.map(extractFileText));
                setReady(
                    accepted.map((f, i) => ({ name: f.name, chars: texts[i].length }))
                );
                onExtracted(texts.join('\n\n---\n\n'));
            } catch {
                setError('Could not read text from that file.');
                setReady([]);
                onExtracted('');
            } finally {
                setExtracting(false);
            }
        },
        [onExtracted]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
    });

    const clear = () => {
        setReady([]);
        setError(null);
        onExtracted('');
    };

    if (ready.length > 0) {
        return (
            <div className="flex flex-col gap-2">
                {ready.map((f) => (
                    <div
                        key={f.name}
                        className="flex items-center gap-2.5 rounded-lg border border-success/30 bg-success-soft px-3 py-2.5"
                    >
                        <FileText className="h-4 w-4 flex-shrink-0 text-success" />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                            {f.name}
                        </span>
                        <span className="flex flex-shrink-0 items-center gap-1 text-xs text-success">
                            <Check className="h-3.5 w-3.5" />
                            ready
                        </span>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={clear}
                    className="flex items-center gap-1 self-start text-xs text-muted-foreground hover:text-foreground"
                >
                    <X className="h-3 w-3" />
                    Use a different file
                </button>
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
                isDragActive
                    ? 'border-primary bg-brand-soft'
                    : 'border-border hover:border-primary/40 hover:bg-accent/40'
            )}
        >
            <input {...getInputProps()} />
            {extracting ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-sm font-medium">Reading your file...</p>
                </>
            ) : (
                <>
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">
                        {isDragActive ? 'Drop it here' : 'Drop a file, or click to browse'}
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, DOCX or TXT</p>
                </>
            )}
            {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
    );
}
