// lib/use-resources.ts
'use client';
import { useEffect, useState, useCallback } from 'react';

export type ResourceType = 'note' | 'flashcard' | 'document' | 'media';

export type Resource = {
    id: number;
    type: ResourceType;
    title: string;
    description: string;
    content: string;
    tags: string[] | null; // Go sends null for an empty list
    is_public: boolean;
    code: string;
    author: { id: number; username: string };
    created_at: string;
    card_count: number;
    file_url: string;
    file_name: string;
    file_type: 'image' | 'video' | 'document' | '';
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function useResources(type: string, scope: 'discover' | 'mine' = 'discover') {
    const key = `${type}:${scope}`;

    // resources are stored with the filter that produced them; loading is then a
    // comparison during render rather than a setState inside the effect
    const [fetched, setFetched] = useState<{
        key: string | null;
        resources: Resource[];
    }>({ key: null, resources: [] });

    const refresh = useCallback(() => {
        const params = new URLSearchParams();
        if (type !== 'all') params.set('type', type);
        if (scope === 'mine') params.set('scope', 'mine');

        fetch(`${API_BASE}/resources?${params}`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : []))
            .then((resources) => setFetched({ key, resources }))
            .catch(() => setFetched({ key, resources: [] }));
    }, [type, scope, key]);

    useEffect(() => { refresh(); }, [refresh]);

    const current = fetched.key === key;

    return {
        resources: current ? fetched.resources : [],
        loading: !current,
        refresh,
    };
}
