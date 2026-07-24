// app/(dashboard)/following/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials, cn } from '@/lib/utils';
import { FollowButton } from '@/components/web/follow-button';

type SearchResult = { id: number; username: string; email: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

const FILTERS = ['All', 'Trending', 'Gaming', 'Music', 'Tech', 'Art'];

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

export default function FollowingPage() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [users, setUsers] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const q = activeFilter === 'All' ? '' : activeFilter;
        const timeout = setTimeout(() => {
            fetch(`${API_BASE}/users?q=${encodeURIComponent(q)}`, {
                credentials: 'include',
            })
                .then((res) => (res.ok ? res.json() : []))
                .then(setUsers)
                .finally(() => setLoading(false));
        }, 200);
        return () => clearTimeout(timeout);
    }, [activeFilter]);

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
                <h1 className="text-3xl font-bold">Find people</h1>

                <FilterBelt active={activeFilter} onSelect={setActiveFilter} />

                {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
                {!loading && users.length === 0 && (
                    <p className="text-sm text-muted-foreground">No users found.</p>
                )}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {users.map((u) => (
                        <div
                            key={u.id}
                            className="flex flex-col items-center gap-3 rounded-lg border border-border p-4"
                        >
                            <Link href={`/u/${u.id}`} className="flex flex-col items-center gap-2">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="text-lg">
                                        {getInitials(u.username)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="max-w-full truncate text-sm font-medium">
                                    {u.username}
                                </span>
                            </Link>

                            <FollowButton userId={u.id} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
