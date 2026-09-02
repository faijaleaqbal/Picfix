'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from './button';
import { createClient } from '@/lib/supabase/client';

import {
	AtSignIcon,
	ChevronLeftIcon,
	Layers,
	Lock,
	Eye,
	EyeOff,
	Loader2,
	AlertCircle,
	CheckCircle2
} from 'lucide-react';
import { Input } from './input';

interface AuthPageProps {
	mode?: 'login' | 'signup';
}

export function AuthPage({ mode = 'login' }: AuthPageProps) {
	const router = useRouter();
	const [isLogin, setIsLogin] = useState(mode === 'login');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [signupSuccess, setSignupSuccess] = useState(false);

	const supabase = createClient();

	const handleAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMsg(null);

		if (!isLogin) {
			if (password !== confirmPassword) {
				setErrorMsg("Passwords do not match.");
				return;
			}
			if (password.length < 6) {
				setErrorMsg("Password must be at least 6 characters long.");
				return;
			}
		}

		setLoading(true);

		try {
			if (isLogin) {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password,
				});
				if (error) {
					setErrorMsg(error.message);
				} else {
					router.push('/');
					router.refresh();
				}
			} else {
				const { data, error } = await supabase.auth.signUp({
					email,
					password,
					options: {
						emailRedirectTo: `${window.location.origin}/auth/callback`,
					},
				});

				if (error) {
					setErrorMsg(error.message);
				} else if (data.session) {
					router.push('/');
					router.refresh();
				} else {
					setSignupSuccess(true);
				}
			}
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
			setErrorMsg(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="relative min-h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
			{/* Left Branding & Animated Visual Column */}
			<div className="bg-[#1b223c] text-white relative hidden h-full flex-col border-r border-border/20 p-10 lg:flex">
				<div className="from-[#141a2e] absolute inset-0 z-10 bg-gradient-to-t to-transparent opacity-90" />
				<div className="z-10 flex items-center gap-2">
					<div className="flex size-9 items-center justify-center rounded-xl bg-[#4956a5] text-[#ffeb3b] shadow-lg">
						<Layers className="size-5" />
					</div>
					<div className="flex items-baseline gap-1.5">
						<span className="text-xl font-extrabold tracking-tight text-white">PICFIX</span>
						<span className="text-xs font-bold uppercase tracking-wider text-[#ffeb3b]">SUITE</span>
					</div>
				</div>
				<div className="z-10 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-lg text-slate-200 font-medium">
							&ldquo;High-speed image compression, PDF editing, and bulk processing tools right in your browser.&rdquo;
						</p>
						<footer className="font-mono text-xs text-slate-400 font-semibold">
							~ Fast, Private & Free Image Processing
						</footer>
					</blockquote>
				</div>
				<div className="absolute inset-0 overflow-hidden">
					<FloatingPaths position={1} />
					<FloatingPaths position={-1} />
				</div>
			</div>

			{/* Right Interactive Auth Form */}
			<div className="relative flex min-h-screen flex-col justify-center p-4 sm:p-8 bg-surface">
				<div
					aria-hidden
					className="absolute inset-0 isolate contain-strict -z-10 opacity-40 pointer-events-none"
				>
					<div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full" />
				</div>

				<Button variant="ghost" className="absolute top-6 left-6" asChild>
					<Link href="/">
						<ChevronLeftIcon className='size-4 me-2' />
						Home
					</Link>
				</Button>

				<div className="mx-auto w-full max-w-sm space-y-6">
					<div className="flex items-center gap-2 lg:hidden">
						<div className="flex size-8 items-center justify-center rounded-lg bg-[#4956a5] text-[#ffeb3b]">
							<Layers className="size-4" />
						</div>
						<p className="text-xl font-bold tracking-tight text-primary">Picfix</p>
					</div>

					<div className="flex flex-col space-y-1.5">
						<h1 className="text-2xl font-bold tracking-tight text-primary">
							{isLogin ? "Sign In to Picfix" : "Create your account"}
						</h1>
						<p className="text-text-secondary text-xs sm:text-sm">
							{isLogin 
								? "Enter your credentials to access your account." 
								: "Join Picfix to manage your custom image presets."}
						</p>
					</div>

					{signupSuccess ? (
						<div className="space-y-4 text-center rounded-2xl border border-border bg-surface-container-low p-6 shadow-sm">
							<div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-green-500/15 text-green-400">
								<CheckCircle2 className="size-6" />
							</div>
							<div className="space-y-1">
								<h3 className="text-base font-bold text-primary">
									Check your email inbox
								</h3>
								<p className="text-xs text-text-secondary leading-relaxed">
									We sent a verification link to <span className="font-semibold text-primary">{email}</span>. Click the link to complete registration.
								</p>
							</div>
							<Button
								type="button"
								variant="outline"
								className="w-full text-xs"
								onClick={() => {
									setSignupSuccess(false);
									setIsLogin(true);
								}}
							>
								Back to Sign In
							</Button>
						</div>
					) : (
						<>
							{errorMsg && (
								<div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
									<AlertCircle className="size-4 shrink-0" />
									<span>{errorMsg}</span>
								</div>
							)}

							<form onSubmit={handleAuth} className="space-y-4">
								<div className="space-y-1.5">
									<label className="text-xs font-semibold text-text-secondary">
										Email Address
									</label>
									<div className="relative">
										<Input
											placeholder="your.email@example.com"
											className="peer ps-9 text-xs"
											type="email"
											required
											value={email}
											onChange={(e) => setEmail(e.target.value)}
										/>
										<div className="text-text-secondary pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3">
											<AtSignIcon className="size-4" aria-hidden="true" />
										</div>
									</div>
								</div>

								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<label className="text-xs font-semibold text-text-secondary">
											Password
										</label>
										{isLogin && (
											<Link
												href="/auth/reset-password"
												className="text-[11px] font-medium text-accent-lavender hover:underline"
											>
												Forgot password?
											</Link>
										)}
									</div>
									<div className="relative">
										<Input
											placeholder="••••••••"
											className="ps-9 pe-9 text-xs"
											type={showPassword ? "text" : "password"}
											required
											minLength={6}
											value={password}
											onChange={(e) => setPassword(e.target.value)}
										/>
										<div className="text-text-secondary pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3">
											<Lock className="size-4" aria-hidden="true" />
										</div>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
											aria-label={showPassword ? "Hide password" : "Show password"}
										>
											{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
										</button>
									</div>
								</div>

								{!isLogin && (
									<div className="space-y-1.5">
										<label className="text-xs font-semibold text-text-secondary">
											Confirm Password
										</label>
										<div className="relative">
											<Input
												placeholder="••••••••"
												className="ps-9 text-xs"
												type={showPassword ? "text" : "password"}
												required
												minLength={6}
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
											/>
											<div className="text-text-secondary pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3">
												<Lock className="size-4" aria-hidden="true" />
											</div>
										</div>
									</div>
								)}

								<Button
									type="submit"
									disabled={loading}
									className="w-full text-xs font-bold"
									size="lg"
								>
									{loading ? (
										<span className="flex items-center gap-2">
											<Loader2 className="size-4 animate-spin" />
											<span>Processing...</span>
										</span>
									) : (
										<span>{isLogin ? "Sign In With Email" : "Create Account"}</span>
									)}
								</Button>
							</form>

							<div className="pt-2 text-center text-xs text-text-secondary">
								{isLogin ? (
									<span>
										Don&apos;t have an account?{' '}
										<button
											type="button"
											onClick={() => {
												setIsLogin(false);
												setErrorMsg(null);
											}}
											className="font-semibold text-accent-lavender hover:underline"
										>
											Sign up
										</button>
									</span>
								) : (
									<span>
										Already have an account?{' '}
										<button
											type="button"
											onClick={() => {
												setIsLogin(true);
												setErrorMsg(null);
											}}
											className="font-semibold text-accent-lavender hover:underline"
										>
											Sign in
										</button>
									</span>
								)}
							</div>

							<p className="text-text-secondary pt-4 text-center text-[11px] leading-relaxed">
								By continuing, you agree to our{' '}
								<Link href="#" className="hover:text-primary underline underline-offset-4">
									Terms of Service
								</Link>{' '}
								and{' '}
								<Link href="#" className="hover:text-primary underline underline-offset-4">
									Privacy Policy
								</Link>
								.
							</p>
						</>
					)}
				</div>
			</div>
		</main>
	);
}

function FloatingPaths({ position }: { position: number }) {
	const paths = Array.from({ length: 36 }, (_, i) => ({
		id: i,
		d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
			380 - i * 5 * position
		} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
			152 - i * 5 * position
		} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
			684 - i * 5 * position
		} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
		color: `rgba(255,255,255,${0.08 + i * 0.02})`,
		width: 0.5 + i * 0.03,
	}));

	return (
		<div className="pointer-events-none absolute inset-0">
			<svg
				className="h-full w-full text-white/30"
				viewBox="0 0 696 316"
				fill="none"
			>
				<title>Background Paths</title>
				{paths.map((path, idx) => (
					<motion.path
						key={path.id}
						d={path.d}
						stroke="currentColor"
						strokeWidth={path.width}
						strokeOpacity={0.08 + path.id * 0.02}
						initial={{ pathLength: 0.3, opacity: 0.6 }}
						animate={{
							pathLength: 1,
							opacity: [0.2, 0.5, 0.2],
							pathOffset: [0, 1, 0],
						}}
						transition={{
							duration: 20 + (idx % 5) * 2,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'linear',
						}}
					/>
				))}
			</svg>
		</div>
	);
}
