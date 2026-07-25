// app/(dashboard)/c/[name]/page.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PostCard, Post } from '@/components/web/postCard';
import { CreatePost } from '@/components/web/create-post';
import { CommunityRulesCard } from '@/components/web/community-rules-card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Users, Info, CakeSlice, Shield, FileText, Home } from 'lucide-react';
import type { Community } from '@/lib/use-communities';

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

function formatJoinDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

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

    const postCount = posts.length;

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
                {/* Banner + header */}
                <div className="overflow-hidden rounded-lg border border-border">
                    <div className="h-20 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" />
                    <div className="flex flex-wrap items-end justify-between gap-4 px-6 pb-4">
                        <div className="flex items-end gap-4">
                            <div className="-mt-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-4 border-background bg-primary/15 text-2xl font-bold uppercase">
                                {community.name.slice(0, 1)}
                            </div>
                            <div className="flex flex-col gap-0.5 pb-0.5">
                                <h1 className="text-2xl font-bold">
                                    {community.name}
                                </h1>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    {community.member_count} member
                                    {community.member_count !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pb-0.5">
                            <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                                <Link href="/home">
                                    <Home className="h-4 w-4" />
                                    Home
                                </Link>
                            </Button>
                            <Button
                                variant={community.is_member ? 'outline' : 'default'}
                                onClick={toggleMembership}
                                disabled={joining}
                            >
                                {community.is_member ? 'Joined' : 'Join'}
                            </Button>
                            {/* posts made here are ordinary posts, so they also show up on home */}
                            <CreatePost
                                defaultCommunity={community.name}
                                onPostCreated={(post) =>
                                    setPosts((prev) => [post, ...prev])
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Two-column body — same grid as home */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,820px)_360px]">
                    <div className="flex flex-col gap-4">
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

                    {/* Side panel */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3 rounded-lg border border-border p-6">
                            <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-primary" />
                                <h3 className="text-sm font-semibold">
                                    About {community.name}
                                </h3>
                            </div>

                            <p className="text-xs leading-relaxed text-muted-foreground">
                                {community.description ||
                                    'No description yet.'}
                            </p>

                            <Separator />

                            <div className="flex gap-6">
                                <div className="flex flex-col">
                                    <span className="text-base font-semibold">
                                        {community.member_count}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                        Members
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-semibold">
                                        {postCount}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                        Posts
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <CakeSlice className="h-3.5 w-3.5" />
                                    Created {formatJoinDate(community.created_at)}
                                </span>
                                {community.creator?.username && (
                                    <span className="flex items-center gap-1.5">
                                        <Shield className="h-3.5 w-3.5" />
                                        Moderated by{' '}
                                        <Link
                                            href={`/u/${community.creator.id}`}
                                            className="text-foreground hover:underline"
                                        >
                                            {community.creator.username}
                                        </Link>
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5" />
                                    {community.rules?.length ?? 0} rule
                                    {(community.rules?.length ?? 0) !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        <CommunityRulesCard
                            community={community}
                            onUpdated={setCommunity}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
