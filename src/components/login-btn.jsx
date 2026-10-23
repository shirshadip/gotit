"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButtons() {
  const { data: session, status } = useSession();
  const [pendingProvider, setPendingProvider] = useState(null);
  const [error, setError] = useState("");

  const handleSignIn = async (provider) => {
    setPendingProvider(provider);
    setError("");

    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch {
      setError(`Unable to sign in with ${provider === "google" ? "Google" : "GitHub"}. Please try again.`);
      setPendingProvider(null);
    }
  };

  if (status === "loading") {
    return <p className="text-sm text-slate-500">Checking your sign-in status...</p>;
  }

  if (session) {
    return (
      <div className="space-y-5 text-center">
        <p className="text-slate-700">
          Signed in as{" "}
          <span className="font-semibold">{session.user?.name ?? session.user?.email}</span>
        </p>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/" })}
          className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-3">
      <button
        type="button"
        onClick={() => void handleSignIn("google")}
        disabled={pendingProvider !== null}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
      >
        <span aria-hidden="true" className="text-lg font-bold text-indigo-600">
          G
        </span>
        {pendingProvider === "google" ? "Connecting to Google..." : "Continue with Google"}
      </button>
      <button
        type="button"
        onClick={() => void handleSignIn("github")}
        disabled={pendingProvider !== null}
        className="flex w-full items-center justify-center gap-3 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
      >
        <span aria-hidden="true" className="text-sm font-bold">
          GH
        </span>
        {pendingProvider === "github" ? "Connecting to GitHub..." : "Continue with GitHub"}
      </button>
      {error && (
        <p role="alert" className="pt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
