// components/web/trending-topics-card.tsx
'use client';
import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import type { Post } from './postCard';

type TrendingTopicsCardProps = {
    posts: Post[];
};

export function TrendingTopicsCard({ posts }: TrendingTopicsCardProps) {
    // ranked by the votes a tag's posts have earned, not how often it was used —
    // one well-received post should outrank five ignored ones
    const trendingTags = useMemo(() => {
        const stats = new Map<string, { score: number; posts: number }>();
        for (const post of posts) {
            for (const tag of post.tags ?? []) {
                const entry = stats.get(tag) ?? { score: 0, posts: 0 };
                entry.score += post.score;
                entry.posts += 1;
                stats.set(tag, entry);
            }
        }
        return [...stats.entries()]
            .filter(([, s]) => s.score > 0)
            .sort((a, b) => b[1].score - a[1].score || b[1].posts - a[1].posts)
            .slice(0, 5);
    }, [posts]);

    const topScore = trendingTags[0]?.[1].score ?? 1;

    return (
        <div className="flex min-h-[220px] flex-shrink-0 flex-col gap-3 rounded-xl border border-border p-6">
            <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-semibold">Trending topics</h3>
            </div>
            {trendingTags.length === 0 && (
                <p className="text-xs text-muted-foreground">
                    Nothing trending yet — vote on posts to shape this.
                </p>
            )}
            {trendingTags.map(([tag, stat], i) => (
                <div key={tag} className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-primary">
                        {i + 1}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="truncate text-sm font-medium">{tag}</span>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${(stat.score / topScore) * 100}%` }}
                            />
                        </div>
                    </div>
                    <span className="flex-shrink-0 text-xs font-medium text-muted-foreground">
                        {stat.score}
                        <span className="ml-0.5 text-[10px]">▲</span>
                    </span>
                </div>
            ))}
        </div>
    );
}
