// app/(dashboard)/explore/page.tsx
'use client';
import { useState } from 'react';
import { useCommunities } from '@/lib/use-communities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

const FILTERS = ['All', 'Trending', 'Gaming', 'Music', 'Tech', 'Art'];

function CreateCommunityDialog({ onCreated }: { onCreated: () => void }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!name.trim()) {
            setError('Name is required.');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/communities`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description }),
            });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload?.message ?? 'Failed to create community');
            setName('');
            setDescription('');
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
                    Create community
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a community</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input placeholder="Community name" value={name} onChange={(e) => setName(e.target.value)} />
                    <Textarea
                        placeholder="What's this community about?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Creating...' : 'Create'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function FilterBelt({ active, onSelect }: { active: string; onSelect: (f: string) => void }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((filter) => (
                <Button
                    key={filter}
                    size="sm"
                    variant={active === filter ? 'default' : 'outline'}
                    className={cn('rounded-full', active === filter && 'font-semibold')}
                    onClick={() => onSelect(filter)}
                >
                    {filter}
                </Button>
            ))}
        </div>
    );
}

export default function ExplorePage() {
    const { communities, loading, refresh } = useCommunities();
    const [activeFilter, setActiveFilter] = useState('All');
    const [joiningId, setJoiningId] = useState<number | null>(null);

    const filtered =
        activeFilter === 'All'
            ? communities
            : communities.filter(
                (c) =>
                    c.name.toLowerCase().includes(activeFilter.toLowerCase()) ||
                    c.description.toLowerCase().includes(activeFilter.toLowerCase())
            );

    const toggleMembership = async (community: (typeof communities)[number]) => {
        setJoiningId(community.id);
        const endpoint = community.is_member ? 'leave' : 'join';
        try {
            await fetch(`${API_BASE}/communities/${community.id}/${endpoint}`, {
                method: 'POST',
                credentials: 'include',
            });
            refresh();
        } finally {
            setJoiningId(null);
        }
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold">Explore communities</h1>
                    <CreateCommunityDialog onCreated={refresh} />
                </div>

                <FilterBelt active={activeFilter} onSelect={setActiveFilter} />

                {loading && <p className="text-sm text-muted-foreground">Loading communities...</p>}

                {!loading && filtered.length === 0 && (
                    <p className="text-sm text-muted-foreground">No communities found.</p>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((community) => (
                        <div
                            key={community.id}
                            className="flex flex-col gap-2 rounded-lg border border-border p-4"
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className="font-semibold">{community.name}</span>
                                <span className="text-sm text-muted-foreground line-clamp-2">
                                    {community.description}
                                </span>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-2">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    {community.member_count} member{community.member_count !== 1 ? 's' : ''}
                                </span>
                                <Button
                                    variant={community.is_member ? 'outline' : 'default'}
                                    size="sm"
                                    onClick={() => toggleMembership(community)}
                                    disabled={joiningId === community.id}
                                >
                                    {community.is_member ? 'Joined' : 'Join'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
