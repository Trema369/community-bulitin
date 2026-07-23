// components/web/comment-thread.tsx
'use client';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getInitials, cn } from '@/lib/utils';
import { ArrowBigUp, ArrowBigDown, Reply } from 'lucide-react';
import { CommentComposer } from './comment-composer';
import type { Comment } from '@/app/(dashboard)/post/[id]/page';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

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

type CommentThreadProps = {
    comments: Comment[];
    parentId: number | null;
    postId: number;
    onCommentAdded: (comment: Comment) => void;
    depth?: number;
};

export function CommentThread({ comments, parentId, postId, onCommentAdded, depth = 0 }: CommentThreadProps) {
    const children = comments.filter((c) => c.parent_id === parentId);
    if (children.length === 0) return null;

    return (
        <div className="flex flex-col gap-3">
            {children.map((comment) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    comments={comments}
                    postId={postId}
                    onCommentAdded={onCommentAdded}
                    depth={depth}
                />
            ))}
        </div>
    );
}

function CommentItem({
    comment,
    comments,
    postId,
    onCommentAdded,
    depth,
}: {
    comment: Comment;
    comments: Comment[];
    postId: number;
    onCommentAdded: (c: Comment) => void;
    depth: number;
}) {
    const [score, setScore] = useState(comment.score);
    const [userVote, setUserVote] = useState(comment.user_vote);
    const [replying, setReplying] = useState(false);

    const handleVote = async (value: 1 | -1) => {
        const prevScore = score;
        const prevVote = userVote;
        const delta = userVote === value ? -value : value - userVote;
        setScore(prevScore + delta);
        setUserVote(userVote === value ? 0 : value);

        try {
            const res = await fetch(`${API_BASE}/comments/${comment.id}/vote`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value }),
            });
            if (!res.ok) throw new Error();
        } catch {
            setScore(prevScore);
            setUserVote(prevVote);
        }
    };

    return (
        <div className={cn(depth > 0 && 'ml-6 border-l border-border pl-3')}>
            <div className="flex items-start gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">{getInitials(comment.author.username)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{comment.author.username}</span> · {formatRelativeTime(comment.created_at)}
                    </span>
                    <p className="text-sm">{comment.content}</p>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className={cn('h-5 w-5', userVote === 1 && 'text-orange-500')} onClick={() => handleVote(1)}>
                            <ArrowBigUp className="h-3.5 w-3.5" />
                        </Button>
                        <span className="min-w-[1.5ch] text-center text-xs">{score}</span>
                        <Button variant="ghost" size="icon" className={cn('h-5 w-5', userVote === -1 && 'text-blue-500')} onClick={() => handleVote(-1)}>
                            <ArrowBigDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-5 gap-1 px-1 text-xs text-muted-foreground" onClick={() => setReplying((r) => !r)}>
                            <Reply className="h-3 w-3" />
                            Reply
                        </Button>
                    </div>

                    {replying && (
                        <div className="mt-1">
                            <CommentComposer
                                postId={postId}
                                parentId={comment.id}
                                onCommentAdded={(c) => {
                                    onCommentAdded(c);
                                    setReplying(false);
                                }}
                                onCancel={() => setReplying(false)}
                            />
                        </div>
                    )}

                    <div className="mt-2">
                        <CommentThread
                            comments={comments}
                            parentId={comment.id}
                            postId={postId}
                            onCommentAdded={onCommentAdded}
                            depth={depth + 1}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
