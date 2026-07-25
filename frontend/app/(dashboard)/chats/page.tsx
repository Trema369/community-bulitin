// app/(dashboard)/chats/page.tsx
'use client';
import { Suspense, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useConversations, Conversation } from '@/lib/use-conversations';
import { useFollowing } from '@/lib/use-following';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, cn } from '@/lib/utils';
import { MessageCircle, ChevronLeft } from 'lucide-react';

type Message = {
    id: number;
    conversation_id: number;
    sender: { id: number; username: string };
    content: string;
    created_at: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// stable identity, so effects depending on the message list don't refire each render
const NO_MESSAGES: Message[] = [];

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
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                isSelected ? 'bg-accent' : 'hover:bg-accent/50'
            )}
        >
            <Avatar className="h-14 w-14 flex-shrink-0">
                {other.avatar && <AvatarImage src={other.avatar} alt={other.username} />}
                <AvatarFallback>{getInitials(other.username)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold">{other.username}</span>
                <span className="truncate text-xs text-muted-foreground">
                    {convo.last_message?.content ?? 'Send a message'}
                </span>
            </div>
        </button>
    );
}

export default function ChatsPage() {
    // useSearchParams needs a suspense boundary to keep the page prerenderable
    return (
        <Suspense
            fallback={<p className="text-sm text-muted-foreground">Loading messages...</p>}
        >
            <ChatsView />
        </Suspense>
    );
}

function ChatsView() {
    const { user } = useAuth();
    // /chats?c=<id> opens straight into a conversation — that's where the Message
    // button on a profile sends you
    const requestedConvo = Number(useSearchParams().get('c')) || null;
    const { conversations, loading: conversationsLoading, refresh: refreshConversations } = useConversations();
    const { following } = useFollowing();

    const [selectedId, setSelectedId] = useState<number | null>(requestedConvo);
    // messages are tagged with the conversation they belong to, so selecting a
    // different one shows nothing until its own messages land — no clearing in an effect
    const [fetched, setFetched] = useState<{
        convoId: number | null;
        messages: Message[];
    }>({ convoId: null, messages: [] });
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
            .then((messages) => setFetched({ convoId: selectedId, messages }));
    }, [selectedId]);

    useEffect(() => {
        if (!selectedId) return;
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [selectedId, fetchMessages]);

    const messages =
        fetched.convoId === selectedId ? fetched.messages : NO_MESSAGES;

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

        const res = await fetch(`${API_BASE}/users/${otherUserId}/conversation`, {
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
        <div className="mx-auto flex h-full w-full max-w-6xl gap-0 overflow-hidden">
            {/* Conversation rail — a plain list, no card chrome. On phones it takes
                the whole screen until a conversation is picked. */}
            <div
                className={cn(
                    'flex-col border-r border-border md:flex md:w-[320px] md:flex-shrink-0',
                    selectedId ? 'hidden' : 'flex w-full'
                )}
            >
                <div className="flex-shrink-0 px-4 pb-3 pt-1 md:px-5">
                    <h1 className="text-2xl font-bold">Messages</h1>
                </div>

                {/* people you follow but haven't messaged — a story-style row */}
                {messagableFollowing.length > 0 && (
                    <div className="flex flex-shrink-0 gap-4 overflow-x-auto px-4 pb-4 md:px-5">
                        {messagableFollowing.map((person) => (
                            <button
                                key={person.id}
                                onClick={() => startOrOpenConversation(person.id)}
                                className="flex w-14 flex-shrink-0 flex-col items-center gap-1.5"
                            >
                                <span className="rounded-full bg-gradient-to-tr from-primary via-chart-5 to-warning p-[2px]">
                                    <Avatar className="h-14 w-14 border-2 border-background">
                                        <AvatarFallback className="text-sm">
                                            {getInitials(person.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                </span>
                                <span className="w-full truncate text-center text-[11px] text-muted-foreground">
                                    {person.username}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-2 pb-4">
                    {conversationsLoading && (
                        <p className="px-3 py-2 text-sm text-muted-foreground">Loading...</p>
                    )}
                    {!conversationsLoading && conversations.length === 0 && (
                        <p className="px-3 py-2 text-sm text-muted-foreground">
                            No conversations yet.
                        </p>
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
            </div>

            {/* Thread — hidden on phones until a conversation is chosen */}
            <div
                className={cn(
                    'min-h-0 flex-1 flex-col md:flex',
                    selectedId ? 'flex' : 'hidden'
                )}
            >
                {!selectedConvo ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                        <span className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-foreground">
                            <MessageCircle className="h-11 w-11" />
                        </span>
                        <p className="text-xl font-medium">Your messages</p>
                        <p className="max-w-xs text-sm text-muted-foreground">
                            Pick a conversation, or start one with someone you follow.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-shrink-0 items-center gap-3 border-b border-border px-4 py-3 md:px-5">
                            <button
                                onClick={() => setSelectedId(null)}
                                aria-label="Back to conversations"
                                className="-ml-1 rounded-lg p-1 hover:bg-accent md:hidden"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <Link
                                href={`/u/${otherUser!.id}`}
                                className="flex min-w-0 items-center gap-3 rounded-lg px-1 py-0.5 transition-colors hover:bg-accent/40"
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="text-sm">
                                        {getInitials(otherUser!.username)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="truncate font-semibold">
                                    {otherUser!.username}
                                </span>
                            </Link>
                        </div>

                        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-5 md:px-5 md:py-6">
                            {messages.length === 0 && (
                                <div className="flex flex-1 flex-col items-center justify-center gap-3">
                                    <Avatar className="h-20 w-20">
                                        <AvatarFallback className="text-xl">
                                            {getInitials(otherUser!.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="font-semibold">{otherUser!.username}</p>
                                    <p className="text-sm text-muted-foreground">
                                        No messages yet — say hello.
                                    </p>
                                </div>
                            )}

                            {messages.map((msg, i) => {
                                const isMine = msg.sender.id === user?.id;
                                // group consecutive messages from the same person
                                const prev = messages[i - 1];
                                const startsGroup = !prev || prev.sender.id !== msg.sender.id;
                                const next = messages[i + 1];
                                const endsGroup = !next || next.sender.id !== msg.sender.id;

                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            'flex items-end gap-2',
                                            isMine ? 'justify-end' : 'justify-start',
                                            startsGroup && i > 0 && 'mt-3'
                                        )}
                                    >
                                        {!isMine && (
                                            <Avatar
                                                className={cn(
                                                    'h-7 w-7 flex-shrink-0',
                                                    !endsGroup && 'invisible'
                                                )}
                                            >
                                                <AvatarFallback className="text-[10px]">
                                                    {getInitials(msg.sender.username)}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div
                                            title={formatTime(msg.created_at)}
                                            className={cn(
                                                'max-w-[80%] sm:max-w-[65%] px-4 py-2 text-sm leading-relaxed',
                                                isMine
                                                    ? 'rounded-3xl bg-primary text-primary-foreground'
                                                    : 'rounded-3xl bg-muted',
                                                // flatten the inner corner so a run of
                                                // messages reads as one block
                                                isMine && !endsGroup && 'rounded-br-md',
                                                !isMine && !endsGroup && 'rounded-bl-md'
                                            )}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

                        <form
                            onSubmit={handleSend}
                            className="flex flex-shrink-0 items-center gap-2 px-4 pb-4 pt-2 md:px-5 md:pb-5"
                        >
                            <div className="flex flex-1 items-center gap-2 rounded-full border border-border px-4 py-1.5 focus-within:border-primary/50">
                                <input
                                    placeholder="Message..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
                                />
                                {content.trim() && (
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="text-sm font-semibold text-primary hover:opacity-70 disabled:opacity-50"
                                    >
                                        Send
                                    </button>
                                )}
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
