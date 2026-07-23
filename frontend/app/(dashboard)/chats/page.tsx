// app/(dashboard)/chats/page.tsx
'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useConversations } from '@/lib/use-conversations';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

export default function ChatsPage() {
    const { user } = useAuth();
    const { conversations, loading } = useConversations();

    if (loading)
        return (
            <p className="text-sm text-muted-foreground">
                Loading conversations...
            </p>
        );

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
                <h1 className="text-xl font-bold mb-2">Messages</h1>

                {conversations.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No conversations yet.
                    </p>
                )}

                {conversations.map((convo) => {
                    const other =
                        convo.user_a.id === user?.id
                            ? convo.user_b
                            : convo.user_a;
                    return (
                        <Link
                            key={convo.id}
                            href={`/chats/${convo.id}`}
                            className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>
                                    {getInitials(other.username)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium">
                                    {other.username}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                    {convo.last_message?.content ??
                                        'No messages yet'}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
