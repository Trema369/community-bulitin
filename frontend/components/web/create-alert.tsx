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
import { AlertTriangle } from 'lucide-react';
import { useCommunities } from '@/lib/use-communities';
import type { Alert, AlertCategory } from '@/lib/use-alerts';

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

const CATEGORIES: { value: AlertCategory; label: string }[] = [
    { value: 'meeting', label: 'Community meeting' },
    { value: 'robbery', label: 'Robbery' },
    { value: 'lost_item', label: 'Lost item' },
    { value: 'other', label: 'Other' },
];

export function CreateAlert({
    onCreated,
    defaultCommunity,
}: {
    onCreated: (alert: Alert) => void;
    defaultCommunity?: string;
}) {
    const { communities } = useCommunities();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<AlertCategory | ''>('');
    const [community, setCommunity] = useState(defaultCommunity ?? '');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!title.trim() || !description.trim() || !category || !community) {
            setError('All fields are required.');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/alerts`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    category,
                    community,
                }),
            });
            const payload = await res.json();
            if (!res.ok)
                throw new Error(payload?.message ?? 'Failed to create alert');
            onCreated(payload);
            setTitle('');
            setDescription('');
            setCategory('');
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
                <Button variant="destructive" className="gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Raise alert
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Raise a community alert</DialogTitle>
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
                        onValueChange={(v) => setCategory(v as AlertCategory)}
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
                        placeholder="What's happening?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button
                        type="submit"
                        variant="destructive"
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Raise alert'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
