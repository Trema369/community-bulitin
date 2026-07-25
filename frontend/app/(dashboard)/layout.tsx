'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TopBar, NavItem } from '@/components/web/topbar-logic';
import { Bot, Search, User, Menu, X } from 'lucide-react';
import { AuthCard } from '@/components/web/auth';
import { SearchDialog } from '@/components/web/search-dialog';
import { AiChat } from '@/components/web/ai-chat';
import { Sidebar } from '@/components/web/sidebar';
import { useAuth } from '@/lib/auth-context';
import { useBadges } from '@/lib/use-badges';
import { getInitials, cn } from '@/lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [navOpen, setNavOpen] = useState(false);
    const { user, loading } = useAuth();
    const badges = useBadges();

    const toggle = (key: string) => {
        if (key === 'search') {
            setSearchOpen(true);
            return;
        }
        // the avatar button is the way into settings
        if (key === 'user' && user) {
            router.push('/settings');
            return;
        }
        setActivePanel((prev) => (prev === key ? null : key));
    };

    const myLinks: NavItem[] = [
        { key: 'bot', icon: Bot },
        { key: 'search', label: 'Search', icon: Search },
        loading
            ? { key: 'user', icon: User }
            : user
                ? { key: 'user', avatarLabel: getInitials(user.username), avatarSrc: user.avatar }
                : { key: 'user', icon: User },
    ];

    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex h-screen w-full overflow-hidden">
                {/* Sidebar: fixed rail from lg up, slide-over drawer below it */}
                <div className="hidden lg:flex">
                    <Sidebar />
                </div>

                {navOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setNavOpen(false)}
                        />
                        <div className="absolute inset-y-0 left-0 shadow-2xl">
                            <Sidebar onNavigate={() => setNavOpen(false)} />
                        </div>
                        <button
                            onClick={() => setNavOpen(false)}
                            aria-label="Close menu"
                            className="absolute left-[268px] top-4 rounded-full bg-background p-2 shadow-lg"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center gap-1 p-2">
                        <button
                            onClick={() => setNavOpen(true)}
                            aria-label="Open menu"
                            className={cn(
                                'ml-2 flex-shrink-0 rounded-lg p-2 text-foreground hover:bg-accent lg:hidden'
                            )}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <TopBar
                            contents={myLinks}
                            activeKey={activePanel}
                            onSelectAction={toggle}
                            badges={badges}
                        />
                    </div>

                    <div className="relative flex-1 overflow-hidden p-4 sm:p-6">
                        {children}
                        {!user && (
                            <AuthCard
                                open={activePanel === 'user'}
                                setOpen={(next: boolean) =>
                                    setActivePanel(next ? 'user' : null)
                                }
                            />
                        )}
                    </div>
                </div>
            </div>

            <SearchDialog open={searchOpen} setOpen={setSearchOpen} />
            <AiChat
                open={activePanel === 'bot'}
                setOpen={(next) => setActivePanel(next ? 'bot' : null)}
            />
        </TooltipProvider>
    );
}
