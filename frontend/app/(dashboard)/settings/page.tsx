// app/(dashboard)/settings/page.tsx
'use client';
import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { getInitials, cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { uploadMedia, validatePostMedia } from '@/lib/uploads';
import { ModeToggle } from '@/components/web/theme-toggle';
import { Camera, Loader2, LogOut, Trash2, Check } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default function SettingsPage() {
    const { user, logout, refresh } = useAuth();
    const fileRef = useRef<HTMLInputElement>(null);

    const [username, setUsername] = useState(user?.username ?? '');
    const [avatar, setAvatar] = useState(user?.avatar ?? '');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    // the context fills in a tick after mount; adopt those values once they land
    const [seeded, setSeeded] = useState(false);
    if (user && !seeded) {
        setSeeded(true);
        setUsername(user.username);
        setAvatar(user.avatar ?? '');
    }

    if (!user) {
        return (
            <p className="text-sm text-muted-foreground">
                Sign in to manage your settings.
            </p>
        );
    }

    const pickAvatar = async (file?: File) => {
        if (!file) return;
        const problem = validatePostMedia(file);
        if (problem || !file.type.startsWith('image/')) {
            setError(problem ?? 'Pick an image file.');
            return;
        }
        setError(null);
        setUploading(true);
        try {
            const uploaded = await uploadMedia(file);
            setAvatar(uploaded.url);
            setSaved(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const save = async () => {
        setError(null);
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/me`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, avatar }),
            });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload?.message ?? 'Could not save');
            await refresh();
            setSaved(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const dirty = username !== user.username || avatar !== (user.avatar ?? '');

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 pb-16">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Your profile, as everyone else sees it.
                    </p>
                </div>

                <section className="flex flex-col gap-4">
                    <h2 className="text-base font-semibold">Profile picture</h2>

                    <div className="flex flex-wrap items-center gap-5">
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="group relative"
                        >
                            <Avatar className="h-24 w-24">
                                {avatar && (
                                    <AvatarImage src={avatar} alt={username} />
                                )}
                                <AvatarFallback className="text-2xl">
                                    {getInitials(username)}
                                </AvatarFallback>
                            </Avatar>
                            <span
                                className={cn(
                                    'absolute inset-0 flex items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100',
                                    uploading && 'opacity-100'
                                )}
                            >
                                {uploading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <Camera className="h-6 w-6" />
                                )}
                            </span>
                        </button>

                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-fit gap-2"
                                onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                            >
                                <Camera className="h-4 w-4" />
                                {avatar ? 'Change picture' : 'Upload a picture'}
                            </Button>

                            {avatar && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-fit gap-2 text-danger hover:text-danger"
                                    onClick={() => {
                                        setAvatar('');
                                        setSaved(false);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Remove, use initials
                                </Button>
                            )}

                            <p className="text-xs text-muted-foreground">
                                PNG, JPG, GIF or WEBP, up to 10MB.
                            </p>
                        </div>
                    </div>

                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/webp"
                        hidden
                        onChange={(e) => {
                            pickAvatar(e.target.files?.[0]);
                            e.target.value = '';
                        }}
                    />
                </section>

                <Separator />

                <section className="flex flex-col gap-4">
                    <h2 className="text-base font-semibold">Account</h2>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">Username</span>
                        <Input
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setSaved(false);
                            }}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium">Email</span>
                        <Input value={user.email} disabled />
                        <span className="text-xs text-muted-foreground">
                            Your email can&apos;t be changed here.
                        </span>
                    </label>
                </section>

                <Separator />

                <section className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                        <h2 className="text-base font-semibold">Appearance</h2>
                        <p className="text-sm text-muted-foreground">
                            Switch between light and dark.
                        </p>
                    </div>
                    <ModeToggle />
                </section>

                <Separator />

                {error && <p className="text-sm text-danger">{error}</p>}

                <div className="flex flex-wrap items-center gap-3">
                    <Button onClick={save} disabled={!dirty || saving || uploading}>
                        {saving ? 'Saving...' : 'Save changes'}
                    </Button>
                    {saved && !dirty && (
                        <span className="flex items-center gap-1.5 text-sm text-success">
                            <Check className="h-4 w-4" />
                            Saved
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        className="ml-auto gap-2 text-danger hover:text-danger"
                        onClick={() => logout()}
                    >
                        <LogOut className="h-4 w-4" />
                        Log out
                    </Button>
                </div>
            </div>
        </div>
    );
}
