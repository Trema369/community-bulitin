// components/web/mini-calendar.tsx
'use client';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Alert } from '@/lib/use-alerts';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function sameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

type MiniCalendarProps = {
    announcements: Alert[];
    selected: Date | null;
    onSelect: (date: Date | null) => void;
};

/**
 * A month grid marking the days that have something happening. Hand-rolled
 * rather than pulled in as a dependency — it only needs to show dots and take a
 * click.
 */
export function MiniCalendar({
    announcements,
    selected,
    onSelect,
}: MiniCalendarProps) {
    const today = new Date();
    const [cursor, setCursor] = useState(
        () => new Date(today.getFullYear(), today.getMonth(), 1)
    );

    const eventDays = useMemo(() => {
        const days = new Set<string>();
        for (const a of announcements) {
            if (!a.event_date) continue;
            const d = new Date(a.event_date);
            days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
        }
        return days;
    }, [announcements]);

    const cells = useMemo(() => {
        const year = cursor.getFullYear();
        const month = cursor.getMonth();
        const first = new Date(year, month, 1);
        // getDay() is Sunday-first; shift so weeks start on Monday
        const lead = (first.getDay() + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const out: (Date | null)[] = Array(lead).fill(null);
        for (let d = 1; d <= daysInMonth; d++) out.push(new Date(year, month, d));
        return out;
    }, [cursor]);

    const shift = (months: number) =>
        setCursor((c) => new Date(c.getFullYear(), c.getMonth() + months, 1));

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                    {cursor.toLocaleDateString(undefined, {
                        month: 'long',
                        year: 'numeric',
                    })}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => shift(-1)}
                        aria-label="Previous month"
                        className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => shift(1)}
                        aria-label="Next month"
                        className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center">
                {WEEKDAYS.map((d, i) => (
                    <span
                        key={i}
                        className="text-[10px] font-medium uppercase text-muted-foreground"
                    >
                        {d}
                    </span>
                ))}

                {cells.map((date, i) => {
                    if (!date) return <span key={`pad-${i}`} />;

                    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                    const hasEvent = eventDays.has(key);
                    const isToday = sameDay(date, today);
                    const isSelected = selected != null && sameDay(date, selected);

                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onSelect(isSelected ? null : date)}
                            className={cn(
                                'relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors',
                                isSelected
                                    ? 'bg-primary font-semibold text-primary-foreground'
                                    : hasEvent
                                        ? 'font-semibold text-primary hover:bg-brand-soft'
                                        : 'text-muted-foreground hover:bg-accent',
                                isToday && !isSelected && 'ring-1 ring-primary/40'
                            )}
                        >
                            {date.getDate()}
                            {hasEvent && !isSelected && (
                                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                            )}
                        </button>
                    );
                })}
            </div>

            {selected && (
                <button
                    type="button"
                    onClick={() => onSelect(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                >
                    Clear filter
                </button>
            )}
        </div>
    );
}
