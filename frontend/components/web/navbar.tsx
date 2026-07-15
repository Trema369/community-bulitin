'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NavItem, NavMain } from '@/components/web/navbar-main';
import {
    Home,
    Zap,
    MessageCircle,
    BriefcaseBusiness,
    LibraryBig,
    Handshake,
    Users,
    ClipboardClock,
} from 'lucide-react';
export const navData: NavItem[] = [
    // Dashboards Section
    { title: 'Home', icon: Home, href: '#' },
    { title: 'Trending', icon: Zap, href: '#' },
    { title: 'Advertisment', icon: BriefcaseBusiness, href: '#' },
    { title: 'Resources', icon: LibraryBig, href: '#' },

    // Pages Section
    { label: 'Pages', isSection: true },
    { title: 'History', icon: ClipboardClock, href: '#' },
    { title: 'Messages', icon: MessageCircle, href: '#' },
    { title: 'Following', icon: Users, href: '#' },
    {
        title: 'Colonies',
        icon: Handshake,
        children: [
            { title: 'Zim Bhalis', href: '#' },
            { title: 'ZimCelebs', href: '#' },
            { title: 'A Level', href: '#' },
            { title: 'Youths', href: '#' },
        ],
    },
];
export function AppSidebar() {
    return (
        <Sidebar variant="sidebar" className=" h-full">
            <div className="flex flex-col gap-6 overflow-hidden h-full">
                {/* Logo */}
                <SidebarHeader className="px-4">
                    <div className="flex items-center gap-3 py-2">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                            C
                        </div>
                        <div className="flex flex-col gap-0.5 leading-none">
                            <span className="font-semibold text-sm">
                                Community Bulitin
                            </span>
                        </div>
                    </div>
                </SidebarHeader>

                {/* Main Navigation links Area */}
                <SidebarContent className="overflow-hidden flex-1">
                    <ScrollArea className="h-full">
                        <div className="px-4">
                            <NavMain items={navData} />
                        </div>
                    </ScrollArea>
                </SidebarContent>
            </div>
        </Sidebar>
    );
}
