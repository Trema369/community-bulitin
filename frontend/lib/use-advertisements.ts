'use client';
import { useEffect, useState, useCallback } from 'react';

export type AdCategory = 'job' | 'sale' | 'service' | 'event' | 'other';

export type Advertisement = {
    id: number;
    title: string;
    description: string;
    category: AdCategory;
    contact_info: string;
    link: string;
    author: { id: number; username: string; avatar?: string };
    community: { id: number; name: string; description: string };
    expires_at: string | null;
    created_at: string;
    is_expired: boolean;
};

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function useAdvertisements(category?: string) {
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(() => {
        const url = category
            ? `${API_BASE}/advertisements?category=${category}`
            : `${API_BASE}/advertisements`;
        fetch(url)
            .then((res) => (res.ok ? res.json() : []))
            .then(setAds)
            .catch(() => setAds([]))
            .finally(() => setLoading(false));
    }, [category]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { ads, loading, refresh };
}
