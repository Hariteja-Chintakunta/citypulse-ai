"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getRole, login, register } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      if (mode === "register") {
        await register(name, email, password);
        setMessage("Account created and signed in.");
      } else {
        await login(email, password);
        setMessage("Signed in.");
      }
      // Separate portals: admins go to the admin portal, everyone else
      // to the citizen (user) portal.
      router.push(getRole() === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold">{mode === "login" ? "Sign in" : "Create an account"}</h1>
      <p className="text-sm text-gray-600">
        Sign in is required for the full-stack version (the API). The demo
        prototype works without signing in and keeps your reports in your browser.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-white p-4">
        {mode === "register" && (
          <div>
            <label className="text-sm font-medium" htmlFor="name-input">Full name</label>
            <input id="name-input" data-testid="name-input" className="mt-1 w-full rounded border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
        )}
        <div>
          <label className="text-sm font-medium" htmlFor="email-input">Email</label>
          <input id="email-input" data-testid="email-input" type="email" className="mt-1 w-full rounded border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="password-input">Password</label>
          <input id="password-input" data-testid="password-input" type="password" className="mt-1 w-full rounded border px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {error && <p role="alert" data-testid="login-error" className="text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="text-sm text-green-800">{message}</p>}
        <button type="submit" data-testid="login-submit" className="w-full rounded bg-brand-teal px-4 py-2 font-semibold text-white">
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
      <p className="text-sm">
        {mode === "login" ? (
          <>No account yet? <button type="button" className="font-semibold text-brand-teal" onClick={() => setMode("register")}>Create one</button></>
        ) : (
          <>Already have an account? <button type="button" className="font-semibold text-brand-teal" onClick={() => setMode("login")}>Sign in</button></>
        )}
        {" · "}
        <Link href="/" className="font-semibold text-brand-teal">Continue without signing in</Link>
      </p>
      <p className="text-xs text-gray-500">Demo accounts: admin@citypulse.demo / demo1234, priya@citypulse.demo / demo1234 (seeded demo data only).</p>
    </div>
  );
}
