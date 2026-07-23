'use client';
import { useEffect, useState } from 'react';
import type { Post } from '@/components/web/postCard';
import type { Alert } from './use-alerts';
import type { Community } from './use-communities';

export type SearchUser = { id: number; username: string; avatar?: string };

export type SearchResults = {
    posts: Post[];
    alerts: Alert[];
    users: SearchUser[];
    communities: Community[];
};

const EMPTY: SearchResults = {
    posts: [],
    alerts: [],
    users: [],
    communities: [],
};
const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function useSearch(query: string) {
    const [results, setResults] = useState<SearchResults>(EMPTY);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query.trim()) {
            setResults(EMPTY);
            return;
        }

        setLoading(true);
        const timeout = setTimeout(() => {
            fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
                credentials: 'include',
            })
                .then((res) => (res.ok ? res.json() : EMPTY))
                .then(setResults)
                .catch(() => setResults(EMPTY))
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    return { results, loading };
}
