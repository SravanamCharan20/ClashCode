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
    <nav
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-white/70 shadow-lg border border-white/30"
          : "bg-white/40 backdrop-blur-md border border-black"
      } px-6 py-3 rounded-full flex items-center justify-between w-[92%] max-w-6xl gap-6`}
    >
      <div className="text-2xl font-semibold tracking-tight text-gray-900">
        <Link href="/">
          Clash<span className="text-green-500/90">Code</span>
        </Link>
      </div>

      <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white/60 px-4 py-2 shadow-sm">
        <Link href="/" className={navLinkClass("/")}>
          Home
        </Link>

        <Link
          href="/dashboard"
          className={navLinkClass("/dashboard")}
        >
          Dashboard
        </Link>

        {user?.role === "admin" && (
          <Link href="/rooms/createRoom" className={navLinkClass("/rooms/createRoom")}>
            Create Room
          </Link>
        )}

        <Link href="/rooms/joinRoom" className={navLinkClass("/rooms/joinRoom")}>
          Join Room
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {!user ? (
          <>
            <Link
              href="/auth/signin"
              className="text-sm text-gray-700 hover:text-black transition"
            >
              Sign in
            </Link>

            <Link
              href="/auth/signup"
              className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-gray-900"
            >
              Get Started
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-gray-200 shadow-sm">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-900 text-white text-xs font-medium">
              {user.username?.charAt(0).toUpperCase()}
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-800 font-medium">
              {user.username}
              {user.role === "admin" && (
                <span className="text-xs text-gray-400">(Admin)</span>
              )}
            </div>

            <div className="w-px h-4 bg-gray-200 mx-1" />

            <button
              onClick={handleLogout}
              className="text-sm cursor-pointer text-gray-700 hover:text-red-600 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
