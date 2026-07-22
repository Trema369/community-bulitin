// components/web/filter-bar.tsx
'use client';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const FILTERS = ['All', 'Trending', 'Gaming', 'Music', 'Tech', 'Art'];

type FilterBarProps = {
    active: string;
    onSelect: (filter: string) => void;
};

export function FilterBar({ active, onSelect }: FilterBarProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((filter) => (
                <Button
                    key={filter}
                    size="sm"
                    variant={active === filter ? 'default' : 'outline'}
                    className={cn('rounded-full', active === filter && 'font-semibold')}
                    onClick={() => onSelect(filter)}
                >
                    {filter}
                </Button>
            ))}
        </div>
    );
}
