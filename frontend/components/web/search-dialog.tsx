// components/web/search-dialog.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent } from '../ui/dialog';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getInitials, cn } from '@/lib/utils';
import { Search, FileText, AlertTriangle, Users, Hash } from 'lucide-react';
import { useSearch } from '@/lib/use-search';

type SearchDialogProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

function SectionHeader({
    icon: Icon,
    label,
}: {
    icon: typeof FileText;
    label: string;
}) {
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
                {/* Widget 1 — search box */}
                <div className="flex items-center gap-2 border-b border-border p-3">
                    <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input
                        autoFocus
                        placeholder="Search posts, alerts, people, communities..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="border-none shadow-none focus-visible:ring-0 px-0 h-auto"
                    />
                </div>

                {/* Widget 2 — results */}
                <div className="max-h-[60vh] overflow-y-auto p-3">
                    {!query.trim() && (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            Start typing to search.
                        </p>
                    )}

                    {query.trim() && loading && (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            Searching...
                        </p>
                    )}

                    {query.trim() && !loading && !hasAny && (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            No results found.
                        </p>
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
                                        className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-sm font-medium">
                                            {c.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate">
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
                                        className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/50 transition-colors"
                                    >
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-[10px]">
                                                {getInitials(u.username)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">
                                            {u.username}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}

                    {results.alerts.length > 0 && (
                        <>
                            <SectionHeader
                                icon={AlertTriangle}
                                label="Alerts"
                            />
                            <div className="flex flex-col gap-1">
                                {results.alerts.map((a) => (
                                    <Link
                                        key={a.id}
                                        href="/alerts"
                                        onClick={close}
                                        className="flex flex-col gap-0.5 rounded-md p-2 hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-sm font-medium truncate">
                                            {a.title}
                                        </span>
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
                                        className="flex flex-col gap-0.5 rounded-md p-2 hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-sm font-medium truncate">
                                            {p.title}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {p.community.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
