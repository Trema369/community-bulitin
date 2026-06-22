'use client';

import * as React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from '@/components/ui/sidebar';

export type NavItem = {
    label?: string;
    isSection?: boolean;
    title?: string;
    icon?: LucideIcon;
    href?: string;
    children?: NavItem[];
};

export function NavMain({ items }: { items: NavItem[] }) {
    const [activeParent, setActiveParent] = React.useState<string | null>(
        items.find((i) => !i.isSection)?.title || null
    );
    const [activeChild, setActiveChild] = React.useState<string | null>(null);

    return (
        <>
            {items.map((item, index) => (
                <NavMainItem
                    key={item.title || item.label || index}
                    item={item}
                    activeParent={activeParent}
                    setActiveParent={setActiveParent}
                    activeChild={activeChild}
                    setActiveChild={setActiveChild}
                />
            ))}
        </>
    );
}

function NavMainItem({
    item,
    activeParent,
    setActiveParent,
    activeChild,
    setActiveChild,
}: {
    item: NavItem;
    activeParent: string | null;
    setActiveParent: (val: string | null) => void;
    activeChild: string | null;
    setActiveChild: (val: string | null) => void;
}) {
    const hasChildren = item.children && item.children.length > 0;
    const isParentActive = activeParent === item.title;

    const [isOpen, setIsOpen] = React.useState(isParentActive);
    const [prevIsParentActive, setPrevIsParentActive] =
        React.useState(isParentActive);

    if (isParentActive !== prevIsParentActive) {
        setPrevIsParentActive(isParentActive);
        if (isParentActive) {
            setIsOpen(true);
        }
    }

    if (item.isSection && item.label) {
        return (
            <SidebarGroup className="p-0 pt-5 first:pt-0">
                <SidebarGroupLabel className="p-0 text-xs font-medium uppercase text-sidebar-foreground">
                    {item.label}
                </SidebarGroupLabel>
            </SidebarGroup>
        );
    }

    if (hasChildren && item.title) {
        return (
            <SidebarGroup className="p-0">
                <SidebarMenu>
                    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                        <SidebarMenuItem>
                            {/* Fix: Replaced 'render' with 'asChild' */}
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton
                                    id={`nav-main-trigger-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                                    tooltip={item.title}
                                    isActive={isParentActive}
                                    onClick={() => setActiveParent(item.title!)}
                                    className={cn(
                                        'rounded-md text-sm font-medium px-3 py-2 h-9 transition-colors cursor-pointer w-full',
                                        isParentActive
                                            ? 'bg-primary! text-primary-foreground!'
                                            : ''
                                    )}
                                >
                                    {item.icon && <item.icon size={16} />}
                                    <span>{item.title}</span>
                                    <ChevronRight
                                        className={cn(
                                            'ml-auto transition-transform duration-200',
                                            isOpen && 'rotate-90'
                                        )}
                                    />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub className="me-0 pe-0">
                                    {item.children!.map((child, index) => (
                                        <NavMainSubItem
                                            key={child.title || index}
                                            item={child}
                                            activeParent={activeParent}
                                            setActiveParent={setActiveParent}
                                            activeChild={activeChild}
                                            setActiveChild={setActiveChild}
                                            parentTitle={item.title}
                                        />
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                </SidebarMenu>
            </SidebarGroup>
        );
    }

    if (item.title) {
        return (
            <SidebarGroup className="p-0">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            id={`nav-main-button-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                            tooltip={item.title}
                            isActive={isParentActive}
                            onClick={() => {
                                setActiveParent(item.title!);
                                setActiveChild(null);
                            }}
                            className={cn(
                                'rounded-md text-sm font-medium px-3 py-2 h-9 transition-colors cursor-pointer',
                                isParentActive
                                    ? 'bg-primary! text-primary-foreground!'
                                    : ''
                            )}
                            asChild
                        >
                            <a href={item.href}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        );
    }

    return null;
}

function NavMainSubItem({
    item,
    activeParent,
    setActiveParent,
    activeChild,
    setActiveChild,
    parentTitle,
}: {
    item: NavItem;
    activeParent: string | null;
    setActiveParent: (val: string | null) => void;
    activeChild: string | null;
    setActiveChild: (val: string | null) => void;
    parentTitle?: string;
}) {
    if (item.title) {
        return (
            <SidebarMenuSubItem className="w-full">
                {/* Fix: Replaced 'render' with 'asChild' */}
                <SidebarMenuSubButton
                    id={`nav-sub-button-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className={cn(
                        'w-full rounded-md transition-colors',
                        activeChild === item.title
                            ? 'bg-muted! text-foreground!'
                            : ''
                    )}
                    isActive={activeChild === item.title}
                    onClick={() => {
                        setActiveParent(parentTitle || '');
                        setActiveChild(item.title!);
                    }}
                    asChild
                >
                    <a href={item.href}>{item.title}</a>
                </SidebarMenuSubButton>
            </SidebarMenuSubItem>
        );
    }
    return null;
}
