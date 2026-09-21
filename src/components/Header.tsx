"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
  href="/"
  className="flex items-center gap-2 text-lg font-semibold tracking-tight"
>
  <Image
    src="/icon-light.png"
    alt=""
    width={28}
    height={28}
    className="h-7 w-7 object-contain dark:hidden"
  />

  <Image
    src="/icon-dark.png"
    alt=""
    width={28}
    height={28}
    className="hidden h-7 w-7 object-contain dark:block"
  />

  <span>Latmiyyah Library</span>
</Link>

        <nav className="hidden items-center gap-5 text-sm md:flex">
          <Link href="/search" className="hover:text-accent">Search</Link>
          <Link href="/explore" className="hover:text-accent">Explore</Link>
          <Link href="/favourites" className="hover:text-accent">Favourites</Link>
          <Link href="/submit" className="hover:text-accent">Add Submission</Link>
          <Link href="/feedback" className="hover:text-accent">Feedback</Link>

          {loggedIn ? (
            <>
              <Link href="/dashboard" className="hover:text-accent">Creator Dashboard</Link>
              <button onClick={handleLogout} className="hover:text-accent">Logout</button>
            </>
          ) : (
            <Link href="/login" className="hover:text-accent">Creator Login</Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileMenu loggedIn={loggedIn} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ loggedIn, onLogout }: { loggedIn: boolean; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        aria-label="Open menu"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border border-border p-2"
      >
        ☰
      </button>
      {open && (
        <div className="absolute right-4 top-14 z-50 w-48 rounded-lg border border-border bg-surface p-2 shadow-lg">
          <MenuLink href="/search" onClick={() => setOpen(false)}>Search</MenuLink>
          <MenuLink href="/explore" onClick={() => setOpen(false)}>Explore</MenuLink>
          <MenuLink href="/favourites" onClick={() => setOpen(false)}>Favourites</MenuLink>
          <MenuLink href="/submit" onClick={() => setOpen(false)}>Add Submission</MenuLink>
          <MenuLink href="/feedback" onClick={() => setOpen(false)}>Feedback</MenuLink>

          {loggedIn ? (
            <>
              <MenuLink href="/dashboard" onClick={() => setOpen(false)}>Creator Dashboard</MenuLink>
              <button
                onClick={() => { setOpen(false); onLogout(); }}
                className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-bg"
              >
                Logout
              </button>
            </>
          ) : (
            <MenuLink href="/login" onClick={() => setOpen(false)}>Creator Login</MenuLink>
          )}
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block rounded px-3 py-2 text-sm hover:bg-bg">
      {children}
    </Link>
  );
}
