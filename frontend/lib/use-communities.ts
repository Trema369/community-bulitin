// lib/use-communities.ts
'use client';
import { useEffect, useState } from 'react';

export type Community = {
    id: number;
    name: string;
    description: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function useCommunities() {
    const [communities, setCommunities] = useState<Community[]>([]);

    useEffect(() => {
        fetch(`${API_BASE}/communities`)
            .then((res) => (res.ok ? res.json() : []))
            .then(setCommunities)
            .catch(() => setCommunities([]));
    }, []);

    return communities;
}
