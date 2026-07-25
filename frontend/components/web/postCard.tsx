'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useRouter } from 'next/navigation';
import {
    getInitials,
    cn,
    shouldIgnoreCardClick,
    formatRelativeTime,
} from '@/lib/utils';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Eye } from 'lucide-react';

export interface Post {
    id: number;
    title: string;
    content: string;
    tags: string[] | null; // Go sends null for an empty list
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
    id: number;
    url: string;
    type: 'image' | 'video';
    alt?: string;
};

type PostCardProps = {
    post: Post;
    bordered?: boolean;
    /** Clicking anywhere on the card opens the post. Off on the post page itself. */
    clickable?: boolean;
};

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function PostCard({
    post,
    bordered = true,
    clickable = true,
}: PostCardProps) {
    const router = useRouter();
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

    const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
        if (!clickable || shouldIgnoreCardClick(e)) return;
        router.push(`/post/${post.id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className={cn(
                'flex flex-col gap-2.5',
                bordered && 'rounded-xl border border-border p-5',
                clickable &&
                'cursor-pointer transition-colors hover:border-foreground/20 hover:bg-accent/40'
            )}
        >
            {/* Meta row */}
            <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                    {post.author.avatar && (
                        <AvatarImage
                            src={post.author.avatar}
                            alt={post.author.username}
                        />
                    )}
                    <AvatarFallback className="text-[10px]">
                        {getInitials(post.author.username)}
                    </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
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
                <h3 className="text-lg font-semibold leading-snug hover:underline">
                    {post.title}
                </h3>
            </Link>

            <div className="prose prose-sm dark:prose-invert max-w-none text-[15px] leading-relaxed [&>*]:my-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content}
                </ReactMarkdown>
            </div>

            {post.media && post.media.length > 0 && (
                <div
                    className={cn(
                        'grid gap-2',
                        post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                    )}
                >
                    {post.media.map((item, i) => {
                        const single = post.media!.length === 1;
                        // with three attachments the first one takes the full width,
                        // so the row below stays balanced
                        const spanFull = post.media!.length === 3 && i === 0;

                        return (
                            <div
                                key={item.id}
                                className={cn(
                                    'relative aspect-video overflow-hidden rounded-md border border-border bg-muted',
                                    spanFull && 'col-span-2'
                                )}
                            >
                                {item.type === 'image' ? (
                                    <Image
                                        src={item.url}
                                        alt={item.alt ?? ''}
                                        fill
                                        sizes={single ? '(max-width: 1024px) 100vw, 820px' : '410px'}
                                        // a lone image is shown whole; in a grid it's cropped to keep the tiles even
                                        className={single ? 'object-contain' : 'object-cover'}
                                    />
                                ) : (
                                    <video
                                        src={item.url}
                                        controls
                                        preload="metadata"
                                        className="h-full w-full object-contain"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer — votes left, counters right */}
            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'h-8 w-8',
                            userVote === 1 && 'text-orange-500'
                        )}
                        onClick={() => handleVote(1)}
                        disabled={voting}
                    >
                        <ArrowBigUp className="h-5 w-5" />
                    </Button>
                    <span className="min-w-[2ch] text-center text-sm font-semibold">
                        {score}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'h-8 w-8',
                            userVote === -1 && 'text-blue-500'
                        )}
                        onClick={() => handleVote(-1)}
                        disabled={voting}
                    >
                        <ArrowBigDown className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {post.comment_count}
                    </span>
                    <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.view_count}
                    </span>
                </div>
            </div>
        </div>
    );
}
