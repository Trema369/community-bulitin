// components/web/search-dialog.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getInitials, cn } from '@/lib/utils';
import { Search, FileText, AlertTriangle, Users, Hash, X } from 'lucide-react';
import { useSearch } from '@/lib/use-search';

type SearchDialogProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

function SectionHeader({ icon: Icon, label }: { icon: typeof FileText; label: string }) {
    return (
        <div className="flex items-center gap-2 px-1 pt-3 pb-1 first:pt-0">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </span>
        </div>
    );
}

export function SearchDialog({ open, setOpen }: SearchDialogProps) {
    const [query, setQuery] = useState('');
    const { results, loading } = useSearch(query);

    const hasAny =
        results.posts.length > 0 ||
        results.alerts.length > 0 ||
        results.users.length > 0 ||
        results.communities.length > 0;

    const close = () => {
        setOpen(false);
        setQuery('');
    };

    // close on Escape
    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-24"
            onClick={close}
        >
            <div
                className="flex w-full max-w-lg flex-col gap-3 px-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Widget 1 — search box, own bordered container */}
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-3">
                    <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <input
                        autoFocus
                        placeholder="Search posts, alerts, people, communities..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <button onClick={close} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Widget 2 — results, own separate bordered container */}
                {query.trim() && (
                    <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-border bg-background p-3">
                        {loading && (
                            <p className="py-6 text-center text-sm text-muted-foreground">Searching...</p>
                        )}

                        {!loading && !hasAny && (
                            <p className="py-6 text-center text-sm text-muted-foreground">No results found.</p>
                        )}

                        {results.communities.length > 0 && (
                            <>
                                <SectionHeader icon={Hash} label="Communities" />
                                <div className="flex flex-col gap-1">
                                    {results.communities.map((c) => (
                                        <Link
                                            key={c.id}
                                            href={`/c/${c.name}`}
                                            onClick={close}
                                            className="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-muted/50"
                                        >
                                            <span className="text-sm font-medium">{c.name}</span>
                                            <span className="truncate text-xs text-muted-foreground">
                                                {c.description}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}

                        {results.users.length > 0 && (
                            <>
                                <SectionHeader icon={Users} label="People" />
                                <div className="flex flex-col gap-1">
                                    {results.users.map((u) => (
                                        <Link
                                            key={u.id}
                                            href={`/u/${u.id}`}
                                            onClick={close}
                                            className="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-muted/50"
                                        >
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-[10px]">
                                                    {getInitials(u.username)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium">{u.username}</span>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}

                        {results.alerts.length > 0 && (
                            <>
                                <SectionHeader icon={AlertTriangle} label="Alerts" />
                                <div className="flex flex-col gap-1">
                                    {results.alerts.map((a) => (
                                        <Link
                                            key={a.id}
                                            href="/alerts"
                                            onClick={close}
                                            className="flex flex-col gap-0.5 rounded-md p-2 transition-colors hover:bg-muted/50"
                                        >
                                            <span className="truncate text-sm font-medium">{a.title}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {a.community.name}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}

                        {results.posts.length > 0 && (
                            <>
                                <SectionHeader icon={FileText} label="Posts" />
                                <div className="flex flex-col gap-1">
                                    {results.posts.map((p) => (
                                        <Link
                                            key={p.id}
                                            href={`/post/${p.id}`}
                                            onClick={close}
                                            className="flex flex-col gap-0.5 rounded-md p-2 transition-colors hover:bg-muted/50"
                                        >
                                            <span className="truncate text-sm font-medium">{p.title}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {p.community.name}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
