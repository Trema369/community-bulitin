'use client';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FileDropzone } from './file-dropzone';
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

type Card = { front: string; back: string };

type CreateResourceDialogProps = {
    onCreated: () => void;
};

export function CreateResourceDialog({ onCreated }: CreateResourceDialogProps) {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<'note' | 'flashcard'>('note');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const [topic, setTopic] = useState('');
    const [sourceText, setSourceText] = useState('');
    const [content, setContent] = useState('');
    const [cards, setCards] = useState<Card[]>([]);
    const [generating, setGenerating] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setTagsInput('');
        setTopic('');
        setSourceText('');
        setContent('');
        setCards([]);
        setError(null);
    };

    const handleGenerate = async () => {
        if (!topic.trim() && !sourceText.trim()) {
            setError('Enter a topic or upload files first.');
            return;
        }
        setError(null);
        setGenerating(true);
        try {
            if (type === 'note') {
                const res = await fetch(`${API_BASE}/ai/generate/note`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic, source_text: sourceText }),
                });
                if (!res.ok) throw new Error('Generation failed');
                const data = await res.json();
                setContent(data.content);
                if (!title.trim()) setTitle(topic || 'Untitled note');
            } else {
                const res = await fetch(`${API_BASE}/ai/generate/flashcards`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic, source_text: sourceText, count: 8 }),
                });
                if (!res.ok) throw new Error('Generation failed');
                const data = await res.json();
                setCards(data.cards);
                if (!title.trim()) setTitle(topic || 'Untitled set');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Generation failed');
        } finally {
            setGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError('Title is required.');
            return;
        }
        if (type === 'note' && !content.trim()) {
            setError('Generate or write content first.');
            return;
        }
        const validCards = cards.filter((c) => c.front.trim() && c.back.trim());
        if (type === 'flashcard' && validCards.length === 0) {
            setError('Generate some cards first.');
            return;
        }

        const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

        setSubmitting(true);
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
                    tags,
                    is_public: isPublic,
                    cards: type === 'flashcard' ? validCards : [],
                }),
            });
            if (!res.ok) throw new Error((await res.json()).message ?? 'Failed to create');

            resetForm();
            setOpen(false);
            onCreated();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create resource
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create a resource</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                    {(['note', 'flashcard'] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => {
                                setType(t);
                                setContent('');
                                setCards([]);
                            }}
                            className={cn(
                                'flex-1 rounded-md py-1.5 text-xs font-medium capitalize transition-all',
                                type === t
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {t === 'note' ? 'Note' : 'Flashcard set'}
                        </button>
                    ))}
                </div>

                {/* Generation source: topic or uploaded files */}
                <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                        Generate with AI
                    </div>

                    <Tabs defaultValue="topic">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="topic">Topic</TabsTrigger>
                            <TabsTrigger value="upload">Upload files</TabsTrigger>
                        </TabsList>

                        <TabsContent value="topic" className="mt-2">
                            <Input
                                placeholder={type === 'note' ? 'e.g. "Photosynthesis"' : 'e.g. "French Revolution"'}
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </TabsContent>

                        <TabsContent value="upload" className="mt-2">
                            <FileDropzone onExtracted={setSourceText} />
                            {sourceText && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {sourceText.length.toLocaleString()} characters extracted — ready to generate.
                                </p>
                            )}
                        </TabsContent>
                    </Tabs>

                    <Button type="button" onClick={handleGenerate} disabled={generating} className="gap-1.5">
                        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {generating ? 'Generating...' : 'Generate'}
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Textarea
                        placeholder="Short description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                    />
                    <Input
                        placeholder="Tags (comma separated)"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                    />

                    {type === 'note' ? (
                        <Textarea
                            placeholder="Generated content will appear here — feel free to edit"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={10}
                        />
                    ) : (
                        <div className="flex flex-col gap-2">
                            {cards.length === 0 && (
                                <p className="text-xs text-muted-foreground">No cards yet — generate some above.</p>
                            )}
                            {cards.map((card, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input
                                        placeholder="Front"
                                        value={card.front}
                                        onChange={(e) =>
                                            setCards((prev) => prev.map((c, idx) => (idx === i ? { ...c, front: e.target.value } : c)))
                                        }
                                    />
                                    <Input
                                        placeholder="Back"
                                        value={card.back}
                                        onChange={(e) =>
                                            setCards((prev) => prev.map((c, idx) => (idx === i ? { ...c, back: e.target.value } : c)))
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setCards((prev) => prev.filter((_, idx) => idx !== i))}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {cards.length > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={() => setCards((prev) => [...prev, { front: '', back: '' }])}
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add card manually
                                </Button>
                            )}
                        </div>
                    )}

                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                        Make this public
                    </label>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Creating...' : 'Create'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
