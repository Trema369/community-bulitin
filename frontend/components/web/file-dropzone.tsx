// components/web/file-dropzone.tsx
'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractFileText } from '@/lib/uploads';

type FileDropzoneProps = {
    onExtracted: (text: string) => void;
};

export function FileDropzone({ onExtracted }: FileDropzoneProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [extracting, setExtracting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((accepted: File[]) => {
        setFiles(accepted);
        setError(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
    });

    const handleExtract = async () => {
        if (files.length === 0) return;
        setExtracting(true);
        setError(null);
        try {
            const texts = await Promise.all(files.map(extractFileText));
            onExtracted(texts.join('\n\n---\n\n'));
            setFiles([]);
        } catch {
            setError('Failed to extract text from one or more files.');
        } finally {
            setExtracting(false);
        }
    };

    return (
        <div
            {...getRootProps()}
            className={cn(
                'flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
                isDragActive ? 'border-primary bg-primary/5' : 'border-border'
            )}
        >
            <input {...getInputProps()} />
            <Upload className="h-6 w-6 text-muted-foreground" />

            {files.length > 0 ? (
                <div className="flex flex-col items-center gap-1">
                    <p className="text-sm font-medium">{files.length} file(s) selected</p>
                    <ul className="text-xs text-muted-foreground">
                        {files.map((f) => <li key={f.name}>{f.name}</li>)}
                    </ul>
                </div>
            ) : isDragActive ? (
                <p className="text-sm font-medium text-primary">Drop the files here...</p>
            ) : (
                <div>
                    <p className="text-sm font-medium">Drag & drop files, or click to select</p>
                    <p className="text-xs text-muted-foreground">Supports PDF, TXT, DOCX</p>
                </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}

            <Button
                type="button"
                size="sm"
                onClick={(e) => {
                    e.stopPropagation();
                    handleExtract();
                }}
                disabled={extracting || files.length === 0}
                className="gap-1.5"
            >
                {extracting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {extracting ? 'Extracting...' : 'Extract text'}
            </Button>
        </div>
    );
}
