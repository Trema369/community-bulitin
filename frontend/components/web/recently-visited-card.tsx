// components/web/recently-visited-card.tsx
'use client';
import Link from 'next/link';
import { History } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { useRecentlyVisited } from '@/lib/use-recently-visited';

export function RecentlyVisitedCard() {
    const visited = useRecentlyVisited();

    return (
        <div className="flex min-h-[220px] flex-shrink-0 flex-col gap-3 rounded-xl border border-border p-6">
            <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Recently visited</h3>
            </div>

            {visited.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    Posts you open will show up here.
                </p>
            ) : (
                <div className="flex flex-col gap-2.5">
                    {visited.map((post) => (
                        <Link
                            key={post.id}
                            href={`/post/${post.id}`}
                            className="group flex flex-col gap-0.5"
                        >
                            <span className="line-clamp-2 text-xs font-medium leading-snug group-hover:underline">
                                {post.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                {post.community} ·{' '}
                                {formatRelativeTime(post.visited_at)}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
