// app/(dashboard)/resources/new/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileDropzone } from '@/components/web/file-dropzone';
import { uploadMedia, type UploadedMedia } from '@/lib/uploads';
import {
    ArrowLeft,
    Sparkles,
    Loader2,
    FileText,
    Layers,
    Type,
    Upload,
    Trash2,
    Plus,
    Check,
    Paperclip,
    ImageIcon,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

type Card = { front: string; back: string };
type ResourceType = 'note' | 'flashcard' | 'document' | 'media';
type Source = 'topic' | 'upload';

/** A labelled section so the page reads as a sequence of decisions. */
function Step({
    n,
    title,
    hint,
    children,
}: {
    n: number;
    title: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-baseline gap-2.5">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-primary">
                    {n}
                </span>
                <h2 className="text-base font-semibold">{title}</h2>
                {hint && (
                    <span className="text-xs text-muted-foreground">{hint}</span>
                )}
            </div>
            <div className="pl-8.5">{children}</div>
        </section>
    );
}

export default function NewResourcePage() {
    const router = useRouter();

    const [type, setType] = useState<ResourceType>('note');
    const [source, setSource] = useState<Source>('topic');
    const [topic, setTopic] = useState('');
    const [sourceText, setSourceText] = useState('');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const [content, setContent] = useState('');
    const [cards, setCards] = useState<Card[]>([]);

    // for document / media resources
    const [file, setFile] = useState<UploadedMedia | null>(null);
    const [fileName, setFileName] = useState('');
    const [uploadingFile, setUploadingFile] = useState(false);

    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isUpload = type === 'document' || type === 'media';
    const hasDraft = type === 'note' ? content.trim() !== '' : cards.length > 0;
    const canGenerate = topic.trim() !== '' || sourceText.trim() !== '';

    const attach = async (picked?: File) => {
        if (!picked) return;
        setError(null);
        setUploadingFile(true);
        try {
            const uploaded = await uploadMedia(picked);
            setFile(uploaded);
            setFileName(picked.name);
            if (!title.trim()) setTitle(picked.name.replace(/\.[^.]+$/, ''));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploadingFile(false);
        }
    };

    const generate = async () => {
        if (!canGenerate) {
            setError('Give it a topic or a file to work from.');
            return;
        }
        setError(null);
        setGenerating(true);
        try {
            const endpoint =
                type === 'note' ? '/ai/generate/note' : '/ai/generate/flashcards';
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    source_text: sourceText,
                    ...(type === 'flashcard' ? { count: 8 } : {}),
                }),
            });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload?.message ?? 'Generation failed');

            if (type === 'note') setContent(payload.content);
            else setCards(payload.cards ?? []);

            if (!title.trim()) {
                setTitle(topic || (type === 'note' ? 'Untitled note' : 'Untitled set'));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Generation failed');
        } finally {
            setGenerating(false);
        }
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) return setError('Give it a title.');
        const validCards = cards.filter((c) => c.front.trim() && c.back.trim());
        if (type === 'note' && !content.trim())
            return setError('Generate or write some content first.');
        if (type === 'flashcard' && validCards.length === 0)
            return setError('Add at least one card.');
        if (isUpload && !file) return setError('Attach a file first.');

        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/resources`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    title,
                    description,
                    content: type === 'note' ? content : '',
                    tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
                    is_public: isPublic,
                    cards: type === 'flashcard' ? validCards : [],
                    file_url: file?.url ?? '',
                    file_name: fileName,
                    file_type: file?.type ?? '',
                }),
            });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload?.message ?? 'Failed to create');
            router.push(`/resources/${payload.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setSaving(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto">
            <form
                onSubmit={save}
                className="mx-auto flex w-full max-w-2xl flex-col gap-8 pb-16"
            >
                <div className="flex flex-col gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-fit gap-1.5 -ml-2"
                        asChild
                    >
                        <Link href="/resources">
                            <ArrowLeft className="h-4 w-4" />
                            Resources
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">Create a resource</h1>
                    <p className="text-sm text-muted-foreground">
                        Generate study material, or share a document, photo or video.
                    </p>
                </div>

                <Step n={1} title="What are you sharing?">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {(
                            [
                                { key: 'note', label: 'Study note', desc: 'Structured markdown', icon: FileText },
                                { key: 'flashcard', label: 'Flashcard set', desc: 'Question and answer pairs', icon: Layers },
                                { key: 'document', label: 'Document', desc: 'PDF, Word or text', icon: Paperclip },
                                { key: 'media', label: 'Photo or video', desc: 'Images and clips', icon: ImageIcon },
                            ] as const
                        ).map(({ key, label, desc, icon: Icon }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => {
                                    setType(key);
                                    setContent('');
                                    setCards([]);
                                    setFile(null);
                                    setFileName('');
                                }}
                                className={cn(
                                    'flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-colors',
                                    type === key
                                        ? 'border-primary bg-brand-soft'
                                        : 'border-border hover:border-primary/40 hover:bg-accent/40'
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'h-5 w-5',
                                        type === key ? 'text-primary' : 'text-muted-foreground'
                                    )}
                                />
                                <span className="text-sm font-semibold">{label}</span>
                                <span className="text-xs text-muted-foreground">{desc}</span>
                            </button>
                        ))}
                    </div>
                </Step>

                {isUpload ? (
                    <Step
                        n={2}
                        title={type === 'media' ? 'Pick a photo or video' : 'Pick a document'}
                    >
                        {file ? (
                            <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success-soft px-4 py-3">
                                <Check className="h-4 w-4 flex-shrink-0 text-success" />
                                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                    {fileName}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFile(null);
                                        setFileName('');
                                    }}
                                    aria-label="Remove file"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <label
                                className={cn(
                                    'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-accent/40'
                                )}
                            >
                                <input
                                    type="file"
                                    hidden
                                    accept={
                                        type === 'media'
                                            ? 'image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm,video/quicktime'
                                            : '.pdf,.docx,.txt'
                                    }
                                    onChange={(e) => {
                                        attach(e.target.files?.[0]);
                                        e.target.value = '';
                                    }}
                                />
                                {uploadingFile ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                        <p className="text-sm font-medium">Uploading...</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-5 w-5 text-muted-foreground" />
                                        <p className="text-sm font-medium">
                                            Click to choose a file
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {type === 'media'
                                                ? 'PNG, JPG, GIF, WEBP, MP4 or WEBM'
                                                : 'PDF, DOCX or TXT'}
                                        </p>
                                    </>
                                )}
                            </label>
                        )}
                    </Step>
                ) : (
                <Step n={2} title="What should it cover?" hint="optional — you can write it yourself">
                    <div className="flex flex-col gap-3">
                        <div className="flex w-fit items-center gap-1 rounded-lg bg-muted p-1">
                            {(
                                [
                                    { key: 'topic', label: 'Describe a topic', icon: Type },
                                    { key: 'upload', label: 'Upload a file', icon: Upload },
                                ] as const
                            ).map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSource(key)}
                                    className={cn(
                                        'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                                        source === key
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {source === 'topic' ? (
                            <Input
                                placeholder={
                                    type === 'note'
                                        ? 'e.g. Photosynthesis for GCSE biology'
                                        : 'e.g. Key dates of the French Revolution'
                                }
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        ) : (
                            <FileDropzone onExtracted={setSourceText} />
                        )}

                        <Button
                            type="button"
                            onClick={generate}
                            disabled={generating || !canGenerate}
                            className="w-fit gap-2"
                        >
                            {generating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="h-4 w-4" />
                            )}
                            {generating
                                ? 'Generating...'
                                : hasDraft
                                    ? 'Regenerate'
                                    : 'Generate with AI'}
                        </Button>
                    </div>
                </Step>
                )}

                {!isUpload && (
                <Step n={3} title="Review and edit">
                    {type === 'note' ? (
                        <Textarea
                            placeholder="Your note goes here — generate one above, or just start writing."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            // capped height: generated notes can run long, and an
                            // auto-growing field pushed the save button off-screen
                            className="max-h-96 min-h-48 overflow-y-auto font-mono text-xs leading-relaxed"
                        />
                    ) : (
                        <div className="flex flex-col gap-2">
                            {cards.length === 0 && (
                                <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                                    No cards yet — generate some above or add one below.
                                </p>
                            )}

                            <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
                                {cards.map((card, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="w-5 flex-shrink-0 text-xs text-muted-foreground">
                                            {i + 1}
                                        </span>
                                        <Input
                                            placeholder="Front"
                                            value={card.front}
                                            onChange={(e) =>
                                                setCards((prev) =>
                                                    prev.map((c, idx) =>
                                                        idx === i ? { ...c, front: e.target.value } : c
                                                    )
                                                )
                                            }
                                        />
                                        <Input
                                            placeholder="Back"
                                            value={card.back}
                                            onChange={(e) =>
                                                setCards((prev) =>
                                                    prev.map((c, idx) =>
                                                        idx === i ? { ...c, back: e.target.value } : c
                                                    )
                                                )
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="flex-shrink-0"
                                            onClick={() =>
                                                setCards((prev) => prev.filter((_, idx) => idx !== i))
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-fit gap-1.5"
                                onClick={() =>
                                    setCards((prev) => [...prev, { front: '', back: '' }])
                                }
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add a card
                            </Button>
                        </div>
                    )}
                </Step>
                )}

                <Separator />

                <Step n={4} title="Name it">
                    <div className="flex flex-col gap-3">
                        <Input
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <Input
                            placeholder="Short description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <Input
                            placeholder="Tags, comma separated (optional)"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                        />

                        <button
                            type="button"
                            onClick={() => setIsPublic((p) => !p)}
                            className="flex w-fit items-center gap-2 text-sm"
                        >
                            <span
                                className={cn(
                                    'flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors',
                                    isPublic
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border'
                                )}
                            >
                                {isPublic && <Check className="h-3.5 w-3.5" />}
                            </span>
                            Share with the community
                        </button>
                    </div>
                </Step>

                {error && <p className="text-sm text-danger">{error}</p>}

                <div className="flex items-center gap-3">
                    <Button type="submit" size="lg" disabled={saving}>
                        {saving ? 'Saving...' : 'Save resource'}
                    </Button>
                    <Button type="button" variant="ghost" asChild>
                        <Link href="/resources">Cancel</Link>
                    </Button>
                </div>
            </form>
        </div>
    );
}
