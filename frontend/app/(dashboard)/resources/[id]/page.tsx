'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { FlashcardBrowse } from '@/components/web/flashcard-browse';
import { FlashcardStudy } from '@/components/web/flashcard-study';
import { Button } from '@/components/ui/button';
import { Globe, Lock, Hash, ArrowLeft, Paperclip, Download } from 'lucide-react';
import type { Resource } from '@/lib/use-resources';

type Card = { id: number; front: string; back: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default function ResourceDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuth();

    const [resource, setResource] = useState<Resource | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [studying, setStudying] = useState(false);

    const fetchResource = useCallback(() => {
        fetch(`${API_BASE}/resources/${id}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data) return;
                setResource(data.resource);
                setCards(data.cards ?? []);
            })
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => { fetchResource(); }, [fetchResource]);

    if (loading || !resource) {
        return <p className="text-sm text-muted-foreground">Loading resource...</p>;
    }

    const isOwner = resource.author.id === user?.id;

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 pb-8">
                {!studying && (
                    <>
                        <Link
                            href="/resources"
                            className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to resources
                        </Link>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                                    <Hash className="h-2.5 w-2.5" />
                                    {resource.code}
                                </span>
                                <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                                    {resource.is_public ? <Globe className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                                    {resource.is_public ? 'Public' : 'Private'}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold">{resource.title}</h1>
                            <p className="text-sm text-muted-foreground">{resource.description}</p>
                            {(resource.tags?.length ?? 0) > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {resource.tags?.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                    ))}
                                </div>
                            )}
                            <span className="text-xs text-muted-foreground">by {resource.author.username}</span>
                        </div>
                    </>
                )}

                {resource.type === 'note' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border border-border p-4">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{resource.content}</ReactMarkdown>
                    </div>
                ) : resource.type === 'media' || resource.type === 'document' ? (
                    <div className="flex flex-col gap-3 overflow-hidden rounded-xl border border-border">
                        {resource.file_type === 'image' && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={resource.file_url}
                                alt={resource.title}
                                className="max-h-[70vh] w-full bg-muted object-contain"
                            />
                        )}
                        {resource.file_type === 'video' && (
                            <video
                                src={resource.file_url}
                                controls
                                preload="metadata"
                                className="max-h-[70vh] w-full bg-black"
                            />
                        )}
                        <div className="flex flex-wrap items-center gap-3 p-4">
                            <Paperclip className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <span className="min-w-0 flex-1 truncate text-sm">
                                {resource.file_name || 'Attached file'}
                            </span>
                            <Button size="sm" variant="outline" asChild>
                                <a href={resource.file_url} download target="_blank" rel="noreferrer">
                                    <Download className="h-4 w-4" />
                                    Download
                                </a>
                            </Button>
                        </div>
                    </div>
                ) : studying ? (
                    <FlashcardStudy cards={cards} onExit={() => setStudying(false)} />
                ) : (
                    <FlashcardBrowse
                        resourceId={resource.id}
                        cards={cards}
                        isOwner={isOwner}
                        onCardsChanged={setCards}
                        onStudy={() => setStudying(true)}
                    />
                )}
            </div>
        </div>
    );
}
