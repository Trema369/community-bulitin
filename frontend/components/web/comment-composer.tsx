// components/web/comment-composer.tsx
'use client';
import { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import type { Comment } from '@/app/(dashboard)/post/[id]/page';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

type CommentComposerProps = {
    postId: number;
    parentId: number | null;
    onCommentAdded: (comment: Comment) => void;
    onCancel?: () => void;
};

export function CommentComposer({ postId, parentId, onCommentAdded, onCancel }: CommentComposerProps) {
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, parent_id: parentId }),
            });
            if (!res.ok) throw new Error();
            const comment = await res.json();
            onCommentAdded(comment);
            setContent('');
            onCancel?.();
        } catch {
            // silent fail is fine for a hackathon; add a toast later if time allows
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <Textarea
                placeholder={parentId ? 'Write a reply...' : 'Write a comment...'}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={parentId ? 2 : 3}
            />
            <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={submitting}>
                    {submitting ? 'Posting...' : parentId ? 'Reply' : 'Comment'}
                </Button>
                {onCancel && (
                    <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}
