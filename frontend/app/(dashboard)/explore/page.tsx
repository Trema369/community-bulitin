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
import { Plus, Search, Users } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

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

export default function ExplorePage() {
    const { communities, loading, refresh } = useCommunities();
    const [search, setSearch] = useState('');
    const [joiningId, setJoiningId] = useState<number | null>(null);

    const filtered = communities.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.description.toLowerCase().includes(search.toLowerCase())
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
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-xl font-bold">Explore communities</h1>
                <CreateCommunityDialog onCreated={refresh} />
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search communities..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {loading && <p className="text-sm text-muted-foreground">Loading communities...</p>}

            {!loading && filtered.length === 0 && (
                <p className="text-sm text-muted-foreground">No communities found.</p>
            )}

            <div className="flex flex-col gap-2">
                {filtered.map((community) => (
                    <div
                        key={community.id}
                        className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
                    >
                        <div className="flex flex-col gap-0.5">
                            <span className="font-semibold">{community.name}</span>
                            <span className="text-sm text-muted-foreground">{community.description}</span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {community.member_count} member{community.member_count !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <Button
                            variant={community.is_member ? 'outline' : 'default'}
                            size="sm"
                            onClick={() => toggleMembership(community)}
                            disabled={joiningId === community.id}
                        >
                            {community.is_member ? 'Joined' : 'Join'}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
