// components/web/resource-card.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import {
    FlipHorizontal,
    FileText,
    Globe,
    Lock,
    Hash,
    Paperclip,
    PlayCircle,
    ImageIcon,
} from 'lucide-react';
import type { Resource, ResourceType } from '@/lib/use-resources';

const TYPE_ICON: Record<ResourceType, typeof FileText> = {
    note: FileText,
    flashcard: FlipHorizontal,
    document: Paperclip,
    media: ImageIcon,
};

export function ResourceCard({ resource }: { resource: Resource }) {
    const Icon = TYPE_ICON[resource.type] ?? FileText;
    const isImage = resource.file_type === 'image';
    const isVideo = resource.file_type === 'video';

    return (
        <Link
            href={`/resources/${resource.id}`}
            className="flex flex-col overflow-hidden rounded-xl border border-border transition-colors hover:border-foreground/20 hover:bg-accent/40"
        >
            {/* media resources lead with a preview */}
            {isImage && resource.file_url && (
                <div className="relative aspect-video w-full bg-muted">
                    <Image
                        src={resource.file_url}
                        alt={resource.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 320px"
                        className="object-cover"
                    />
                </div>
            )}
            {isVideo && resource.file_url && (
                <div className="relative flex aspect-video w-full items-center justify-center bg-muted">
                    <video
                        src={resource.file_url}
                        preload="metadata"
                        className="h-full w-full object-cover"
                    />
                    <PlayCircle className="absolute h-10 w-10 text-white drop-shadow" />
                </div>
            )}

            <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="truncate font-semibold">{resource.title}</span>
                </div>

                {resource.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                        {resource.description}
                    </p>
                )}

                {resource.file_name && !isImage && !isVideo && (
                    <span className="flex items-center gap-1.5 truncate rounded-lg bg-muted px-2.5 py-1.5 text-xs">
                        <Paperclip className="h-3 w-3 flex-shrink-0" />
                        {resource.file_name}
                    </span>
                )}

                {(resource.tags?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {resource.tags?.map((tag) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="px-1.5 py-0 text-[10px]"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {resource.code}
                    </span>
                    <span className="flex items-center gap-1">
                        {resource.is_public ? (
                            <Globe className="h-3 w-3" />
                        ) : (
                            <Lock className="h-3 w-3" />
                        )}
                        {resource.is_public ? 'Public' : 'Private'}
                    </span>
                    {resource.type === 'flashcard' && (
                        <span>{resource.card_count} cards</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
