// app/(dashboard)/resources/page.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useResources } from '@/lib/use-resources';
import { CreateResourceDialog } from '@/components/web/create-resource-dialog';
import { ResourceCard } from '@/components/web/resource-card';
import { Hash } from 'lucide-react';

const TYPES = [
    { key: 'all', label: 'All' },
    { key: 'note', label: 'Notes' },
    { key: 'flashcard', label: 'Flashcards' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default function ResourcesPage() {
    const [activeType, setActiveType] = useState('all');
    const [joinCode, setJoinCode] = useState('');
    const { resources, loading, refresh } = useResources(activeType);

    const joinByCode = async () => {
        if (!joinCode.trim()) return;
        const res = await fetch(`${API_BASE}/resources/code/${encodeURIComponent(joinCode.trim())}`);
        if (res.ok) {
            const resource = await res.json();
            window.location.href = `/resources/${resource.id}`;
        }
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold">Resources</h1>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Hash className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Join by code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && joinByCode()}
                                className="w-40 pl-8"
                            />
                        </div>
                        <CreateResourceDialog onCreated={refresh} />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {TYPES.map((t) => (
                        <Button
                            key={t.key}
                            size="sm"
                            variant={activeType === t.key ? 'default' : 'outline'}
                            className={cn('rounded-full', activeType === t.key && 'font-semibold')}
                            onClick={() => setActiveType(t.key)}
                        >
                            {t.label}
                        </Button>
                    ))}
                </div>

                {loading && <p className="text-sm text-muted-foreground">Loading resources...</p>}
                {!loading && resources.length === 0 && (
                    <p className="text-sm text-muted-foreground">No resources yet — create the first one.</p>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </div>
            </div>
        </div>
    );
}
