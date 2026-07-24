// components/web/top-alerts-card.tsx
'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { useAlerts } from '@/lib/use-alerts';

const PRIORITY_DOT: Record<string, string> = {
    low: 'bg-muted-foreground',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
};

export function TopAlertsCard() {
    const { alerts } = useAlerts();

    const topAlerts = useMemo(
        () => [...alerts].sort((a, b) => b.score - a.score).slice(0, 5),
        [alerts]
    );

    return (
        <div className="flex min-h-[220px] flex-col gap-3 rounded-lg border border-border p-6">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-semibold">Top alerts</h3>
            </div>
            {topAlerts.length === 0 && (
                <p className="text-xs text-muted-foreground">No active alerts.</p>
            )}
            {topAlerts.map((alert) => (
                <Link
                    key={alert.id}
                    href="/alerts"
                    className="flex items-start gap-2 rounded-md p-1.5 hover:bg-muted/50 transition-colors"
                >
                    <span
                        className={cn(
                            'mt-1 h-2 w-2 flex-shrink-0 rounded-full',
                            PRIORITY_DOT[alert.priority]
                        )}
                    />
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium truncate">{alert.title}</span>
                        <span className="text-[10px] text-muted-foreground">
                            {alert.community.name} · {alert.score} votes
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    );
}
