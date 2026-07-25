// components/web/ai-chat.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Bot, X, Loader2, SendHorizontal } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
    'Summarise this week in my community',
    'Ideas for a neighbourhood clean-up',
    'Explain photosynthesis simply',
];

export function AiChat({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, sending]);

    // close on Escape
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, setOpen]);

    if (!open) return null;

    const ask = async (question: string) => {
        const text = question.trim();
        if (!text || sending) return;

        const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
        setMessages(next);
        setInput('');
        setError(null);
        setSending(true);

        try {
            const res = await fetch(`${API_BASE}/ai/chat`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: next }),
            });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload?.message ?? 'The assistant is unavailable');
            setMessages([...next, { role: 'assistant', content: payload.reply }]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setSending(false);
        }
    };

    return (
        <div
            className={cn(
                'fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl',
                // full-width sheet on phones, floating panel from the tablet up
                'inset-x-3 bottom-3 top-20 sm:inset-x-auto sm:right-6 sm:top-auto sm:h-[540px] sm:w-[400px]'
            )}
        >
            <div className="flex flex-shrink-0 items-center gap-2.5 border-b border-border px-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft">
                    <Bot className="h-4 w-4 text-primary" />
                </span>
                <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold">Ask Bulittin</span>
                    <span className="text-[11px] text-muted-foreground">
                        Community and study help
                    </span>
                </div>
                <button
                    onClick={() => setOpen(false)}
                    aria-label="Close assistant"
                    className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
                {messages.length === 0 && (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-muted-foreground">
                            Ask me about your community, an event you&apos;re planning,
                            or something you&apos;re studying.
                        </p>
                        <div className="flex flex-col gap-2">
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => ask(s)}
                                    className="rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={cn(
                            'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                            m.role === 'user'
                                ? 'self-end bg-primary text-primary-foreground'
                                : 'self-start bg-muted'
                        )}
                    >
                        {m.content}
                    </div>
                ))}

                {sending && (
                    <div className="flex items-center gap-2 self-start rounded-2xl bg-muted px-3.5 py-2 text-sm text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Thinking...
                    </div>
                )}

                {error && <p className="text-xs text-danger">{error}</p>}
                <div ref={bottomRef} />
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    ask(input);
                }}
                className="flex flex-shrink-0 items-center gap-2 border-t border-border p-3"
            >
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-1 rounded-full border border-border bg-transparent px-4 py-2 text-sm outline-none focus:border-primary/50 placeholder:text-muted-foreground"
                />
                <Button
                    type="submit"
                    size="icon"
                    className="flex-shrink-0 rounded-full"
                    disabled={sending || !input.trim()}
                >
                    <SendHorizontal className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
