// components/web/community-rules-card.tsx
'use client';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ScrollText, Pencil } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import type { Community } from '@/lib/use-communities';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

type CommunityRulesCardProps = {
    community: Community;
    onUpdated: (community: Community) => void;
};

export function CommunityRulesCard({
    community,
    onUpdated,
}: CommunityRulesCardProps) {
    const { user } = useAuth();
    const rules = community.rules ?? [];
    const canEdit = user?.id === community.creator?.id;

    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const openEditor = () => {
        setDraft(rules.join('\n'));
        setError(null);
        setOpen(true);
    };

    const save = async () => {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(
                `${API_BASE}/communities/${community.id}/rules`,
                {
                    method: 'PUT',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rules: draft.split('\n') }),
                }
            );
            const payload = await res.json();
            if (!res.ok) throw new Error(payload?.message ?? 'Failed to save rules');
            onUpdated(payload);
            setOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-6">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <ScrollText className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Rules</h3>
                </div>
                {canEdit && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 px-1.5 text-xs text-muted-foreground"
                        onClick={openEditor}
                    >
                        <Pencil className="h-3 w-3" />
                        Edit
                    </Button>
                )}
            </div>

            {rules.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    {canEdit
                        ? 'No rules yet — add some so members know what to expect.'
                        : 'This community has no rules yet.'}
                </p>
            ) : (
                <ol className="flex flex-col divide-y divide-border">
                    {rules.map((rule, i) => (
                        <li
                            key={`${i}-${rule}`}
                            className="flex gap-2 py-2 text-xs first:pt-0 last:pb-0"
                        >
                            <span className="text-muted-foreground">{i + 1}.</span>
                            <span className="leading-snug">{rule}</span>
                        </li>
                    ))}
                </ol>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit community rules</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <p className="text-xs text-muted-foreground">
                            One rule per line. Blank lines are ignored.
                        </p>
                        <Textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            rows={8}
                            placeholder={'Be respectful\nStay on topic\nNo spam'}
                        />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOpen(false)}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button size="sm" onClick={save} disabled={saving}>
                                {saving ? 'Saving...' : 'Save rules'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
