// app/(dashboard)/c/[name]/page.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { PostCard, Post } from '@/components/web/postCard';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import type { Community } from '@/lib/use-communities';

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default function CommunityPage() {
    const params = useParams();
    const name = params.name as string;

    const [community, setCommunity] = useState<Community | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    const fetchCommunity = useCallback(() => {
        fetch(`${API_BASE}/communities/${name}`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then(setCommunity);
    }, [name]);

    const fetchPosts = useCallback(() => {
        fetch(`${API_BASE}/posts?community=${name}`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : []))
            .then(setPosts)
            .finally(() => setLoading(false));
    }, [name]);

    useEffect(() => {
        fetchCommunity();
        fetchPosts();
    }, [fetchCommunity, fetchPosts]);

    const toggleMembership = async () => {
        if (!community) return;
        setJoining(true);
        const endpoint = community.is_member ? 'leave' : 'join';
        try {
            await fetch(`${API_BASE}/communities/${community.id}/${endpoint}`, {
                method: 'POST',
                credentials: 'include',
            });
            fetchCommunity();
        } finally {
            setJoining(false);
        }
    };

    if (!community) {
        return (
            <p className="text-sm text-muted-foreground">
                Loading community...
            </p>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
                {/* Community header */}
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl font-bold">{community.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {community.description}
                        </p>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {community.member_count} member
                            {community.member_count !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <Button
                        variant={community.is_member ? 'outline' : 'default'}
                        onClick={toggleMembership}
                        disabled={joining}
                    >
                        {community.is_member ? 'Joined' : 'Join'}
                    </Button>
                </div>

                {/* Posts in this community */}
                {loading && (
                    <p className="text-sm text-muted-foreground">
                        Loading posts...
                    </p>
                )}
                {!loading && posts.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No posts in this community yet.
                    </p>
                )}
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}
