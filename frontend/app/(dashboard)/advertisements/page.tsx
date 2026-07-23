// app/(dashboard)/advertisements/page.tsx
'use client';
import { useState } from 'react';
import { useAdvertisements, AdCategory } from '@/lib/use-advertisements';
import { AdCard } from '@/components/web/ad-card';
import { CreateAd } from '@/components/web/create-ad';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FILTERS: { value: AdCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'job', label: 'Jobs' },
    { value: 'sale', label: 'For sale' },
    { value: 'service', label: 'Services' },
    { value: 'event', label: 'Events' },
    { value: 'other', label: 'Other' },
];

export default function AdvertisementsPage() {
    const [filter, setFilter] = useState<AdCategory | 'all'>('all');
    const { ads, loading, refresh } = useAdvertisements(
        filter === 'all' ? undefined : filter
    );

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Advertisements</h1>
                    <CreateAd onCreated={() => refresh()} />
                </div>

                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((f) => (
                        <Button
                            key={f.value}
                            size="sm"
                            variant={filter === f.value ? 'default' : 'outline'}
                            className={cn(
                                'rounded-full',
                                filter === f.value && 'font-semibold'
                            )}
                            onClick={() => setFilter(f.value)}
                        >
                            {f.label}
                        </Button>
                    ))}
                </div>

                {loading && (
                    <p className="text-sm text-muted-foreground">
                        Loading advertisements...
                    </p>
                )}
                {!loading && ads.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No advertisements yet.
                    </p>
                )}

                {ads.map((ad) => (
                    <AdCard key={ad.id} ad={ad} />
                ))}
            </div>
        </div>
    );
}
