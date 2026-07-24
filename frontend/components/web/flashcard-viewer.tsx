// components/web/flashcard-viewer.tsx
'use client';
import { useState } from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Card = { id: number; front: string; back: string };

export function FlashcardViewer({ cards }: { cards: Card[] }) {
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    if (cards.length === 0) {
        return <p className="text-sm text-muted-foreground">This set has no cards yet.</p>;
    }

    const card = cards[index];

    const next = () => {
        setFlipped(false);
        setIndex((i) => (i + 1) % cards.length);
    };
    const prev = () => {
        setFlipped(false);
        setIndex((i) => (i - 1 + cards.length) % cards.length);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <button
                onClick={() => setFlipped((f) => !f)}
                className={cn(
                    'flex h-56 w-full max-w-md items-center justify-center rounded-lg border border-border p-6 text-center text-lg font-medium transition-colors hover:bg-muted/30'
                )}
            >
                {flipped ? card.back : card.front}
            </button>

            <span className="text-xs text-muted-foreground">
                {index + 1} / {cards.length} · click card to flip
            </span>

            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prev}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={next}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
