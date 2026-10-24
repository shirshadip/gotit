import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { registrationSchema } from "@/lib/auth/validation";
import {
  getSupabaseAdmin,
  SupabaseConfigurationError,
} from "@/lib/supabase-admin";

const BCRYPT_ROUNDS = 12;
const MAX_PASSWORD_BYTES = 72; // bcrypt ignores everything past 72 bytes

// Best-effort in-memory rate limiter: 5 attempts per 10 minutes per IP.
// State lives in this server instance only. It works on a single Node
// server, but on serverless each instance has its own counter, so treat it
// as a basic speed bump rather than a hard guarantee.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(key, recent);
    return true;
  }

  recent.push(now);
  attempts.set(key, recent);

  // Keep the map from growing forever.
  if (attempts.size > 10_000) {
    for (const [k, times] of attempts) {
      if (times.every((t) => now - t >= WINDOW_MS)) attempts.delete(k);
    }
  }

  return false;
}

export async function POST(request: Request) {
  try {
    // Rate limit BEFORE the expensive bcrypt hash.
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait before trying again." },
        { status: 429 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Check your name, email, and password." },
        { status: 400 }
      );
    }

    const { password } = parsed.data;
    const name = parsed.data.name.trim();
    // Normalize so "A@x.com" and "a@x.com" can't become two accounts,
    // and so sign-in lookups match.
    const email = parsed.data.email.trim().toLowerCase();

    // Defense in depth: don't rely on the schema alone for the byte limit.
    if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
      return NextResponse.json(
        { error: "Password must be no more than 72 UTF-8 bytes." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        name,
        email,
        password_hash: passwordHash,
        account_status: "active",
      })
      .select("id, name, email")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }

      console.error("Registration database write failed:", {
        code: error.code,
        message: error.message,
      });

      return NextResponse.json(
        { error: "Unable to create your account." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: data,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      console.error("Supabase configuration error:", {
        missingVariables: error.missingVariables,
      });
    } else {
      console.error("Unexpected registration error:", error);
    }

    return NextResponse.json(
      { error: "Registration service is temporarily unavailable." },
      { status: 503 }
    );
  }
}