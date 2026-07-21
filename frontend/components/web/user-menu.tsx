'use client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LogOut, RefreshCw, Settings } from 'lucide-react';
import { getInitials } from '@/lib/utils';

type UserMenuProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    onSwitchAccount: () => void;
    onOpenSettings: () => void;
};

export function UserMenu({
    open,
    setOpen,
    onSwitchAccount,
    onOpenSettings,
}: UserMenuProps) {
    const { user, logout } = useAuth();

    if (!open || !user) return null;

    return (
        <Card className="absolute top-2 right-2 z-50 w-64 py-2 shadow-xl">
            <CardHeader className="flex flex-row items-center gap-3 px-3">
                <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs font-semibold">
                        {getInitials(user.username)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-semibold truncate">
                        {user.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                    </p>
                </div>
            </CardHeader>

            <Separator />

            <CardContent className="flex flex-col gap-1 px-2 pt-2">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                        setOpen(false);
                        onOpenSettings();
                    }}
                >
                    <Settings className="w-4 h-4" />
                    Settings
                </Button>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                        setOpen(false);
                        onSwitchAccount();
                    }}
                >
                    <RefreshCw className="w-4 h-4" />
                    Switch account
                </Button>
            </CardContent>

            <Separator />

            <CardFooter className="px-2 pt-2">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-red-500 hover:text-red-500"
                    onClick={async () => {
                        await logout();
                        setOpen(false);
                    }}
                >
                    <LogOut className="w-4 h-4" />
                    Log out
                </Button>
            </CardFooter>
        </Card>
    );
}
