"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, AlertCircle, ShieldCheck, User } from "lucide-react";
import { login } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login(email, password);
      localStorage.setItem("lk_auth_token", res.token);
      localStorage.setItem("lk_auth_user", JSON.stringify(res.user));
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-6 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to L &amp; K Public Portal</span>
        </Link>

        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-700 via-emerald-800 to-blue-900 flex items-center justify-center font-black text-white shadow-md text-xl">
            L&amp;K
          </div>
        </div>

        <h2 className="text-center text-2xl font-black text-slate-900 tracking-tight">
          Distributor Management Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Sign in to manage catalog listings, inquiry requests, and manufacturer partnerships.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Official Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@lkpharma.demo"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign in to Dashboard"}
            </button>
          </form>

          {/* Demo Account Presets */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Demo Preset Accounts (Click to autofill)
            </span>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin("superadmin@lkpharma.demo", "SuperAdmin@2026")}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900">1. Super Administrator</div>
                  <div className="text-[10px] text-slate-500">superadmin@lkpharma.demo (All companies + shared records)</div>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">Use &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("admin@lakshmipharma.demo", "Lakshmi@2026")}
                className="w-full text-left p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-emerald-950">2. Lakshmi Pharma Admin</div>
                  <div className="text-[10px] text-slate-500">admin@lakshmipharma.demo (Lakshmi catalog &amp; inquiries)</div>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">Use &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("admin@kothittilpharma.demo", "Kothittil@2026")}
                className="w-full text-left p-2.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 transition-colors text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-blue-950">3. The Kothittil Pharma Admin</div>
                  <div className="text-[10px] text-slate-500">admin@kothittilpharma.demo (Kothittil catalog &amp; inquiries)</div>
                </div>
                <span className="text-[10px] font-mono text-blue-700 font-bold">Use &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
