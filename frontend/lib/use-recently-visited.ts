// lib/use-recently-visited.ts
'use client';
import { useEffect, useState } from 'react';

export type VisitedPost = {
    id: number;
    title: string;
    community: string;
    visited_at: number;
};

const STORAGE_KEY = 'com-hub:recently-visited';
const SYNC_EVENT = 'com-hub:visited-changed';
const MAX_VISITED = 6;

function read(): VisitedPost[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return []; // unparseable or storage blocked — treat as empty history
    }
}

/** Call when a post page opens. Most recent first, one entry per post. */
export function recordPostVisit(post: {
    id: number;
    title: string;
    community: { name: string };
}) {
    if (typeof window === 'undefined') return;

    const entry: VisitedPost = {
        id: post.id,
        title: post.title,
        community: post.community.name,
        visited_at: Date.now(),
    };

    const next = [entry, ...read().filter((p) => p.id !== entry.id)].slice(
        0,
        MAX_VISITED
    );

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        // let any mounted card in this tab pick the change up
        window.dispatchEvent(new Event(SYNC_EVENT));
    } catch {
        // storage full or disabled — history is a nicety, so ignore
    }
}

export function useRecentlyVisited() {
    // starts empty so the server and first client render agree
    const [visited, setVisited] = useState<VisitedPost[]>([]);

    useEffect(() => {
        const sync = () => setVisited(read());
        sync();
        window.addEventListener(SYNC_EVENT, sync);
        window.addEventListener('storage', sync); // other tabs
        return () => {
            window.removeEventListener(SYNC_EVENT, sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    return visited;
}
