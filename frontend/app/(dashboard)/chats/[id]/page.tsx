'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
    id: number;
    conversation_id: number;
    sender: { id: number; username: string };
    content: string;
    created_at: string;
};

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default function ConversationPage() {
    const params = useParams();
    const conversationId = params.id as string;
    const { user } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const fetchMessages = useCallback(() => {
        fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
            credentials: 'include',
        })
            .then((res) => (res.ok ? res.json() : []))
            .then(setMessages);
    }, [conversationId]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // poll for new messages
        return () => clearInterval(interval);
    }, [fetchMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setSending(true);
        try {
            await fetch(
                `${API_BASE}/conversations/${conversationId}/messages`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content }),
                }
            );
            setContent('');
            fetchMessages();
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto pb-4">
                    {messages.map((msg) => {
                        const isMine = msg.sender.id === user?.id;
                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    'max-w-[70%] rounded-lg px-3 py-2 text-sm',
                                    isMine
                                        ? 'self-end bg-primary text-primary-foreground'
                                        : 'self-start bg-muted'
                                )}
                            >
                                {msg.content}
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                <form
                    onSubmit={handleSend}
                    className="flex gap-2 border-t border-border pt-3"
                >
                    <Input
                        placeholder="Type a message..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <Button type="submit" size="icon" disabled={sending}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
