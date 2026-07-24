// components/web/trending-topics-card.tsx
'use client';
import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import type { Post } from './postCard';

type TrendingTopicsCardProps = {
    posts: Post[];
};

export function TrendingTopicsCard({ posts }: TrendingTopicsCardProps) {
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

    return (
        <div className="flex min-h-[220px] flex-col gap-3 rounded-lg border border-border p-6">
            <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-semibold">Trending topics</h3>
            </div>
            {trendingTags.length === 0 && (
                <p className="text-xs text-muted-foreground">No trends yet.</p>
            )}
            {trendingTags.map(([tag, count], i) => (
                <div key={tag} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {i + 1}
                    </span>
                    <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                        <span className="text-xs font-medium truncate">{tag}</span>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${(count / maxTagCount) * 100}%` }}
                            />
                        </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{count}</span>
                </div>
            ))}
        </div>
    );
}
