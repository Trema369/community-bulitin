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
    const trimmed = query.trim();

    // results are stored alongside the query that produced them, so "are these
    // stale?" becomes a comparison during render instead of a setState in an effect
    const [fetched, setFetched] = useState<{
        query: string;
        results: SearchResults;
    }>({ query: '', results: EMPTY });

    useEffect(() => {
        if (!trimmed) return;

        const timeout = setTimeout(() => {
            fetch(`${API_BASE}/search?q=${encodeURIComponent(trimmed)}`, {
                credentials: 'include',
            })
                .then((res) => (res.ok ? res.json() : EMPTY))
                .then((results) => setFetched({ query: trimmed, results }))
                .catch(() => setFetched({ query: trimmed, results: EMPTY }));
        }, 300);

        return () => clearTimeout(timeout);
    }, [trimmed]);

    const current = fetched.query === trimmed;

    return {
        results: trimmed && current ? fetched.results : EMPTY,
        loading: trimmed !== '' && !current,
    };
}
