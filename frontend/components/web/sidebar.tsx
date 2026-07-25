'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import {
    Home,
    BookOpen,
    ChevronsLeft,
    ChevronsRight,
    MessageCircle,
    Zap,
    LibraryBig,
    Handshake,
    Users,
    Hash,
} from 'lucide-react';
import { useCommunities } from '@/lib/use-communities';

const navItems = [
    { label: 'Home', href: '/home', icon: Home },
    { label: 'Alerts & Announcements', href: '/alerts', icon: Zap },
    { label: 'Explore', href: '/explore', icon: Handshake },
    { label: 'Resources', href: '/resources', icon: LibraryBig },
    { label: 'Advertisements', href: '/advertisements', icon: BookOpen },
    { label: 'Messages', href: '/chats', icon: MessageCircle },
    { label: 'Following', href: '/following', icon: Users },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { communities } = useCommunities();
    const joined = communities.filter((c) => c.is_member);

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    'relative flex h-screen flex-col',
                    'bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-md',
                    'border-r border-border',
                    'shadow-2xl transition-all duration-300 ease-in-out',
                    'pt-3',
                    collapsed ? 'w-[72px]' : 'w-[260px]'
                )}
            >
                <Link
                    href="/home"
                    onClick={onNavigate}
                    className="flex h-[76px] flex-shrink-0 items-center gap-3 overflow-hidden px-4"
                >
                    {/* the source svg is square — sizing it square stops the mark
                        looking squashed */}
                    <Image
                        src="/dailybulletinv4gy.svg"
                        alt="Bulittin"
                        width={512}
                        height={512}
                        className="h-12 w-12 flex-shrink-0"
                        priority
                    />

                    <span
                        className={cn(
                            'flex flex-col leading-none transition-all duration-200',
                            collapsed ? 'w-0 opacity-0' : 'opacity-100'
                        )}
                    >
                        <span className="whitespace-nowrap text-2xl font-extrabold tracking-tight text-foreground">
                            Bulittin
                        </span>
                        <span className="mt-1 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            Community hub
                        </span>
                    </span>
                </Link>

                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-2 pt-8">
                    {navItems.map(({ label, href, icon: Icon }) => {
                        const isActive = pathname === href;

                        const btn = (
                            <Button
                                key={label}
                                variant={isActive ? 'secondary' : 'ghost'}
                                asChild
                                className={cn(
                                    'w-full justify-start gap-3 px-3 mb-4 h-13',
                                    collapsed && 'justify-center px-0',
                                    isActive &&
                                    'font-semibold text-primary shadow-sm'
                                )}
                            >
                                <Link href={href} onClick={onNavigate}>
                                    <Icon
                                        className={cn(
                                            'h-[18px] w-[18px] flex-shrink-0',
                                            isActive
                                                ? 'text-primary'
                                                : 'text-muted-foreground'
                                        )}
                                    />
                                    {!collapsed && <span>{label}</span>}
                                </Link>
                            </Button>
                        );

                        return collapsed ? (
                            <Tooltip key={label}>
                                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                                <TooltipContent side="right">
                                    {label}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            btn
                        );
                    })}

                    {/* Joined communities */}
                    {joined.length > 0 && (
                        <>
                            <Separator className="my-2" />
                            {!collapsed && (
                                <p className="px-3 pb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                    Your communities
                                </p>
                            )}
                            {joined.map((community) => {
                                const href = `/c/${community.name}`;
                                const isActive = pathname === href;

                                const btn = (
                                    <Button
                                        key={community.id}
                                        variant={
                                            isActive ? 'secondary' : 'ghost'
                                        }
                                        asChild
                                        className={cn(
                                            'w-full justify-start gap-3 px-3 mb-2 h-10',
                                            collapsed && 'justify-center px-0',
                                            isActive &&
                                            'font-semibold text-primary'
                                        )}
                                    >
                                        <Link href={href} onClick={onNavigate}>
                                            <Hash
                                                className={cn(
                                                    'h-4 w-4 flex-shrink-0',
                                                    isActive
                                                        ? 'text-primary'
                                                        : 'text-muted-foreground'
                                                )}
                                            />
                                            {!collapsed && (
                                                <span className="truncate text-sm">
                                                    {community.name}
                                                </span>
                                            )}
                                        </Link>
                                    </Button>
                                );

                                return collapsed ? (
                                    <Tooltip key={community.id}>
                                        <TooltipTrigger asChild>
                                            {btn}
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            {community.name}
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    btn
                                );
                            })}
                        </>
                    )}
                </nav>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3.5 top-1/2 z-20 h-7 w-7 -translate-y-1/2 rounded-full shadow-md"
                    aria-label="Toggle sidebar"
                >
                    {collapsed ? (
                        <ChevronsRight className="h-3.5 w-3.5" />
                    ) : (
                        <ChevronsLeft className="h-3.5 w-3.5" />
                    )}
                </Button>
            </aside>
        </TooltipProvider>
    );
}
