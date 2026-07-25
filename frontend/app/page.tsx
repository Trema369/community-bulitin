'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { motion, useScroll, useTransform } from 'motion/react';
import {
    Zap,
    Users,
    LibraryBig,
    MessageCircle,
    ArrowRight,
    Handshake,
    ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function FadeUp({
    children,
    delay = 0,
    className,
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

const features = [
    {
        icon: Users,
        title: 'Communities',
        desc: 'Create or join communities around shared interests, courses, or organizations.',
    },
    {
        icon: Zap,
        title: 'Alerts & Announcements',
        desc: 'Never miss a beat with priority notices, deadlines, and community-wide updates.',
    },
    {
        icon: LibraryBig,
        title: 'Shared Resources',
        desc: 'Upload, organize, and discover study materials, guides, and documents.',
    },
    {
        icon: MessageCircle,
        title: 'Conversations',
        desc: 'Discuss topics, ask questions, and vote on the most helpful answers.',
    },
    {
        icon: Handshake,
        title: 'Explore & Connect',
        desc: 'Discover trending topics, new communities, and people to follow.',
    },
];

export default function LandingPage() {
    const { scrollYProgress } = useScroll();
    const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.96]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    return (
        <div className="relative min-h-screen bg-background text-foreground">
            {/* --------- floating nav --------- */}
            <motion.header
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-lg bg-background/70 border-b border-border/50"
            >
                <Link href="/" className="flex items-center gap-2.5">
                    <Image
                        src="/dailybulletinv4gy.svg"
                        alt="Bulittin"
                        width={512}
                        height={512}
                        className="h-9 w-9"
                        priority
                    />
                    <span className="text-xl font-extrabold tracking-tight">
                        Bulittin
                    </span>
                </Link>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/home">Sign in</Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href="/home">
                            Get started
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </div>
            </motion.header>

            {/* --------- hero --------- */}
            <motion.section
                style={{ scale: heroScale, opacity: heroOpacity }}
                className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center"
            >
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                    <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[520px] w-[520px] rounded-full bg-primary/10 blur-[120px]" />
                </div>

                <FadeUp>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm mb-8">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        Your community, one hub
                    </div>
                </FadeUp>

                <FadeUp delay={0.08}>
                    <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
                        Everything your{' '}
                        <span className="text-primary">community</span> needs,{' '}
                        <br className="hidden sm:block" />
                        in one place
                    </h1>
                </FadeUp>

                <FadeUp delay={0.16}>
                    <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
                        Bulittin brings together discussions, resources, alerts,
                        and real-time chat so your group stays connected and
                        organized — no scattered tools, no noise.
                    </p>
                </FadeUp>

                <FadeUp delay={0.24}>
                    <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                        <Button size="lg" asChild className="text-base px-8">
                            <Link href="/home">
                                Enter Bulittin
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            asChild
                            className="text-base px-8"
                        >
                            <Link href="#features">Learn more</Link>
                        </Button>
                    </div>
                </FadeUp>

                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: 'easeInOut',
                    }}
                    className="absolute bottom-10 text-muted-foreground/50"
                >
                    <ChevronDown className="h-6 w-6" />
                </motion.div>
            </motion.section>

            {/* --------- features --------- */}
            <section
                id="features"
                className="relative z-10 mx-auto max-w-6xl px-6 py-24"
            >
                <FadeUp>
                    <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Built for communities that{' '}
                        <span className="text-primary">care</span>
                    </h2>
                    <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
                        Whether it&apos;s a campus club, study group, or
                        neighborhood — Bulittin gives you the tools to stay in
                        sync.
                    </p>
                </FadeUp>

                <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((f, i) => (
                        <FadeUp key={f.title} delay={i * 0.07}>
                            <div
                                className={cn(
                                    'group relative rounded-2xl border border-border p-6',
                                    'transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/5'
                                )}
                            >
                                <f.icon className="mb-4 h-5 w-5 text-primary" />
                                <h3 className="text-lg font-bold">
                                    {f.title}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                    {f.desc}
                                </p>
                            </div>
                        </FadeUp>
                    ))}
                </div>
            </section>

            {/* --------- QR code --------- */}
            <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
                <div className="flex flex-col items-center gap-10 md:flex-row md:justify-center md:gap-20">
                    <FadeUp className="text-center md:text-left">
                        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                            Take it with you
                        </h2>
                        <p className="mt-3 max-w-md text-muted-foreground">
                            Scan the QR code with your phone to jump straight
                            into Bulittin. Works on any device — no app download
                            required.
                        </p>
                    </FadeUp>

                    <FadeUp delay={0.12}>
                        <div className="flex flex-col items-center gap-3">
                            <div className="rounded-2xl border border-border bg-white p-5">
                                {mounted && (
                                    <QRCodeSVG
                                        value="https://daily.tremaz.dev/home"
                                        size={180}
                                        bgColor="transparent"
                                        fgColor="#1a1a1a"
                                        level="M"
                                        imageSettings={{
                                            src: '/dailybulletinv4gy.svg',
                                            height: 36,
                                            width: 36,
                                            excavate: true,
                                        }}
                                    />
                                )}
                            </div>
                            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                Scan to open
                            </span>
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* --------- CTA --------- */}
            <section className="relative z-10 py-24 px-6">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                    <div className="absolute left-1/2 bottom-0 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-primary/8 blur-[100px]" />
                </div>

                <FadeUp className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Ready to get started?
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Join your community on Bulittin today — it only takes a
                        few seconds.
                    </p>
                    <Button size="lg" className="mt-8 text-base px-10" asChild>
                        <Link href="/home">
                            Get started free
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </FadeUp>
            </section>

            {/* --------- footer --------- */}
            <footer className="border-t border-border py-8 px-6">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/dailybulletinv4gy.svg"
                            alt="Bulittin"
                            width={512}
                            height={512}
                            className="h-6 w-6"
                        />
                        <span className="text-sm font-bold">Bulittin</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Made by Tadiwanashe Mazenge, Masimba Chivasa, Taida Chinamo & Smith
                    </p>
                </div>
            </footer>
        </div>
    );
}
