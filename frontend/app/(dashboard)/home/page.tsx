// app/(dashboard)/home/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { CreatePost } from '@/components/web/create-post';
import { FilterBar } from '@/components/web/filter-bar';
import { PostCard, Post } from '@/components/web/postCard';
import { SidebarWidget } from '@/components/web/sidebar-widget';
import { FollowingBelt } from '@/components/web/following-belt';

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

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
                p.tags.some(
                    (tag) => tag.toLowerCase() === activeFilter.toLowerCase()
                )
            );

    return (
        <div className="mx-auto grid h-full w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,820px)_360px]">
            {/* Left column — scrolls independently */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-1">
                <FollowingBelt />

                <div className="flex items-center justify-between gap-4">
                    <FilterBar
                        active={activeFilter}
                        onSelect={setActiveFilter}
                    />
                    <CreatePost onPostCreated={handlePostCreated} />
                </div>

                {loading && (
                    <p className="text-sm text-muted-foreground">
                        Loading feed...
                    </p>
                )}
                {!loading && filteredPosts.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No posts yet — be the first.
                    </p>
                )}

                {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>

            {/* Right column — fixed, own height, no scroll */}
            <div className="hidden lg:block">
                <SidebarWidget posts={posts} />
            </div>
        </div>
    );
}
