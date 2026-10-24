"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const MAX_PASSWORD_BYTES = 72;
const MIN_PASSWORD_LENGTH = 12;

export default function LoginButtons() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // A ref blocks double submits immediately; state updates are async.
  const submittingRef = useRef(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submittingRef.current) return;
    submittingRef.current = true;

    setPending(true);
    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    try {
      if (mode === "signup") {
        if (cleanName.length < 2) {
          setError("Please enter your name (at least 2 characters).");
          return;
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
          setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
          return;
        }

        // maxLength counts UTF-16 units, not bytes, so check bytes explicitly.
        if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
          setError(`Password must be no more than ${MAX_PASSWORD_BYTES} UTF-8 bytes.`);
          return;
        }

        let response: Response;

        try {
          response = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: cleanName,
              email: cleanEmail,
              password,
            }),
          });
        } catch {
          setError(
            "Cannot connect to the server. Check your internet connection and try again."
          );
          return;
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const serverMessage =
            typeof data?.error === "string" ? data.error : "";

          if (response.status === 400) {
            setError(
              serverMessage || "Please check your name, email, and password."
            );
          } else if (response.status === 409) {
            setError(
              serverMessage ||
                "An account with this email already exists. Try signing in."
            );
          } else if (response.status === 429) {
            setError("Too many attempts. Please wait before trying again.");
          } else if (response.status >= 500) {
            setError(
              serverMessage ||
                "The registration service is unavailable. Please try again later."
            );
          } else {
            setError(
              serverMessage ||
                "We could not create your account. Please try again."
            );
          }

          return;
        }
        // Signup succeeded. Continue with automatic sign-in.
      }

      // If the account exists but auto sign-in fails, switch to sign-in mode so
      // a retry doesn't call /api/signup again (which would return 409).
      const fallbackToSignIn = () => {
        setMode("signin");
        setName("");
        setPassword("");
        setSuccess(
          "Your account was created. Please sign in with your email and password."
        );
      };

      let result;

      try {
        result = await signIn("credentials", {
          email: cleanEmail,
          password,
          redirect: false,
        });
      } catch {
        if (mode === "signup") {
          fallbackToSignIn();
        } else {
          setError("Unable to reach the authentication service. Please try again.");
        }
        return;
      }

      if (!result) {
        setError("No authentication response was received. Please try again.");
        return;
      }

      if (result.error || !result.ok) {
        if (mode === "signup") {
          fallbackToSignIn();
        } else {
          setError("Incorrect email or password, or your account may be disabled.");
        }
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      submittingRef.current = false;
      setPending(false);
    }
  };

  if (status === "loading") {
    return (
      <p className="text-sm text-slate-500">Checking your sign-in status...</p>
    );
  }

  if (session) {
    return (
      <div className="space-y-5 text-center">
        <p className="text-slate-700">
          Signed in as{" "}
          <span className="font-semibold">
            {session.user?.name ?? session.user?.email}
          </span>
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
      <form onSubmit={handleSubmit} className="space-y-3 text-left">
        {mode === "signup" && (
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              autoComplete="name"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              maxLength={80}
              minLength={2}
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </label>
        )}

        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            maxLength={MAX_PASSWORD_BYTES}
            minLength={mode === "signup" ? MIN_PASSWORD_LENGTH : undefined}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />

          {mode === "signup" && (
            <span className="mt-1 block text-xs text-slate-500">
              Use at least {MIN_PASSWORD_LENGTH} characters and no more than{" "}
              {MAX_PASSWORD_BYTES} UTF-8 bytes.
            </span>
          )}
        </label>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
        >
          {pending
            ? "Please wait..."
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
        >
          {success}
        </p>
      )}

      <p className="text-center text-sm text-slate-600">
        {mode === "signup" ? "Already have an account?" : "New to Gotit?"}{" "}
        <button
          type="button"
          disabled={pending}
          className="font-semibold text-indigo-700 hover:underline disabled:opacity-60"
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setError("");
            setSuccess("");
          }}
        >
          {mode === "signup" ? "Sign in" : "Create an account"}
        </button>
      </p>
    </div>
  );
}