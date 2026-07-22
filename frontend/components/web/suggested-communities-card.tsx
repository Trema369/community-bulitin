// components/web/suggested-communities-card.tsx
'use client';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Users } from 'lucide-react';
import { useCommunities } from '@/lib/use-communities';

export function SuggestedCommunitiesCard() {
    const communities = useCommunities();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Suggested communities</h3>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {communities.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{c.name}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                                {c.description}
                            </span>
                        </div>
                        <Button size="sm" variant="outline">Join</Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
