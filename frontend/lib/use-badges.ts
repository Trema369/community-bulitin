'use client';
import { useEffect, useState } from 'react';
import { useAuth } from './auth-context';

export type Badge = {
    id: number;
    badge: {
        key: string;
        name: string;
        description: string;
        image_path: string;
    };
};

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function useBadges() {
    const { user } = useAuth();
    const [badges, setBadges] = useState<Badge[]>([]);

    useEffect(() => {
        if (!user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setBadges([]);
            return;
        }
        fetch(`${API_BASE}/badges/me`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : []))
            .then(setBadges)
            .catch(() => setBadges([]));
    }, [user]);

    return badges;
}
