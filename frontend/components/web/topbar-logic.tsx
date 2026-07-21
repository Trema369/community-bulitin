'use client';
import { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { ModeToggle } from './theme-toggle';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';
import type { Badge } from '@/lib/use-badges';

export type NavItem = {
    key: string;
    label?: string;
    icon?: LucideIcon;
    avatarLabel?: string;
};

type TopbarProps = {
    contents: Array<NavItem>;
    activeKey: string | null;
    onSelectAction: (key: string) => void;
    badges?: Array<Badge>;
};

const NavLink = ({
    item,
    isActive,
    onClick,
}: {
    item: NavItem;
    isActive: boolean;
    onClick: () => void;
}) => {
    const Icon = item.icon;

    // Avatar/initials button — stays ghost always, highlight lives on the circle
    if (item.avatarLabel) {
        return (
            <Button variant="ghost" onClick={onClick} className="p-1">
                <span
                    className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground transition-all',
                        isActive &&
                        'ring-2 ring-offset-2 ring-offset-background ring-primary'
                    )}
                >
                    {item.avatarLabel}
                </span>
                {item.label && (
                    <span className="text-sm font-medium">{item.label}</span>
                )}
            </Button>
        );
    }

    return (
        <Button variant={isActive ? 'secondary' : 'ghost'} onClick={onClick}>
            {Icon && <Icon className="w-4 h-4" />}
            {item.label && (
                <span className="text-sm font-medium">{item.label}</span>
            )}
        </Button>
    );
};

const BadgeBar = ({ badges }: { badges: Array<Badge> }) => {
    if (badges.length === 0) return null;

    return (
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800">
            {badges.map(({ badge }) => (
                <Tooltip key={badge.key}>
                    <TooltipTrigger asChild>
                        <div className="relative h-7 w-7 hover:scale-110 transition-transform cursor-default">
                            <Image
                                src={badge.image_path}
                                alt={badge.name}
                                fill
                                className="object-contain"
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p className="font-medium">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {badge.description}
                        </p>
                    </TooltipContent>
                </Tooltip>
            ))}
        </div>
    );
};

export const TopBar = ({
    contents,
    activeKey,
    onSelectAction,
    badges = [],
}: TopbarProps) => {
    const leftItems = contents.slice(0, 1);
    const rightItems = contents.slice(1);

    return (
        <nav className="flex items-center w-full gap-4 p-4 text-foreground">
            {/* Left zone */}
            <div className="flex items-center gap-6">
                {leftItems.map((item) => (
                    <NavLink
                        key={item.key}
                        item={item}
                        isActive={activeKey === item.key}
                        onClick={() => onSelectAction(item.key)}
                    />
                ))}
            </div>

            {/* Middle zone — earned badges */}
            <div className="flex flex-1 items-center justify-center">
                <BadgeBar badges={badges} />
            </div>

            {/* Right zone */}
            <div className="flex items-center gap-6">
                {rightItems.map((item) => (
                    <NavLink
                        key={item.key}
                        item={item}
                        isActive={activeKey === item.key}
                        onClick={() => onSelectAction(item.key)}
                    />
                ))}
                <ModeToggle />
            </div>
        </nav>
    );
};
