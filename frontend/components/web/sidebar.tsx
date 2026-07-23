'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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
} from 'lucide-react';
const navItems = [
    { label: 'Home', href: '/home', icon: Home },
    { label: 'Trending', href: '/trending', icon: Zap },
    { label: 'Explore', href: '/explore', icon: Handshake },
    { label: 'Resources', href: '/notes', icon: LibraryBig },
    { label: 'History', href: '/resources', icon: BookOpen },
    { label: 'Messages', href: '/chats', icon: MessageCircle },
    { label: 'Following', href: '/chats', icon: Users },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    'relative flex h-screen flex-col',
                    'bg-background/80 backdrop-blur-md',
                    'border-r border-border',
                    'shadow-xl transition-all duration-300 ease-in-out',
                    'pt-3',
                    collapsed ? 'w-[68px]' : 'w-[220px]'
                )}
            >
                <div className="flex h-[64px] items-center gap-3 overflow-hidden px-4 flex-shrink-0">
                    <Image
                        src="/dailybulletinv4gy.svg"
                        alt="StudyHive icon"
                        width={800}
                        height={200}
                        className="h-10 w-14 flex-shrink-0 rounded-md"
                        priority
                    />

                    <h1
                        className={cn(
                            'text-2xl font-extrabold tracking-tight transition-all duration-200 whitespace-nowrap',
                            collapsed ? 'opacity-0 w-0' : 'opacity-100'
                        )}
                    >
                        <span className="text-[#969696] dark:text-[#969696]">
                            Bulittin
                        </span>
                    </h1>
                </div>

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
                                    isActive && 'font-semibold text-primary'
                                )}
                            >
                                <Link href={href}>
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
