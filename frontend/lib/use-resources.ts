// lib/use-resources.ts
'use client';
import { useEffect, useState, useCallback } from 'react';

export type Resource = {
    id: number;
    type: 'note' | 'flashcard';
    title: string;
    description: string;
    content: string;
    tags: string[];
    is_public: boolean;
    code: string;
    author: { id: number; username: string };
    created_at: string;
    card_count: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function useResources(type: string, scope: 'discover' | 'mine' = 'discover') {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (type !== 'all') params.set('type', type);
        if (scope === 'mine') params.set('scope', 'mine');

        fetch(`${API_BASE}/resources?${params}`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : []))
            .then(setResources)
            .catch(() => setResources([]))
            .finally(() => setLoading(false));
    }, [type, scope]);

    useEffect(() => { refresh(); }, [refresh]);

    return { resources, loading, refresh };
}
