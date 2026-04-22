"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../userContext";


const Signin = () => {
  const router = useRouter();
  const { setUser } = useUser();

  const [form, setForm] = useState({ email: "", password: "" });
  const [focused, setFocused] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:9999/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUser(data.user ?? data.userResponse);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">

      {/* Card */}
      <div className="w-full max-w-md px-8 py-10 rounded-2xl border border-gray-200 shadow-sm">

        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Sign in
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Continue to ClashCode
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocused({ ...focused, email: true })}
              onBlur={() => setFocused({ ...focused, email: false })}
              className="w-full px-3 pt-5 pb-2 text-sm border-b border-gray-300 focus:outline-none focus:border-black transition"
            />
            <label
              className={`absolute left-3 text-gray-500 transition-all ${
                focused.email || form.email
                  ? "top-1 text-xs"
                  : "top-3 text-sm"
              }`}
            >
              Email
            </label>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setFocused({ ...focused, password: true })}
              onBlur={() => setFocused({ ...focused, password: false })}
              className="w-full px-3 pt-5 pb-2 text-sm border-b border-gray-300 focus:outline-none focus:border-black transition"
            />
            <label
              className={`absolute left-3 text-gray-500 transition-all ${
                focused.password || form.password
                  ? "top-1 text-xs"
                  : "top-3 text-sm"
              }`}
            >
              Password
            </label>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 py-2.5 text-sm font-medium rounded-full bg-black text-white hover:bg-gray-900 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <Link href="/auth/signup" className="text-black font-medium">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signin;
