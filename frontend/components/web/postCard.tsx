'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials, cn } from '@/lib/utils';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Eye } from 'lucide-react';

export interface Post {
    id: number;
    title: string;
    content: string;
    tags: string[];
    community: { id: number; name: string; description: string };
    author: { id: number; username: string; avatar?: string };
    created_at: string;
    media?: PostMedia[];
    score: number;
    view_count: number;
    comment_count: number;
    user_vote: number;
}

export type PostMedia = {
    id: string;
    url: string;
    type: 'image' | 'video';
    alt?: string;
};

type PostCardProps = {
    post: Post;
    bordered?: boolean;
};

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

function formatRelativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function PostCard({ post, bordered = true }: PostCardProps) {
    const [score, setScore] = useState(post.score);
    const [userVote, setUserVote] = useState(post.user_vote);
    const [voting, setVoting] = useState(false);

    const handleVote = async (value: 1 | -1) => {
        if (voting) return;
        setVoting(true);
        const prevScore = score;
        const prevVote = userVote;
        const delta = userVote === value ? -value : value - userVote;
        setScore(prevScore + delta);
        setUserVote(userVote === value ? 0 : value);

        try {
            const res = await fetch(`${API_BASE}/posts/${post.id}/vote`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value }),
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setScore(data.score);
            setUserVote(data.user_vote);
        } catch {
            setScore(prevScore);
            setUserVote(prevVote);
        } finally {
            setVoting(false);
        }
    };

    return (
        <div
            className={cn(
                'flex flex-col gap-2',
                bordered && 'rounded-lg border border-border p-4'
            )}
        >
            {/* Meta row */}
            <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                    {post.author.avatar && (
                        <AvatarImage
                            src={post.author.avatar}
                            alt={post.author.username}
                        />
                    )}
                    <AvatarFallback className="text-[9px]">
                        {getInitials(post.author.username)}
                    </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                    {post.author.username} ·{' '}
                    <Link
                        href={`/c/${post.community.name}`}
                        className="hover:underline"
                    >
                        {post.community.name}
                    </Link>{' '}
                    · {formatRelativeTime(post.created_at)}
                </span>
            </div>

            <Link href={`/post/${post.id}`}>
                <h3 className="text-sm font-semibold leading-snug hover:underline">
                    {post.title}
                </h3>
            </Link>

            <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-snug [&>*]:my-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content}
                </ReactMarkdown>
            </div>

            {post.media && post.media.length > 0 && (
                <div
                    className={`grid gap-2 ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
                >
                    {post.media.map((item) => (
                        <div
                            key={item.id}
                            className="relative aspect-video overflow-hidden rounded-md border border-border"
                        >
                            {item.type === 'image' ? (
                                <Image
                                    src={item.url}
                                    alt={item.alt ?? ''}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <video
                                    src={item.url}
                                    controls
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Footer — votes left, counters right */}
            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'h-6 w-6',
                            userVote === 1 && 'text-orange-500'
                        )}
                        onClick={() => handleVote(1)}
                        disabled={voting}
                    >
                        <ArrowBigUp className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[2ch] text-center text-xs font-medium">
                        {score}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'h-6 w-6',
                            userVote === -1 && 'text-blue-500'
                        )}
                        onClick={() => handleVote(-1)}
                        disabled={voting}
                    >
                        <ArrowBigDown className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {post.comment_count}
                    </span>
                    <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {post.view_count}
                    </span>
                </div>
            </div>
        </div>
    );
}
