"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "../app/auth/userContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, setUser } = useUser();

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
  };

  if (loading) return null;

  return (
    <nav
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-white/70 shadow-lg border border-white/30"
          : "bg-white/40 backdrop-blur-md border border-black"
      } px-10 py-3 rounded-full flex items-center gap-10`}
    >
      {/* Logo */}
      <div className="text-2xl font-semibold tracking-tight text-gray-900 cursor-pointer">
        <Link href="/">
          Clash<span className="text-green-500/90">Code</span>
        </Link>
      </div>

      <Link href="/dashboard">Dashboard</Link>

      <div className="border rounded-xl">
        {user?.role === "admin" && (
          <Link href="/rooms/createRoom">Create Room</Link>
        )}

        <Link href="/rooms/joinRoom">Join Room</Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {!user ? (
          <>
            <Link
              href="/auth/signin"
              className="hidden md:block text-sm text-gray-700 hover:text-black transition"
            >
              Sign in
            </Link>

            <button className="relative px-5 py-2 text-sm font-medium text-white rounded-full overflow-hidden group">
              <span className="absolute inset-0 bg-gradient-to-r from-black via-gray-800 to-black opacity-90 group-hover:opacity-100 transition"></span>
              <span className="absolute inset-0 blur-md bg-gradient-to-r from-gray-700 to-black opacity-50 group-hover:opacity-80 transition"></span>
              <Link href="/auth/signup">
                <span className="relative z-10">Get Started</span>
              </Link>
            </button>
          </>
        ) : (
          <>
            {/* User Pill */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-gray-200 shadow-sm">
              {/* Avatar */}
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-900 text-white text-xs font-medium">
                {user.username?.charAt(0).toUpperCase()}
              </div>

              {/* Name + Role */}
              <div className="flex items-center gap-1 text-sm text-gray-800 font-medium">
                {user.username}
                {user.role === "admin" && (
                  <span className="text-xs text-gray-400">(Admin)</span>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-4 bg-gray-200 mx-1" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-700 cursor-pointer hover:text-red-600 transition"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
