"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "ホーム" },
  { href: "/quiz", label: "クイズ" },
  { href: "/guide", label: "使い方" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="text-lg font-bold tracking-wide text-slate-900"
        >
          Translaticia
        </Link>
        <nav className="flex items-center gap-2">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:px-6 lg:px-10">
        <p>© {new Date().getFullYear()} Translaticia. All rights reserved.</p>
        <a
          href="https://github.com/user/repo/issues"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-slate-900 hover:text-slate-700"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
