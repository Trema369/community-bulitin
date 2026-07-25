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
import { AlertTriangle, Megaphone, MapPin, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCommunities } from '@/lib/use-communities';
import { CATEGORIES_BY_KIND, CATEGORY_META } from '@/lib/notice-meta';
import type { Alert, AlertCategory, NoticeKind } from '@/lib/use-alerts';

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

const COPY: Record<
    NoticeKind,
    { trigger: string; title: string; blurb: string; body: string; submit: string }
> = {
    alert: {
        trigger: 'Raise alert',
        title: 'Raise a community alert',
        blurb: 'Something the neighbourhood should know about now. Neighbours vote, and the most-backed alerts rise to the top.',
        body: "What's happening?",
        submit: 'Raise alert',
    },
    announcement: {
        trigger: 'Post announcement',
        title: 'Post an announcement',
        blurb: 'A clean-up, a local event, a youth initiative — anything people can turn up to.',
        body: 'What is it, and who is it for?',
        submit: 'Post announcement',
    },
};

export function CreateAlert({
    onCreated,
    defaultCommunity,
    kind = 'alert',
}: {
    onCreated: (alert: Alert) => void;
    defaultCommunity?: string;
    kind?: NoticeKind;
}) {
    const { communities } = useCommunities();
    const copy = COPY[kind];
    const isAnnouncement = kind === 'announcement';

    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<AlertCategory | ''>('');
    const [community, setCommunity] = useState(defaultCommunity ?? '');
    const [eventDate, setEventDate] = useState('');
    const [location, setLocation] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const reset = () => {
        setTitle('');
        setDescription('');
        setCategory('');
        setEventDate('');
        setLocation('');
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim() || !description.trim() || !category || !community) {
            setError('Title, details, category and community are all needed.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/alerts`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    kind,
                    title,
                    description,
                    category,
                    community,
                    event_date: isAnnouncement ? eventDate : '',
                    location: isAnnouncement ? location : '',
                }),
            });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload?.message ?? 'Failed to post');
            onCreated(payload);
            reset();
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
                <Button
                    variant={isAnnouncement ? 'default' : 'outline'}
                    className={cn(
                        'gap-2',
                        !isAnnouncement && 'border-danger/40 text-danger hover:bg-danger-soft'
                    )}
                >
                    {isAnnouncement ? (
                        <Megaphone className="h-4 w-4" />
                    ) : (
                        <AlertTriangle className="h-4 w-4" />
                    )}
                    {copy.trigger}
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{copy.title}</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">{copy.blurb}</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* category as chips — faster to scan than a dropdown */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES_BY_KIND[kind].map((key) => {
                            const meta = CATEGORY_META[key];
                            const Icon = meta.icon;
                            const active = category === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setCategory(key)}
                                    className={cn(
                                        'chip border transition-colors',
                                        active
                                            ? `${meta.chip} border-current`
                                            : 'border-border text-muted-foreground hover:bg-accent'
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {meta.label}
                                </button>
                            );
                        })}
                    </div>

                    <Input
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Textarea
                        placeholder={copy.body}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />

                    {isAnnouncement && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <label className="flex flex-col gap-1.5">
                                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    When
                                </span>
                                <Input
                                    type="datetime-local"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                />
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    Where
                                </span>
                                <Input
                                    placeholder="e.g. Riverside Park"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </label>
                        </div>
                    )}

                    {defaultCommunity ? (
                        <p className="text-xs text-muted-foreground">
                            Posting to <span className="font-medium">{defaultCommunity}</span>
                        </p>
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

                    {error && <p className="text-sm text-danger">{error}</p>}

                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Posting...' : copy.submit}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
