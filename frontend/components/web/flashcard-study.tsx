// components/web/flashcard-study.tsx
'use client';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Card = { id: number; front: string; back: string };

type FlashcardStudyProps = {
    cards: Card[];
    onExit: () => void;
};

export function FlashcardStudy({ cards, onExit }: FlashcardStudyProps) {
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [animating, setAnimating] = useState(false);

    const card = cards[index];
    const progress = ((index + 1) / cards.length) * 100;

    const flip = () => {
        setAnimating(true);
        setTimeout(() => {
            setFlipped((f) => !f);
            setAnimating(false);
        }, 120);
    };

    const next = () => {
        setFlipped(false);
        setIndex((i) => Math.min(cards.length - 1, i + 1));
    };
    const prev = () => {
        setFlipped(false);
        setIndex((i) => Math.max(0, i - 1));
    };
    const restart = () => {
        setFlipped(false);
        setIndex(0);
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') next();
            else if (e.key === 'ArrowLeft') prev();
            else if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                flip();
            } else if (e.key === 'Escape') onExit();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="gap-1.5" onClick={onExit}>
                    <X className="h-4 w-4" />
                    Exit study
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                    {index + 1} / {cards.length}
                </span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex flex-col items-center gap-8 py-6">
                <div className="flex flex-wrap justify-center gap-2">
                    {cards.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setFlipped(false);
                                setIndex(i);
                            }}
                            className={cn(
                                'h-2 rounded-full transition-all',
                                i === index ? 'w-7 bg-primary' : 'w-2 bg-muted'
                            )}
                        />
                    ))}
                </div>

                {/* card — single face rendered at a time, crossfade/scale on flip */}
                <button
                    onClick={flip}
                    className={cn(
                        'flex h-96 w-full max-w-3xl flex-col items-center justify-center gap-4 rounded-xl border p-10 text-center transition-all duration-150',
                        flipped ? 'border-primary/30 bg-primary/5' : 'border-border',
                        animating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
                    )}
                >
                    <span
                        className={cn(
                            'text-xs font-semibold uppercase tracking-wider',
                            flipped ? 'text-primary' : 'text-muted-foreground'
                        )}
                    >
                        {flipped ? 'Answer' : 'Question'}
                    </span>
                    <p className="text-2xl font-semibold leading-snug">
                        {flipped ? card.back : card.front}
                    </p>
                    {!flipped && (
                        <span className="text-sm text-muted-foreground">Click or press space to flip</span>
                    )}
                </button>

                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-10 w-10" onClick={prev} disabled={index === 0}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={flip}>
                        <RotateCcw className="h-4 w-4" />
                        Flip
                    </Button>
                    <Button variant="outline" size="icon" className="h-10 w-10" onClick={next} disabled={index === cards.length - 1}>
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                </div>

                {index === cards.length - 1 && (
                    <Button className="gap-1.5" onClick={restart}>
                        <RotateCcw className="h-3.5 w-3.5" />
                        Start over
                    </Button>
                )}

                <p className="text-xs text-muted-foreground">← → to navigate · Space to flip · Esc to exit</p>
            </div>
        </div>
    );
}
