// components/web/recently-active-card.tsx
'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getInitials } from '@/lib/utils';
import { Users } from 'lucide-react';
import type { Post } from './postCard';

type RecentlyActiveCardProps = {
    posts: Post[];
};

export function RecentlyActiveCard({ posts }: RecentlyActiveCardProps) {
    const recentAuthors = useMemo(() => {
        const seen = new Set<number>();
        const authors: Post['author'][] = [];
        for (const post of [...posts].sort(
            (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
        )) {
            if (!seen.has(post.author.id)) {
                seen.add(post.author.id);
                authors.push(post.author);
            }
            if (authors.length >= 6) break;
        }
        return authors;
    }, [posts]);

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-6 min-h-[220px]">
            <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Recently active</h3>
            </div>
            {recentAuthors.length === 0 && (
                <p className="text-xs text-muted-foreground">No activity yet.</p>
            )}
            <div className="flex flex-wrap gap-3">
                {recentAuthors.map((author) => (
                    <Link
                        key={author.id}
                        href={`/u/${author.id}`}
                        className="flex flex-col items-center gap-1 w-14 text-center"
                    >
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs">
                                {getInitials(author.username)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-muted-foreground truncate w-full">
                            {author.username}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
