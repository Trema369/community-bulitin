// app/(dashboard)/home/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { CreatePost } from '@/components/web/create-post';
import { FilterBar } from '@/components/web/filter-bar';
import { PostCard, Post } from '@/components/web/postCard';
import { TopAlertsCard } from '@/components/web/top-alerts-card';
import { TrendingTopicsCard } from '@/components/web/trending-topics-card';
import { RecentlyActiveCard } from '@/components/web/recently-active-card';
import { FollowingBelt } from '@/components/web/following-belt';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default function HomePage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    const fetchFeed = () => {
        fetch(`${API_BASE}/posts`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : []))
            .then(setPosts)
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const handlePostCreated = (post: Post) => {
        setPosts((prev) => [post, ...prev]);
    };

    const filteredPosts =
        activeFilter === 'All'
            ? posts
            : posts.filter((p) =>
                p.tags.some((tag) => tag.toLowerCase() === activeFilter.toLowerCase())
            );

    return (
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-4">
            <FollowingBelt />

            {/* Header row uses the SAME grid template as the body, so the filter/create row
                only spans the post column's width, not the full page width */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,820px)_360px]">
                <div className="flex items-center justify-between gap-4">
                    <FilterBar active={activeFilter} onSelect={setActiveFilter} />
                    <CreatePost onPostCreated={handlePostCreated} />
                </div>
                <div className="hidden lg:block" /> {/* empty placeholder in the sidebar column */}
            </div>

            {/* Two-column body */}
            <div className="grid flex-1 grid-cols-1 gap-8 overflow-hidden lg:grid-cols-[minmax(0,820px)_360px]">
                <div className="flex flex-col gap-4 overflow-y-auto pr-1">
                    {loading && <p className="text-sm text-muted-foreground">Loading feed...</p>}
                    {!loading && filteredPosts.length === 0 && (
                        <p className="text-sm text-muted-foreground">No posts yet — be the first.</p>
                    )}
                    {filteredPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>

                <div className="hidden flex-col gap-4 overflow-y-auto lg:flex">
                    <TopAlertsCard />
                    <TrendingTopicsCard posts={posts} />
                    <RecentlyActiveCard posts={posts} />
                </div>
            </div>
        </div>
    );
}
