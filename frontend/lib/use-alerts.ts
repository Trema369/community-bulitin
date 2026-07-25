'use client';
import { useEffect, useState, useCallback } from 'react';

/** Urgent notices vs. planned community activity. */
export type NoticeKind = 'alert' | 'announcement';

export type AlertCategory =
    | 'meeting'
    | 'robbery'
    | 'lost_item'
    | 'other'
    | 'cleanup'
    | 'event'
    | 'youth';

export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export type Alert = {
    id: number;
    kind: NoticeKind;
    title: string;
    description: string;
    category: AlertCategory;
    event_date: string | null;
    location: string;
    author: { id: number; username: string; avatar?: string };
    community: { id: number; name: string; description: string };
    created_at: string;
    score: number;
    priority: AlertPriority;
    user_vote: number;
};

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/** Pass a kind to fetch only alerts or only announcements; omit it for both. */
export function useAlerts(community?: string, kind?: NoticeKind) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(() => {
        const params = new URLSearchParams();
        if (community) params.set('community', community);
        if (kind) params.set('kind', kind);

        fetch(`${API_BASE}/alerts?${params}`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : []))
            .then(setAlerts)
            .catch(() => setAlerts([]))
            .finally(() => setLoading(false));
    }, [community, kind]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { alerts, loading, refresh };
}
