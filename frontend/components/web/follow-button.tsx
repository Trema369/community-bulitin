// components/web/follow-button.tsx
'use client';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function FollowButton({ userId }: { userId: number }) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/users/${userId}/profile`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => data && setIsFollowing(data.is_following))
            .finally(() => setLoading(false));
    }, [userId]);

    const toggle = async () => {
        const endpoint = isFollowing ? 'unfollow' : 'follow';
        setIsFollowing(!isFollowing); // optimistic
        try {
            await fetch(`${API_BASE}/users/${userId}/${endpoint}`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            setIsFollowing(isFollowing); // revert
        }
    };

    if (loading) return null;

    return (
        <Button
            size="sm"
            variant={isFollowing ? 'outline' : 'default'}
            onClick={toggle}
        >
            {isFollowing ? 'Following' : 'Follow'}
        </Button>
    );
}
