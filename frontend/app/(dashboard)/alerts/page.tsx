'use client';
import { useAlerts } from '@/lib/use-alerts';
import { AlertCard } from '@/components/web/alerts-card';
import { CreateAlert } from '@/components/web/create-alert';

export default function AlertsPage() {
    const { alerts, loading, refresh } = useAlerts();

    // sort by score descending so highest-priority alerts surface first
    const sorted = [...alerts].sort((a, b) => b.score - a.score);

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Community alerts</h1>
                    <CreateAlert onCreated={() => refresh()} />
                </div>

                {loading && (
                    <p className="text-sm text-muted-foreground">
                        Loading alerts...
                    </p>
                )}
                {!loading && sorted.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No active alerts.
                    </p>
                )}

                {sorted.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                ))}
            </div>
        </div>
    );
}
