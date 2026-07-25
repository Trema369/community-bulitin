'use client';
import { useState } from 'react';
import { Button } from '../ui/button';
import { cn, formatRelativeTime } from '@/lib/utils';
import { ArrowBigUp, ArrowBigDown, MapPin, CalendarDays } from 'lucide-react';
import {
    CATEGORY_META,
    PRIORITY_CHIP,
    formatEventDate,
    daysUntil,
} from '@/lib/notice-meta';
import type { Alert } from '@/lib/use-alerts';

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function AlertCard({ alert }: { alert: Alert }) {
    const [score, setScore] = useState(alert.score);
    const [priority, setPriority] = useState(alert.priority);
    const [userVote, setUserVote] = useState(alert.user_vote);
    const [voting, setVoting] = useState(false);

    const meta = CATEGORY_META[alert.category] ?? CATEGORY_META.other;
    const CategoryIcon = meta.icon;
    const isAnnouncement = alert.kind === 'announcement';
    const countdown = alert.event_date ? daysUntil(alert.event_date) : null;

    const handleVote = async (value: 1 | -1) => {
        if (voting) return;
        setVoting(true);
        const prevScore = score;
        const prevVote = userVote;
        const delta = userVote === value ? -value : value - userVote;
        setScore(prevScore + delta);
        setUserVote(userVote === value ? 0 : value);

        try {
            const res = await fetch(`${API_BASE}/alerts/${alert.id}/vote`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value }),
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setScore(data.score);
            setPriority(data.priority);
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
            className="flex flex-col gap-2.5 rounded-xl border border-border p-5 transition-colors hover:border-foreground/15"
        >
            <div className="flex flex-wrap items-center gap-2">
                <span className={cn('chip', meta.chip)}>
                    <CategoryIcon className="h-3.5 w-3.5" />
                    {meta.label}
                </span>

                {!isAnnouncement && (
                    <span className={cn('chip uppercase', PRIORITY_CHIP[priority])}>
                        {priority}
                    </span>
                )}

                {countdown !== null && (
                    <span
                        className={cn(
                            'chip',
                            countdown < 0
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-brand-soft text-primary'
                        )}
                    >
                        {countdown < 0
                            ? 'Passed'
                            : countdown === 0
                                ? 'Today'
                                : countdown === 1
                                    ? 'Tomorrow'
                                    : `In ${countdown} days`}
                    </span>
                )}

                <span className="ml-auto text-xs text-muted-foreground">
                    {alert.community.name} · {formatRelativeTime(alert.created_at)}
                </span>
            </div>

            <h3 className="text-base font-semibold leading-snug">{alert.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
                {alert.description}
            </p>

            {(alert.event_date || alert.location) && (
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    {alert.event_date && (
                        <span className="flex items-center gap-1.5 font-medium">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            {formatEventDate(alert.event_date)}
                        </span>
                    )}
                    {alert.location && (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {alert.location}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn('h-7 w-7', userVote === 1 && 'text-primary')}
                        onClick={() => handleVote(1)}
                        disabled={voting}
                    >
                        <ArrowBigUp className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[2ch] text-center text-sm font-medium">
                        {score}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn('h-7 w-7', userVote === -1 && 'text-info')}
                        onClick={() => handleVote(-1)}
                        disabled={voting}
                    >
                        <ArrowBigDown className="h-4 w-4" />
                    </Button>
                    {!isAnnouncement && (
                        <span className="ml-1 text-xs text-muted-foreground">
                            votes set the priority
                        </span>
                    )}
                </div>
                <span className="text-xs text-muted-foreground">
                    by {alert.author.username}
                </span>
            </div>
        </div>
    );
}
