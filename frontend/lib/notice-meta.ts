// lib/notice-meta.ts
import {
    AlertTriangle,
    Users,
    HelpCircle,
    PackageSearch,
    Trash2,
    CalendarDays,
    Sprout,
    type LucideIcon,
} from 'lucide-react';
import type { AlertCategory, AlertPriority, NoticeKind } from './use-alerts';

type CategoryMeta = {
    label: string;
    icon: LucideIcon;
    /** tint classes for the category chip */
    chip: string;
};

export const CATEGORY_META: Record<AlertCategory, CategoryMeta> = {
    robbery: {
        label: 'Safety',
        icon: AlertTriangle,
        chip: 'bg-danger-soft text-danger',
    },
    lost_item: {
        label: 'Lost item',
        icon: PackageSearch,
        chip: 'bg-warning-soft text-warning',
    },
    meeting: {
        label: 'Meeting',
        icon: Users,
        chip: 'bg-info-soft text-info',
    },
    cleanup: {
        label: 'Clean-up',
        icon: Trash2,
        chip: 'bg-success-soft text-success',
    },
    event: {
        label: 'Local event',
        icon: CalendarDays,
        chip: 'bg-brand-soft text-primary',
    },
    youth: {
        label: 'Youth',
        icon: Sprout,
        chip: 'bg-success-soft text-success',
    },
    other: {
        label: 'Other',
        icon: HelpCircle,
        chip: 'bg-muted text-muted-foreground',
    },
};

export const CATEGORIES_BY_KIND: Record<NoticeKind, AlertCategory[]> = {
    alert: ['robbery', 'lost_item', 'meeting', 'other'],
    announcement: ['cleanup', 'event', 'youth', 'meeting', 'other'],
};

export const PRIORITY_CHIP: Record<AlertPriority, string> = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-warning-soft text-warning',
    high: 'bg-warning-soft text-warning',
    critical: 'bg-danger-soft text-danger',
};

export function formatEventDate(iso: string): string {
    const d = new Date(iso);
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    return d.toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        ...(hasTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
}

/** Days until an event — negative once it's passed. */
export function daysUntil(iso: string): number {
    const target = new Date(iso);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((+target - +today) / 86_400_000);
}
