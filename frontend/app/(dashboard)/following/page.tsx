// app/(dashboard)/following/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getInitials, cn } from '@/lib/utils';
import { FollowButton } from '@/components/web/follow-button';
import { useAuth } from '@/lib/auth-context';
import { useFollowing } from '@/lib/use-following';

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

/** The signed-in user's own card, with their follower/following counts. */
function MyProfileCard() {
    const { user } = useAuth();
    const [counts, setCounts] = useState<{
        follower_count: number;
        following_count: number;
    } | null>(null);

    useEffect(() => {
        if (!user) return;
        fetch(`${API_BASE}/users/${user.id}`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => data && setCounts(data));
    }, [user]);

    if (!user) return null;

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                        {getInitials(user.username)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                    <span className="text-xl font-semibold">{user.username}</span>
                    <div className="flex items-center gap-4 text-sm">
                        <span>
                            <span className="font-semibold">
                                {counts?.follower_count ?? 0}
                            </span>{' '}
                            <span className="text-muted-foreground">
                                {counts?.follower_count === 1 ? 'follower' : 'followers'}
                            </span>
                        </span>
                        <span>
                            <span className="font-semibold">
                                {counts?.following_count ?? 0}
                            </span>{' '}
                            <span className="text-muted-foreground">following</span>
                        </span>
                    </div>
                </div>
            </div>

            <Button variant="outline" size="sm" asChild>
                <Link href={`/u/${user.id}`}>View profile</Link>
            </Button>
        </div>
    );
}

/** Compact row of the people the user already follows. */
function FollowingRow() {
    const { following, loading } = useFollowing();

    if (loading || following.length === 0) return null;

    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
                People you follow{' '}
                <span className="text-sm font-normal text-muted-foreground">
                    ({following.length})
                </span>
            </h2>
            <div className="flex flex-wrap gap-4">
                {following.map((u) => (
                    <Link
                        key={u.id}
                        href={`/u/${u.id}`}
                        className="flex w-16 flex-col items-center gap-1.5 text-center"
                    >
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="text-sm">
                                {getInitials(u.username)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="w-full truncate text-[11px] text-muted-foreground">
                            {u.username}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function FollowingPage() {
    const [activeFilter, setActiveFilter] = useState('All');
    const query = activeFilter === 'All' ? '' : activeFilter;

    // keeping the query alongside its results makes "still loading" a render-time
    // comparison instead of a setState inside the effect
    const [fetched, setFetched] = useState<{
        query: string | null;
        users: SearchResult[];
    }>({ query: null, users: [] });

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetch(`${API_BASE}/users?q=${encodeURIComponent(query)}`, {
                credentials: 'include',
            })
                .then((res) => (res.ok ? res.json() : []))
                .then((users) => setFetched({ query, users }))
                .catch(() => setFetched({ query, users: [] }));
        }, 200);
        return () => clearTimeout(timeout);
    }, [query]);

    const loading = fetched.query !== query;
    const users = loading ? [] : fetched.users;

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                <MyProfileCard />

                <FollowingRow />

                <Separator />

                <div className="flex flex-col gap-4">
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
                                <Link
                                    href={`/u/${u.id}`}
                                    className="flex flex-col items-center gap-2"
                                >
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
        </div>
    );
}
