// components/web/sidebar-widget.tsx
'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getInitials, cn } from '@/lib/utils';
import { AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { useAlerts } from '@/lib/use-alerts';
import type { Post } from './postCard';

const PRIORITY_DOT: Record<string, string> = {
    low: 'bg-muted-foreground',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
};

type SidebarWidgetProps = {
    posts: Post[];
};

export function SidebarWidget({ posts }: SidebarWidgetProps) {
    const { alerts } = useAlerts();

    const topAlerts = useMemo(
        () => [...alerts].sort((a, b) => b.score - a.score).slice(0, 5),
        [alerts]
    );

    const trendingTags = useMemo(() => {
        const counts = new Map<string, number>();
        for (const post of posts) {
            for (const tag of post.tags) {
                counts.set(tag, (counts.get(tag) ?? 0) + 1);
            }
        }
        return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [posts]);

    const maxTagCount = trendingTags[0]?.[1] ?? 1;

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
        <div className="flex h-full flex-col rounded-lg border border-border">
            {/* Top alerts */}
            <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <h3 className="text-sm font-semibold">Top alerts</h3>
                </div>
                {topAlerts.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                        No active alerts.
                    </p>
                )}
                {topAlerts.map((alert) => (
                    <Link
                        key={alert.id}
                        href="/alerts"
                        className="flex items-start gap-2 rounded-md p-1.5 hover:bg-muted/50 transition-colors"
                    >
                        <span
                            className={cn(
                                'mt-1 h-2 w-2 flex-shrink-0 rounded-full',
                                PRIORITY_DOT[alert.priority]
                            )}
                        />
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium truncate">
                                {alert.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                {alert.community.name} · {alert.score} votes
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            <Separator />

            {/* Trending topics */}
            <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <h3 className="text-sm font-semibold">Trending topics</h3>
                </div>
                {trendingTags.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                        No trends yet.
                    </p>
                )}
                {trendingTags.map(([tag, count], i) => (
                    <div key={tag} className="flex items-center gap-2">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            {i + 1}
                        </span>
                        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                            <span className="text-xs font-medium truncate">
                                {tag}
                            </span>
                            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{
                                        width: `${(count / maxTagCount) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                            {count}
                        </span>
                    </div>
                ))}
            </div>

            <Separator />

            {/* Recently active */}
            <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Recently active</h3>
                </div>
                {recentAuthors.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                        No activity yet.
                    </p>
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
        </div>
    );
}
