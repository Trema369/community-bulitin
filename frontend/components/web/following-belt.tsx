'use client';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';
import { useFollowing } from '@/lib/use-following';

// components/web/following-belt.tsx
export function FollowingBelt() {
    const { following, loading } = useFollowing();

    if (loading || following.length === 0) return null;

    return (
        <div className="overflow-x-auto px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-4">
                {following.map((user) => (
                    <Link
                        key={user.id}
                        href={`/u/${user.id}`}
                        className="flex flex-col items-center gap-1 flex-shrink-0 w-16"
                    >
                        <Avatar className="h-14 w-14 ring-2 ring-primary/40 ring-offset-2 ring-offset-background transition-transform hover:scale-105">
                            {user.avatar && (
                                <AvatarImage
                                    src={user.avatar}
                                    alt={user.username}
                                />
                            )}
                            <AvatarFallback className="text-sm">
                                {getInitials(user.username)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-[11px] text-muted-foreground truncate w-full text-center">
                            {user.username}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
