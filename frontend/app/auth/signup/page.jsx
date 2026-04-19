"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Signup = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [focused, setFocused] = useState({
    username: false,
    email: false,
    password: false,
  });

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
      const res = await fetch("http://localhost:9999/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      router.push("/auth/signin");
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
            Create account
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Join ClashCode
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Username */}
          <div className="relative">
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              onFocus={() => setFocused({ ...focused, username: true })}
              onBlur={() => setFocused({ ...focused, username: false })}
              className="w-full px-3 pt-5 pb-2 text-sm border-b border-gray-300 focus:outline-none focus:border-black transition"
            />
            <label
              className={`absolute left-3 text-gray-500 transition-all ${
                focused.username || form.username
                  ? "top-1 text-xs"
                  : "top-3 text-sm"
              }`}
            >
              Username
            </label>
          </div>

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
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-black font-medium">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;