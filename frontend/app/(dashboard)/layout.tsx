import { SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppSidebar } from '../../components/web/navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <TooltipProvider delayDuration={0}>
            {' '}
            {/* <-- Wrap everything here */}
            <SidebarProvider>
                <AppSidebar />
                <main>
                    <SidebarTrigger />
                    {children}
                </main>
            </SidebarProvider>
        </TooltipProvider>
    );
}
