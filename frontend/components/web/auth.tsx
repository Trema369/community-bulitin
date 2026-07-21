'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

interface AuthCardProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function AuthCard({ open, setOpen }: AuthCardProps) {
    const { signin, signup } = useAuth();
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleSignIn() {
        setLoading(true);
        setError('');
        try {
            await signin(username, password);
            setOpen(false);
            router.push('/home');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSignUp() {
        setLoading(true);
        setError('');
        try {
            await signup(username, email, password);
            setOpen(false);
            router.push('/home');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    const submit = () => {
        if (mode === 'signin') void handleSignIn();
        else void handleSignUp();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogOverlay className="fixed inset-0 bg-black/30 backdrop-blur-md" />
            <DialogContent className="sm:max-w-md p-6 space-y-4">
                <DialogHeader className="relative text-center">
                    <div className="mx-auto mb-2">
                        <Image
                            src="/dailybulletinv4gy.svg"
                            alt="StudyHive icon"
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-md"
                            priority
                        />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Log in or Sign up
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-2 text-center">
                        Access the latest news and resources in the community
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="flex gap-2">
                    <Button
                        className="flex-1"
                        variant={mode === 'signin' ? 'default' : 'outline'}
                        onClick={() => setMode('signin')}
                        disabled={loading}
                    >
                        Sign In
                    </Button>
                    <Button
                        className="flex-1"
                        variant={mode === 'signup' ? 'default' : 'outline'}
                        onClick={() => setMode('signup')}
                        disabled={loading}
                    >
                        Sign Up
                    </Button>
                </div>

                <Input
                    className="w-full h-12"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') submit();
                    }}
                />
                {mode === 'signup' && (
                    <Input
                        className="w-full h-12"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') submit();
                        }}
                    />
                )}
                <Input
                    className="w-full h-12"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') submit();
                    }}
                />

                <Button
                    className="w-full h-12"
                    onClick={submit}
                    disabled={loading}
                >
                    {loading
                        ? 'Please wait...'
                        : mode === 'signin'
                            ? 'Sign In'
                            : 'Sign Up'}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
