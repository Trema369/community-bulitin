'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { FollowButton } from '@/components/web/follow-button';
import { Search } from 'lucide-react';

type SearchResult = { id: number; username: string; email: string };

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default function FollowingPage() {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetch(`${API_BASE}/users?q=${encodeURIComponent(query)}`, {
                credentials: 'include',
            })
                .then((res) => (res.ok ? res.json() : []))
                .then(setUsers)
                .finally(() => setLoading(false));
        }, 250); // debounce typing

        return () => clearTimeout(timeout);
    }, [query]);

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
                <h1 className="text-xl font-bold">Find people</h1>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {loading && (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                )}
                {!loading && users.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No users found.
                    </p>
                )}

                <div className="flex flex-col gap-2">
                    {users.map((u) => (
                        <div
                            key={u.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                        >
                            <Link
                                href={`/u/${u.id}`}
                                className="flex items-center gap-3 min-w-0"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                        {getInitials(u.username)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium truncate">
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
