'use client';
import { useEffect, useState, useCallback } from 'react';

export type Community = {
    id: number;
    name: string;
    description: string;
    creator: { id: number; username: string };
    member_count: number;
    is_member: boolean;
    created_at: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function useCommunities() {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(() => {
        fetch(`${API_BASE}/communities`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : []))
            .then(setCommunities)
            .catch(() => setCommunities([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    return { communities, loading, refresh };
}
