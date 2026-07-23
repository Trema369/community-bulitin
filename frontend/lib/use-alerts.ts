'use client';
import { useEffect, useState, useCallback } from 'react';

export type AlertCategory = 'meeting' | 'robbery' | 'lost_item' | 'other';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export type Alert = {
    id: number;
    title: string;
    description: string;
    category: AlertCategory;
    author: { id: number; username: string; avatar?: string };
    community: { id: number; name: string; description: string };
    created_at: string;
    score: number;
    priority: AlertPriority;
    user_vote: number;
};

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function useAlerts(community?: string) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(() => {
        const url = community
            ? `${API_BASE}/alerts?community=${community}`
            : `${API_BASE}/alerts`;
        fetch(url, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : []))
            .then(setAlerts)
            .catch(() => setAlerts([]))
            .finally(() => setLoading(false));
    }, [community]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { alerts, loading, refresh };
}
