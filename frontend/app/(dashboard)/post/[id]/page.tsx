// app/(dashboard)/post/[id]/page.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { PostCard, Post } from '@/components/web/postCard';
import { CommentThread } from '@/components/web/comment-thread';
import { CommentComposer } from '@/components/web/comment-composer';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

export type Comment = {
    id: number;
    post_id: number;
    parent_id: number | null;
    content: string;
    author: { id: number; username: string; avatar?: string };
    created_at: string;
    score: number;
    user_vote: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default function PostPage() {
    const params = useParams();
    const postId = params.id as string;

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [composing, setComposing] = useState(false); // NEW — toggle for top-level composer

    const fetchPost = useCallback(() => {
        fetch(`${API_BASE}/posts/${postId}`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then(setPost);
    }, [postId]);

    const fetchComments = useCallback(() => {
        fetch(`${API_BASE}/posts/${postId}/comments`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : []))
            .then(setComments)
            .finally(() => setLoading(false));
    }, [postId]);

    useEffect(() => {
        fetchPost();
        fetchComments();
    }, [fetchPost, fetchComments]);

    const handleCommentAdded = (comment: Comment) => {
        setComments((prev) => [...prev, comment]);
        setComposing(false);
    };

    if (loading || !post) {
        return <p className="text-sm text-muted-foreground">Loading post...</p>;
    }

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            <PostCard post={post} bordered={false} />

            <Separator />

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                        {comments.length} comment{comments.length !== 1 ? 's' : ''}
                    </h3>
                    {!composing && (
                        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setComposing(true)}>
                            <MessageSquare className="h-3.5 w-3.5" />
                            Reply
                        </Button>
                    )}
                </div>

                {composing && (
                    <CommentComposer
                        postId={post.id}
                        parentId={null}
                        onCommentAdded={handleCommentAdded}
                        onCancel={() => setComposing(false)}
                    />
                )}

                <CommentThread comments={comments} parentId={null} postId={post.id} onCommentAdded={handleCommentAdded} />
            </div>
        </div>
    );
}
