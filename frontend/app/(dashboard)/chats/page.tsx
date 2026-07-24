// app/(dashboard)/chats/page.tsx
'use client';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useConversations, Conversation } from '@/lib/use-conversations';
import { useFollowing } from '@/lib/use-following';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getInitials, cn } from '@/lib/utils';
import { Send, MessageCircle, MessageSquare } from 'lucide-react';

type Message = {
    id: number;
    conversation_id: number;
    sender: { id: number; username: string };
    content: string;
    created_at: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function ConversationListItem({
    convo,
    isSelected,
    currentUserId,
    onClick,
}: {
    convo: Conversation;
    isSelected: boolean;
    currentUserId?: number;
    onClick: () => void;
}) {
    const other = convo.user_a.id === currentUserId ? convo.user_b : convo.user_a;
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                isSelected ? 'bg-muted' : 'hover:bg-muted/50'
            )}
        >
            <Avatar className={cn('h-8 w-8 flex-shrink-0', isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background')}>
                <AvatarFallback className="text-xs">{getInitials(other.username)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{other.username}</span>
                <span className="truncate text-xs text-muted-foreground">
                    {convo.last_message?.content ?? 'No messages yet'}
                </span>
            </div>
        </button>
    );
}

export default function ChatsPage() {
    const { user } = useAuth();
    const { conversations, loading: conversationsLoading, refresh: refreshConversations } = useConversations();
    const { following, loading: followingLoading } = useFollowing();

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const selectedConvo = conversations.find((c) => c.id === selectedId) ?? null;
    const otherUser = selectedConvo
        ? selectedConvo.user_a.id === user?.id
            ? selectedConvo.user_b
            : selectedConvo.user_a
        : null;

    const fetchMessages = useCallback(() => {
        if (!selectedId) return;
        fetch(`${API_BASE}/conversations/${selectedId}/messages`, { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : []))
            .then(setMessages);
    }, [selectedId]);

    useEffect(() => {
        if (!selectedId) {
            setMessages([]);
            return;
        }
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [selectedId, fetchMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !selectedId) return;
        setSending(true);
        try {
            await fetch(`${API_BASE}/conversations/${selectedId}/messages`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });
            setContent('');
            fetchMessages();
            refreshConversations();
        } finally {
            setSending(false);
        }
    };

    const startOrOpenConversation = async (otherUserId: number) => {
        const existing = conversations.find(
            (c) => c.user_a.id === otherUserId || c.user_b.id === otherUserId
        );
        if (existing) {
            setSelectedId(existing.id);
            return;
        }

        const res = await fetch(`${API_BASE}/conversations/${otherUserId}/start`, {
            method: 'POST',
            credentials: 'include',
        });
        if (res.ok) {
            const convo = await res.json();
            await refreshConversations();
            setSelectedId(convo.id);
        }
    };

    // Every followed person is clickable, regardless of whether a conversation
    // already exists — clicking just opens it if so, or starts a new one if not.
    const messagableFollowing = useMemo(
        () =>
            following.filter(
                (f) => !conversations.some((c) => c.user_a.id === f.id || c.user_b.id === f.id)
            ),
        [following, conversations]
    );

    return (
        <div className="mx-auto flex h-full w-full max-w-5xl flex-col py-4">
            <h1 className="mb-3 flex-shrink-0 text-2xl font-bold">Messages</h1>

            <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr] overflow-hidden border border-border">
                {/* Left column */}
                <div className="flex flex-col overflow-hidden border-r border-border">
                    <div className="flex-shrink-0 border-b border-border px-3 py-2.5">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Conversations
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {conversationsLoading && (
                            <p className="px-2 py-1 text-xs text-muted-foreground">Loading...</p>
                        )}
                        {!conversationsLoading && conversations.length === 0 && (
                            <p className="px-2 py-1 text-xs text-muted-foreground">No conversations yet.</p>
                        )}
                        {conversations.map((convo) => (
                            <ConversationListItem
                                key={convo.id}
                                convo={convo}
                                isSelected={selectedId === convo.id}
                                currentUserId={user?.id}
                                onClick={() => setSelectedId(convo.id)}
                            />
                        ))}
                    </div>

                    <div className="flex-shrink-0 border-t border-border px-3 py-2.5">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Following
                        </p>
                    </div>
                    <div className="max-h-40 overflow-y-auto p-2">
                        {followingLoading && (
                            <p className="px-2 py-1 text-xs text-muted-foreground">Loading...</p>
                        )}
                        {!followingLoading && messagableFollowing.length === 0 && (
                            <p className="px-2 py-1 text-xs text-muted-foreground">No one new to message.</p>
                        )}
                        {messagableFollowing.map((person) => (
                            <button
                                key={person.id}
                                onClick={() => startOrOpenConversation(person.id)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted/50"
                            >
                                <Avatar className="h-7 w-7 flex-shrink-0">
                                    <AvatarFallback className="text-[10px]">
                                        {getInitials(person.username)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="truncate text-sm font-medium">{person.username}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right column */}
                <div className="flex min-h-0 flex-col">
                    {!selectedConvo ? (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
                            <MessageCircle className="h-9 w-9" />
                            <p className="text-sm">Select a conversation or message someone you follow.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-shrink-0 items-center gap-2.5 border-b border-border px-4 py-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                        {getInitials(otherUser!.username)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-semibold">{otherUser!.username}</span>
                            </div>

                            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
                                {messages.length === 0 && (
                                    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <MessageSquare className="h-8 w-8" />
                                        <p className="text-sm">No messages yet — say hello.</p>
                                    </div>
                                )}
                                {messages.map((msg) => {
                                    const isMine = msg.sender.id === user?.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                'flex flex-col gap-0.5',
                                                isMine ? 'items-end' : 'items-start'
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'max-w-[70%] rounded-lg px-3 py-2 text-sm',
                                                    isMine
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted'
                                                )}
                                            >
                                                {msg.content}
                                            </div>
                                            <span className="px-1 text-[10px] text-muted-foreground">
                                                {formatTime(msg.created_at)}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>

                            <form
                                onSubmit={handleSend}
                                className="flex flex-shrink-0 gap-2 border-t border-border p-3"
                            >
                                <Input
                                    placeholder="Type a message..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                                <Button type="submit" size="icon" disabled={sending || !content.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
