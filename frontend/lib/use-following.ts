// lib/use-following.ts
'use client';
import { useEffect, useState } from 'react';

export type FollowedUser = {
    id: number;
    username: string;
    avatar?: string;
};

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function useFollowing() {
    const [following, setFollowing] = useState<FollowedUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/users/me/following`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : []))
            .then(setFollowing)
            .catch(() => setFollowing([]))
            .finally(() => setLoading(false));
    }, []);

    return { following, loading };
}
