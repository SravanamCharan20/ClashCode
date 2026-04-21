"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "../app/auth/userContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, setUser } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost:9999/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    router.push("/auth/signin");
  };

  if (loading) return null;

  const navLinkClass = (href) =>
    `text-sm transition ${
      isActive(href) ? "text-black font-medium" : "text-gray-700 hover:text-black"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-gray-200 bg-white/90 shadow-sm backdrop-blur-xl"
          : "border-gray-100 bg-white/75 backdrop-blur-md"
      }`}
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-gray-900">
          Clash<span className="text-green-500/90">Code</span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 md:flex">
          <Link href="/" className={`${navLinkClass("/")} rounded-full px-3 py-1.5`}>
            Home
          </Link>
          <Link
            href="/dashboard"
            className={`${navLinkClass("/dashboard")} rounded-full px-3 py-1.5`}
          >
            Dashboard
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/rooms/createRoom"
              className={`${navLinkClass("/rooms/createRoom")} rounded-full px-3 py-1.5`}
            >
              Create Room
            </Link>
          )}
          <Link
            href="/rooms/joinRoom"
            className={`${navLinkClass("/rooms/joinRoom")} rounded-full px-3 py-1.5`}
          >
            Join Room
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/auth/signin" className="text-sm text-gray-700 hover:text-black transition">
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-900"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1.5 shadow-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-medium text-white">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[120px] truncate text-sm font-medium text-gray-800">
                {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full px-2 py-1 text-sm text-gray-600 transition hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
