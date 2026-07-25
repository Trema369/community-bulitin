import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { MouseEvent } from 'react';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateStr: string | number): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

/** Things inside a card that own their own click: links, buttons, media controls, form fields. */
const CARD_INTERACTIVE_SELECTOR =
    'a, button, input, textarea, select, video, audio, label, [role="button"], [data-card-ignore]';

/**
 * True when a click inside a clickable card should NOT navigate — because it landed
 * on an inner control, the user was selecting text, or they used a modifier key.
 */
export function shouldIgnoreCardClick(e: MouseEvent<HTMLElement>): boolean {
    if (e.defaultPrevented) return true;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return true;

    const target = e.target as HTMLElement | null;
    if (target?.closest(CARD_INTERACTIVE_SELECTOR)) return true;

    // don't yank the page away mid text-selection
    if (window.getSelection()?.toString()) return true;

    return false;
}

export function getInitials(name?: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
