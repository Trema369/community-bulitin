// components/web/important-dates-card.tsx
'use client';
import { useMemo } from 'react';
import { CalendarClock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_META, daysUntil } from '@/lib/notice-meta';
import type { Alert } from '@/lib/use-alerts';

/** The next few things happening, soonest first. */
export function ImportantDatesCard({ announcements }: { announcements: Alert[] }) {
    const upcoming = useMemo(
        () =>
            announcements
                .filter((a) => a.event_date && daysUntil(a.event_date) >= 0)
                .sort(
                    (a, b) => +new Date(a.event_date!) - +new Date(b.event_date!)
                )
                .slice(0, 5),
        [announcements]
    );

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-border p-5">
            <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Important dates</h3>
            </div>

            {upcoming.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    Nothing scheduled yet — post an announcement with a date.
                </p>
            ) : (
                <div className="flex flex-col divide-y divide-border">
                    {upcoming.map((a) => {
                        const date = new Date(a.event_date!);
                        const meta = CATEGORY_META[a.category] ?? CATEGORY_META.other;
                        const away = daysUntil(a.event_date!);

                        return (
                            <div key={a.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                                {/* date tile */}
                                <div
                                    className={cn(
                                        'flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-lg',
                                        meta.chip
                                    )}
                                >
                                    <span className="text-sm font-bold leading-none">
                                        {date.getDate()}
                                    </span>
                                    <span className="text-[9px] font-medium uppercase leading-none">
                                        {date.toLocaleDateString(undefined, { month: 'short' })}
                                    </span>
                                </div>

                                <div className="flex min-w-0 flex-col gap-0.5">
                                    <span className="truncate text-sm font-medium leading-snug">
                                        {a.title}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {away === 0
                                            ? 'Today'
                                            : away === 1
                                                ? 'Tomorrow'
                                                : `In ${away} days`}
                                    </span>
                                    {a.location && (
                                        <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                                            <MapPin className="h-3 w-3 flex-shrink-0" />
                                            {a.location}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
