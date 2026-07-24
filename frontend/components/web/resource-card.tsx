// components/web/resource-card.tsx
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { FlipHorizontal, FileText, Globe, Lock, Hash } from 'lucide-react';
import type { Resource } from '@/lib/use-resources';

export function ResourceCard({ resource }: { resource: Resource }) {
    const Icon = resource.type === 'flashcard' ? FlipHorizontal : FileText;

    return (
        <Link
            href={`/resources/${resource.id}`}
            className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
        >
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <span className="font-semibold">{resource.title}</span>
            </div>

            <p className="line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>

            {resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {resource.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[10px]">
                            {tag}
                        </Badge>
                    ))}
                </div>
            )}

            <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {resource.code}
                </span>
                <span className="flex items-center gap-1">
                    {resource.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {resource.is_public ? 'Public' : 'Private'}
                </span>
                {resource.type === 'flashcard' && <span>{resource.card_count} cards</span>}
            </div>
        </Link>
    );
}
