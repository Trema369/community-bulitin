'use client';
import { useEffect, useState, useCallback } from 'react';

export type Conversation = {
    id: number;
    user_a: { id: number; username: string; avatar?: string };
    user_b: { id: number; username: string; avatar?: string };
    created_at: string;
    last_message: {
        content: string;
        created_at: string;
        sender: { id: number; username: string };
    } | null;
};

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function useConversations() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(() => {
        fetch(`${API_BASE}/conversations`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : []))
            .then(setConversations)
            .catch(() => setConversations([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 5000); // poll every 5s for new messages
        return () => clearInterval(interval);
    }, [refresh]);

    return { conversations, loading, refresh };
}
