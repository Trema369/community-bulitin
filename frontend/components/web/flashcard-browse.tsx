// components/web/flashcard-browse.tsx
'use client';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Pencil, Trash2, Plus, X, Check, FlipHorizontal } from 'lucide-react';

type Card = { id: number; front: string; back: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

type FlashcardBrowseProps = {
    resourceId: number;
    cards: Card[];
    isOwner: boolean;
    onCardsChanged: (cards: Card[]) => void;
    onStudy: () => void;
};

export function FlashcardBrowse({ resourceId, cards, isOwner, onCardsChanged, onStudy }: FlashcardBrowseProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editFront, setEditFront] = useState('');
    const [editBack, setEditBack] = useState('');
    const [adding, setAdding] = useState(false);
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');

    const startEdit = (card: Card) => {
        setEditingId(card.id);
        setEditFront(card.front);
        setEditBack(card.back);
    };

    const saveEdit = async () => {
        if (editingId === null || !editFront.trim() || !editBack.trim()) return;
        await fetch(`${API_BASE}/resources/${resourceId}/cards/${editingId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ front: editFront, back: editBack }),
        });
        onCardsChanged(
            cards.map((c) => (c.id === editingId ? { ...c, front: editFront, back: editBack } : c))
        );
        setEditingId(null);
    };

    const deleteCard = async (cardId: number) => {
        await fetch(`${API_BASE}/resources/${resourceId}/cards/${cardId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        onCardsChanged(cards.filter((c) => c.id !== cardId));
    };

    const addCard = async () => {
        if (!newFront.trim() || !newBack.trim()) return;
        const res = await fetch(`${API_BASE}/resources/${resourceId}/cards`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ front: newFront, back: newBack }),
        });
        if (res.ok) {
            const updatedCards = await res.json();
            onCardsChanged(updatedCards);
        }
        setNewFront('');
        setNewBack('');
        setAdding(false);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground">
                    {cards.length} card{cards.length !== 1 ? 's' : ''}
                </h3>
                <div className="flex items-center gap-2">
                    {isOwner && (
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAdding(true)}>
                            <Plus className="h-3.5 w-3.5" />
                            Add card
                        </Button>
                    )}
                    {cards.length > 0 && (
                        <Button size="sm" className="gap-1.5" onClick={onStudy}>
                            <FlipHorizontal className="h-3.5 w-3.5" />
                            Study
                        </Button>
                    )}
                </div>
            </div>

            {adding && (
                <div className="flex flex-col gap-2 rounded-lg border border-primary/30 p-3">
                    <div className="grid grid-cols-2 gap-2">
                        <Textarea placeholder="Front" value={newFront} onChange={(e) => setNewFront(e.target.value)} rows={2} />
                        <Textarea placeholder="Back" value={newBack} onChange={(e) => setNewBack(e.target.value)} rows={2} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setAdding(false)}>
                            <X className="h-3.5 w-3.5" />
                            Cancel
                        </Button>
                        <Button size="sm" className="gap-1.5" onClick={addCard}>
                            <Check className="h-3.5 w-3.5" />
                            Save
                        </Button>
                    </div>
                </div>
            )}

            {cards.length === 0 && !adding && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                    No cards yet.{isOwner ? ' Add your first one above.' : ''}
                </p>
            )}

            {cards.map((card, i) =>
                editingId === card.id ? (
                    <div key={card.id} className="flex flex-col gap-2 rounded-lg border border-primary/30 p-3">
                        <div className="grid grid-cols-2 gap-2">
                            <Textarea value={editFront} onChange={(e) => setEditFront(e.target.value)} rows={2} />
                            <Textarea value={editBack} onChange={(e) => setEditBack(e.target.value)} rows={2} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setEditingId(null)}>
                                <X className="h-3.5 w-3.5" />
                                Cancel
                            </Button>
                            <Button size="sm" className="gap-1.5" onClick={saveEdit}>
                                <Check className="h-3.5 w-3.5" />
                                Save
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div key={card.id} className="flex items-stretch gap-2">
                        <div className="grid flex-1 grid-cols-2 divide-x divide-border rounded-lg border border-border">
                            <div className="flex flex-col gap-1 p-3">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {i + 1}
                                </span>
                                <p className="text-sm font-medium">{card.front}</p>
                            </div>
                            <div className="flex flex-col gap-1 p-3">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                                    Answer
                                </span>
                                <p className="text-sm text-muted-foreground">{card.back}</p>
                            </div>
                        </div>
                        {isOwner && (
                            <div className="flex flex-col gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(card)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-500"
                                    onClick={() => deleteCard(card.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )}
                    </div>
                )
            )}

            {cards.length > 1 && (
                <div className="mt-4 flex justify-center">
                    <Button className="gap-2" onClick={onStudy}>
                        <FlipHorizontal className="h-4 w-4" />
                        Study {cards.length} cards
                    </Button>
                </div>
            )}
        </div>
    );
}
