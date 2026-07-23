'use client';
import { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TopBar, NavItem } from '@/components/web/topbar-logic';
import { Bot, Search, User } from 'lucide-react';
import { AuthCard } from '@/components/web/auth';
import { UserMenu } from '@/components/web/user-menu';
import { SearchDialog } from '@/components/web/search-dialog';
import { Sidebar } from '@/components/web/sidebar';
import { useAuth } from '@/lib/auth-context';
import { useBadges } from '@/lib/use-badges';
import { getInitials } from '@/lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
    const [activePanel, setActivePanel] = useState<string | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const { user, logout, loading } = useAuth();
    const badges = useBadges();

    const toggle = (key: string) => {
        if (key === 'search') {
            setSearchOpen(true);
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
                ? { key: 'user', avatarLabel: getInitials(user.username) }
                : { key: 'user', icon: User },
    ];

    const handleSwitchAccount = async () => {
        await logout();
        setActivePanel('user');
    };

    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex h-screen w-full overflow-hidden">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center p-2">
                        <TopBar
                            contents={myLinks}
                            activeKey={activePanel}
                            onSelectAction={toggle}
                            badges={badges}
                        />
                    </div>
                    <div className="flex-1 overflow-hidden p-6 text-white relative">
                        {children}
                        {user ? (
                            <UserMenu
                                open={activePanel === 'user'}
                                setOpen={(next) =>
                                    setActivePanel(next ? 'user' : null)
                                }
                                onSwitchAccount={handleSwitchAccount}
                                onOpenSettings={() =>
                                    setActivePanel('settings')
                                }
                            />
                        ) : (
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
        </TooltipProvider>
    );
}
