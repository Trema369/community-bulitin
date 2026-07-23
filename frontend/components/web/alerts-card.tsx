'use client';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { getInitials, cn } from '@/lib/utils';
import {
    ArrowBigUp,
    ArrowBigDown,
    AlertTriangle,
    Users,
    HelpCircle,
    PackageSearch,
} from 'lucide-react';
import type { Alert, AlertCategory, AlertPriority } from '@/lib/use-alerts';

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

const CATEGORY_META: Record<
    AlertCategory,
    { label: string; icon: typeof AlertTriangle }
> = {
    meeting: { label: 'Meeting', icon: Users },
    robbery: { label: 'Robbery', icon: AlertTriangle },
    lost_item: { label: 'Lost item', icon: PackageSearch },
    other: { label: 'Other', icon: HelpCircle },
};

const PRIORITY_STYLES: Record<AlertPriority, string> = {
    low: 'border-border',
    medium: 'border-yellow-500/50',
    high: 'border-orange-500/60',
    critical: 'border-red-500 bg-red-500/5',
};

const PRIORITY_BADGE: Record<AlertPriority, string> = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
    high: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
    critical: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

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

export function AlertCard({ alert }: { alert: Alert }) {
    const [score, setScore] = useState(alert.score);
    const [priority, setPriority] = useState(alert.priority);
    const [userVote, setUserVote] = useState(alert.user_vote);
    const [voting, setVoting] = useState(false);

    const meta = CATEGORY_META[alert.category];
    const CategoryIcon = meta.icon;

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
            className={cn(
                'flex flex-col gap-2 rounded-lg border-2 p-4',
                PRIORITY_STYLES[priority]
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                        {meta.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        · {alert.community.name} ·{' '}
                        {formatRelativeTime(alert.created_at)}
                    </span>
                </div>
                <Badge
                    className={cn(
                        'text-[10px] uppercase',
                        PRIORITY_BADGE[priority]
                    )}
                >
                    {priority}
                </Badge>
            </div>

            <h3 className="text-sm font-semibold leading-snug">
                {alert.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-snug">
                {alert.description}
            </p>

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
                <span className="text-xs text-muted-foreground">
                    by {alert.author.username}
                </span>
            </div>
        </div>
    );
}
