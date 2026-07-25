// components/web/create-post.tsx
'use client';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Plus, Hash } from 'lucide-react';
import { useCommunities } from '@/lib/use-communities';
import { MediaPicker, type PostMediaInput } from './media-picker';
import type { Post } from './postCard';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

type CreatePostProps = {
    onPostCreated: (post: Post) => void;
    /** Preselects (and locks) the community — used on a community's own page. */
    defaultCommunity?: string;
};

export function CreatePost({
    onPostCreated,
    defaultCommunity,
}: CreatePostProps) {
    const { communities } = useCommunities();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [community, setCommunity] = useState(defaultCommunity ?? '');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [media, setMedia] = useState<PostMediaInput[]>([]);
    const [uploading, setUploading] = useState(false);
    // bumping this remounts the picker, which clears its previews after a post
    const [pickerKey, setPickerKey] = useState(0);

    const resetForm = () => {
        setTitle('');
        setContent('');
        setTagsInput('');
        setCommunity(defaultCommunity ?? '');
        setError(null);
        setMedia([]);
        setPickerKey((k) => k + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim() || !community) {
            setError('Title and community are required.');
            return;
        }

        // text is optional as long as something is attached
        if (!content.trim() && media.length === 0) {
            setError('Write something or attach a photo or video.');
            return;
        }

        if (uploading) {
            setError('Hang on — your attachments are still uploading.');
            return;
        }

        const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/posts`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, tags, community, media }),
            });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload?.message ?? 'Failed to create post');

            onPostCreated(payload);
            resetForm();
            setOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create post
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create a post</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {defaultCommunity ? (
                        <div className="flex items-center gap-2 rounded-lg bg-brand-soft px-3 py-2 text-sm">
                            <Hash className="h-4 w-4 text-primary" />
                            <span className="font-medium">{defaultCommunity}</span>
                            <span className="text-muted-foreground">
                                — posting here
                            </span>
                        </div>
                    ) : (
                        <Select value={community} onValueChange={setCommunity}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a community" />
                            </SelectTrigger>
                            <SelectContent>
                                {communities.map((c) => (
                                    <SelectItem key={c.id} value={c.name}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

                    <Textarea
                        placeholder="Write your post in Markdown... (optional if you attach media)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                    />

                    <MediaPicker
                        key={pickerKey}
                        onChange={setMedia}
                        onUploadingChange={setUploading}
                        disabled={submitting}
                    />

                    <Input
                        placeholder="Tags (comma separated)"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                    />

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button type="submit" disabled={submitting || uploading}>
                        {submitting
                            ? 'Posting...'
                            : uploading
                                ? 'Uploading...'
                                : 'Post'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
