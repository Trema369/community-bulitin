import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
    Briefcase,
    Tag,
    Wrench,
    CalendarDays,
    HelpCircle,
    ExternalLink,
} from 'lucide-react';
import type { Advertisement, AdCategory } from '@/lib/use-advertisements';
import { cn } from '@/lib/utils';

const CATEGORY_META: Record<
    AdCategory,
    { label: string; icon: typeof Briefcase }
> = {
    job: { label: 'Job', icon: Briefcase },
    sale: { label: 'For sale', icon: Tag },
    service: { label: 'Service', icon: Wrench },
    event: { label: 'Event', icon: CalendarDays },
    other: { label: 'Other', icon: HelpCircle },
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

export function AdCard({ ad }: { ad: Advertisement }) {
    const meta = CATEGORY_META[ad.category];
    const CategoryIcon = meta.icon;

    return (
        <div
            className={cn(
                'flex flex-col gap-2 rounded-lg border border-border p-4',
                ad.is_expired && 'opacity-50'
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                        {meta.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        · {ad.community.name} ·{' '}
                        {formatRelativeTime(ad.created_at)}
                    </span>
                </div>
                {ad.is_expired && (
                    <Badge variant="secondary" className="text-[10px]">
                        Expired
                    </Badge>
                )}
            </div>

            <h3 className="text-sm font-semibold leading-snug">{ad.title}</h3>
            <p className="text-sm text-muted-foreground leading-snug">
                {ad.description}
            </p>

            <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">
                    Contact: {ad.contact_info}
                </span>
                {ad.link && (
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-1.5"
                    >
                        <a
                            href={ad.link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Visit link
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </Button>
                )}
            </div>
        </div>
    );
}
