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
    supabase.auth
      .getSession()
      .then(({ data }) =>
        setLoggedIn(!!data.session)
      );

    const { data: sub } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setLoggedIn(!!session);
        }
      );

    return () =>
      sub.subscription.unsubscribe();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 items-center justify-between gap-2 px-4 py-3">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-2"
        >
          <Image
            src="/icon-light.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 shrink-0 object-contain dark:hidden"
          />

          <Image
            src="/icon-dark.png"
            alt=""
            width={28}
            height={28}
            className="hidden h-7 w-7 shrink-0 object-contain dark:block"
          />

          <span className="whitespace-nowrap font-display text-lg font-semibold tracking-[-0.02em] sm:text-xl">
            Latmiyyah Vault
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm md:flex">
          <NavLink href="/search">
            Search
          </NavLink>

          <NavLink href="/explore">
            Explore
          </NavLink>

          <NavLink href="/favourites">
            Favourites
          </NavLink>

          <NavLink href="/submit">
            Add Submission
          </NavLink>

          <NavLink href="/about">
            About
          </NavLink>

          <NavLink href="/feedback">
            Feedback
          </NavLink>

          {loggedIn ? (
            <>
              <NavLink href="/dashboard">
                Creator Dashboard
              </NavLink>

              <button
                onClick={handleLogout}
                className="text-muted transition-colors hover:text-accent"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink href="/login">
              Creator Login
            </NavLink>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />

          <MobileMenu
            loggedIn={loggedIn}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-muted transition-colors hover:text-accent"
    >
      {children}
    </Link>
  );
}

function MobileMenu({
  loggedIn,
  onLogout,
}: {
  loggedIn: boolean;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        aria-label="Open menu"
        onClick={() =>
          setOpen((o) => !o)
        }
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-lg"
      >
        ☰
      </button>

      {open && (
        <div className="absolute right-4 top-16 z-50 w-52 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface p-2 shadow-xl">
          <MenuLink
            href="/search"
            onClick={() => setOpen(false)}
          >
            Search
          </MenuLink>

          <MenuLink
            href="/explore"
            onClick={() => setOpen(false)}
          >
            Explore
          </MenuLink>

          <MenuLink
            href="/favourites"
            onClick={() => setOpen(false)}
          >
            Favourites
          </MenuLink>

          <MenuLink
            href="/submit"
            onClick={() => setOpen(false)}
          >
            Add Submission
          </MenuLink>

          <MenuLink
            href="/about"
            onClick={() => setOpen(false)}
          >
            About
          </MenuLink>

          <MenuLink
            href="/feedback"
            onClick={() => setOpen(false)}
          >
            Feedback
          </MenuLink>

          <div className="my-1 border-t border-border" />

          {loggedIn ? (
            <>
              <MenuLink
                href="/dashboard"
                onClick={() =>
                  setOpen(false)
                }
              >
                Creator Dashboard
              </MenuLink>

              <button
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-bg hover:text-fg"
              >
                Logout
              </button>
            </>
          ) : (
            <MenuLink
              href="/login"
              onClick={() =>
                setOpen(false)
              }
            >
              Creator Login
            </MenuLink>
          )}
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-bg hover:text-fg"
    >
      {children}
    </Link>
  );
}