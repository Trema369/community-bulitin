// app/(dashboard)/u/[id]/page.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';
import { FollowButton } from '@/components/web/follow-button';
import { MessageCircle } from 'lucide-react';

type Profile = {
    id: number;
    username: string;
    follower_count: number;
    following_count: number;
    is_following: boolean;
    is_self: boolean;
};

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [profile, setProfile] = useState<Profile | null>(null);

    const fetchProfile = useCallback(() => {
        fetch(`${API_BASE}/users/${userId}`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : null))
            .then(setProfile);
    }, [userId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const startConversation = async () => {
        const res = await fetch(`${API_BASE}/users/${userId}/conversation`, {
            method: 'POST',
            credentials: 'include',
        });
        if (res.ok) {
            const convo = await res.json();
            router.push(`/chats/${convo.id}`);
        }
    };

    if (!profile)
        return (
            <p className="text-sm text-muted-foreground">Loading profile...</p>
        );

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-14 w-14">
                            <AvatarFallback className="text-lg">
                                {getInitials(profile.username)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold">
                                {profile.username}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {profile.follower_count} followers ·{' '}
                                {profile.following_count} following
                            </span>
                        </div>
                    </div>

                    {!profile.is_self && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={startConversation}
                            >
                                <MessageCircle className="h-4 w-4" />
                                Message
                            </Button>
                            <FollowButton userId={profile.id} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
