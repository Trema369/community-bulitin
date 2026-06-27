import { SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppSidebar } from '../../components/web/navbar';
import { TopBar } from '@/components/web/topbar-logic';
import {
    Bot,
    Search,
    Settings,
    User
} from "lucide-react"

const myLinks = [
    //far right
    { icon: Bot },

    //far right
    { label: "Search", icon: Search },
    { icon: Settings },
    { icon: User }
];
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <TooltipProvider delayDuration={0}>
            {' '}
            <SidebarProvider>
                <AppSidebar />
                <main className="flex flex-col w-full min-h-screen">
                    <div className="flex items-center p-2">
                        <SidebarTrigger className="text-white" />
                        <TopBar contents={myLinks} />
                    </div>

                    <div className="flex-1 p-6 text-white">
                        {children}
                    </div>
                </main>
            </SidebarProvider>
        </TooltipProvider>
    );
}
