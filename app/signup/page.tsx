"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!username || !email || !password || !confirm) return setError("Please fill in all fields.");
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data?.error || "Signup failed.");
      window.location.href = "/"; // logged in via cookie
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 px-4 py-16">
      <h1 className="text-2xl font-semibold mb-6">Create your account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-sm mb-1">Username</label>
          <input className="w-full rounded-md border border-border bg-background px-3 py-2" value={username} onChange={(e)=>setUsername(e.target.value)} />
        </div>
        <div><label className="block text-sm mb-1">Email</label>
          <input type="email" className="w-full rounded-md border border-border bg-background px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div><label className="block text-sm mb-1">Password</label>
          <input type="password" className="w-full rounded-md border border-border bg-background px-3 py-2" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <div><label className="block text-sm mb-1">Confirm Password</label>
          <input type="password" className="w-full rounded-md border border-border bg-background px-3 py-2" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button disabled={loading} className="w-full rounded-md bg-foreground text-background py-2 font-medium">
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <div className="flex items-center gap-2">
          <p>Already have an account?</p>
          <Link href="/signin" className="text-blue-500">Sign In</Link>
        </div>
      </form>
    </div>
  );
}
