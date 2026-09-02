"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, LogIn, UserPlus, ChevronDown } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  if (!user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link
          href="/login"
          className="flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/20 hover:text-[#ffeb3b]"
        >
          <LogIn className="size-3.5" />
          <span>Login</span>
        </Link>
        <Link
          href="/signup"
          className="hidden sm:flex items-center gap-1 rounded bg-[#ffeb3b] px-2.5 py-1 text-xs font-bold text-[#202020] transition-colors hover:bg-[#fff066]"
        >
          <UserPlus className="size-3.5" />
          <span>Sign Up</span>
        </Link>
      </div>
    );
  }

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full bg-white/10 py-1 pl-1 pr-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
      >
        <div className="flex size-6 items-center justify-center rounded-full bg-[#ffeb3b] text-[11px] font-bold text-[#202020]">
          {userInitial}
        </div>
        <span className="max-w-[90px] truncate hidden md:inline">
          {user.email?.split("@")[0]}
        </span>
        <ChevronDown className="size-3 opacity-80" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-52 rounded-lg border border-border bg-surface-container-high p-2 shadow-2xl text-xs z-50">
          <div className="border-b border-border/80 px-2 py-1.5 mb-1.5">
            <p className="font-semibold text-primary truncate">{user.email}</p>
            <span className="text-[10px] text-text-secondary">Free Plan Active</span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
