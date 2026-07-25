'use client';
import { useMemo, useState } from 'react';
import { useAlerts } from '@/lib/use-alerts';
import { AlertCard } from '@/components/web/alerts-card';
import { CreateAlert } from '@/components/web/create-alert';
import { MiniCalendar } from '@/components/web/mini-calendar';
import { ImportantDatesCard } from '@/components/web/important-dates-card';
import { cn } from '@/lib/utils';
import { AlertTriangle, Megaphone } from 'lucide-react';

type Tab = 'alert' | 'announcement';

export default function AlertsPage() {
    const { alerts, loading, refresh } = useAlerts();
    const [tab, setTab] = useState<Tab>('alert');
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    const announcements = useMemo(
        () => alerts.filter((a) => a.kind === 'announcement'),
        [alerts]
    );

    const visible = useMemo(() => {
        const list = alerts.filter((a) => a.kind === tab);

        if (tab === 'alert') {
            // most-backed alerts first — the community decides what's urgent
            return [...list].sort((a, b) => b.score - a.score);
        }

        const byDate = [...list].sort((a, b) => {
            if (!a.event_date) return 1;
            if (!b.event_date) return -1;
            return +new Date(a.event_date) - +new Date(b.event_date);
        });

        if (!selectedDay) return byDate;
        return byDate.filter((a) => {
            if (!a.event_date) return false;
            const d = new Date(a.event_date);
            return (
                d.getFullYear() === selectedDay.getFullYear() &&
                d.getMonth() === selectedDay.getMonth() &&
                d.getDate() === selectedDay.getDate()
            );
        });
    }, [alerts, tab, selectedDay]);

    const counts = {
        alert: alerts.filter((a) => a.kind === 'alert').length,
        announcement: announcements.length,
    };

    const TABS: { key: Tab; label: string; icon: typeof AlertTriangle }[] = [
        { key: 'alert', label: 'Alerts', icon: AlertTriangle },
        { key: 'announcement', label: 'Announcements', icon: Megaphone },
    ];

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold">Alerts & Announcements</h1>
                        <p className="text-sm text-muted-foreground">
                            What needs attention now, and what&apos;s coming up.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <CreateAlert kind="alert" onCreated={() => refresh()} />
                        <CreateAlert kind="announcement" onCreated={() => refresh()} />
                    </div>
                </div>

                <div className="flex items-center gap-1 self-start rounded-lg bg-muted p-1">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => {
                                setTab(key);
                                setSelectedDay(null);
                            }}
                            className={cn(
                                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                                tab === key
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                            <span className="text-xs text-muted-foreground">
                                {counts[key]}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="flex flex-col gap-4">
                        {loading && (
                            <p className="text-sm text-muted-foreground">Loading...</p>
                        )}

                        {!loading && visible.length === 0 && (
                            <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
                                <p className="text-sm text-muted-foreground">
                                    {tab === 'alert'
                                        ? 'No active alerts — that’s good news.'
                                        : selectedDay
                                            ? 'Nothing scheduled on that day.'
                                            : 'No announcements yet. Post a clean-up, an event or a youth initiative.'}
                                </p>
                            </div>
                        )}

                        {visible.map((alert) => (
                            <AlertCard key={alert.id} alert={alert} />
                        ))}
                    </div>

                    <div className="flex flex-col gap-4">
                        <MiniCalendar
                            announcements={announcements}
                            selected={selectedDay}
                            onSelect={(date) => {
                                setSelectedDay(date);
                                if (date) setTab('announcement');
                            }}
                        />
                        <ImportantDatesCard announcements={announcements} />
                    </div>
                </div>
            </div>
        </div>
    );
}
