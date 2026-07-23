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
import { Megaphone } from 'lucide-react';
import { useCommunities } from '@/lib/use-communities';
import type { Advertisement, AdCategory } from '@/lib/use-advertisements';

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

const CATEGORIES: { value: AdCategory; label: string }[] = [
    { value: 'job', label: 'Job' },
    { value: 'sale', label: 'For sale' },
    { value: 'service', label: 'Service' },
    { value: 'event', label: 'Event' },
    { value: 'other', label: 'Other' },
];

export function CreateAd({
    onCreated,
}: {
    onCreated: (ad: Advertisement) => void;
}) {
    const { communities } = useCommunities();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<AdCategory | ''>('');
    const [contactInfo, setContactInfo] = useState('');
    const [link, setLink] = useState('');
    const [community, setCommunity] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (
            !title.trim() ||
            !description.trim() ||
            !category ||
            !contactInfo.trim() ||
            !community
        ) {
            setError(
                'Title, description, category, contact info, and community are required.'
            );
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/advertisements`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    category,
                    contact_info: contactInfo,
                    link: link || undefined,
                    community,
                    expires_at: expiresAt || undefined,
                }),
            });
            const payload = await res.json();
            if (!res.ok)
                throw new Error(
                    payload?.message ?? 'Failed to create advertisement'
                );
            onCreated(payload);
            setTitle('');
            setDescription('');
            setCategory('');
            setContactInfo('');
            setLink('');
            setExpiresAt('');
            setOpen(false);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Something went wrong'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Megaphone className="h-4 w-4" />
                    Post advertisement
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Post an advertisement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

                    <Select
                        value={category}
                        onValueChange={(v) => setCategory(v as AdCategory)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                    {c.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />
                    <Input
                        placeholder="Contact info (email, phone, etc.)"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                    />
                    <Input
                        placeholder="Link (optional)"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                    />

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">
                            Expires on (optional)
                        </label>
                        <Input
                            type="date"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Posting...' : 'Post advertisement'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
