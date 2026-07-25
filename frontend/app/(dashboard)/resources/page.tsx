// app/(dashboard)/resources/page.tsx
'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResources, type Resource, type ResourceType } from '@/lib/use-resources';
import { ResourceCard } from '@/components/web/resource-card';
import {
    Hash,
    Plus,
    FileText,
    FlipHorizontal,
    Paperclip,
    ImageIcon,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/** Each kind of resource gets its own shelf. */
const SECTIONS: {
    type: ResourceType;
    title: string;
    blurb: string;
    icon: typeof FileText;
}[] = [
        { type: 'note', title: 'Notes', blurb: 'Written and AI-generated study notes', icon: FileText },
        { type: 'flashcard', title: 'Flashcards', blurb: 'Question and answer decks', icon: FlipHorizontal },
        { type: 'document', title: 'Documents', blurb: 'PDFs, Word files and text', icon: Paperclip },
        { type: 'media', title: 'Photos & videos', blurb: 'Shared images and clips', icon: ImageIcon },
    ];

function Section({
    title,
    blurb,
    icon: Icon,
    items,
}: {
    title: string;
    blurb: string;
    icon: typeof FileText;
    items: Resource[];
}) {
    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
                <Icon className="h-5 w-5 flex-shrink-0 text-primary" />
                <div className="flex flex-col leading-tight">
                    <h2 className="text-lg font-semibold">
                        {title}{' '}
                        <span className="text-sm font-normal text-muted-foreground">
                            {items.length}
                        </span>
                    </h2>
                    <span className="text-xs text-muted-foreground">{blurb}</span>
                </div>
            </div>

            {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                    Nothing here yet.
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </div>
            )}
        </section>
    );
}

export default function ResourcesPage() {
    const [joinCode, setJoinCode] = useState('');
    const { resources, loading } = useResources('all');

    const grouped = useMemo(() => {
        const map = new Map<ResourceType, Resource[]>();
        for (const s of SECTIONS) map.set(s.type, []);
        for (const r of resources) map.get(r.type)?.push(r);
        return map;
    }, [resources]);

    const joinByCode = async () => {
        if (!joinCode.trim()) return;
        const res = await fetch(
            `${API_BASE}/resources/code/${encodeURIComponent(joinCode.trim())}`
        );
        if (res.ok) {
            const resource = await res.json();
            window.location.href = `/resources/${resource.id}`;
        }
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-12">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold">Resources</h1>
                        <p className="text-sm text-muted-foreground">
                            Notes, flashcards, documents and media the community shares.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Hash className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Join by code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && joinByCode()}
                                className="w-32 sm:w-40 pl-8"
                            />
                        </div>
                        <Button className="gap-2" asChild>
                            <Link href="/resources/new">
                                <Plus className="h-4 w-4" />
                                Add resource
                            </Link>
                        </Button>
                    </div>
                </div>

                {loading && (
                    <p className="text-sm text-muted-foreground">Loading resources...</p>
                )}

                {!loading &&
                    SECTIONS.map((section) => (
                        <Section
                            key={section.type}
                            title={section.title}
                            blurb={section.blurb}
                            icon={section.icon}
                            items={grouped.get(section.type) ?? []}
                        />
                    ))}
            </div>
        </div>
    );
}
