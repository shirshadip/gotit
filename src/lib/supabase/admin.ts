import "server-only";

import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

let supabaseAdmin: SupabaseClient | undefined;

export class SupabaseConfigurationError extends Error {
  constructor(public readonly missingVariables: string[]) {
    super("Required Supabase server environment variables are missing.");
    this.name = "SupabaseConfigurationError";
  }
}

export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) return supabaseAdmin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missingVariables = [
    !supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
    !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter((name): name is string => Boolean(name));

  if (missingVariables.length) {
    throw new SupabaseConfigurationError(missingVariables);
  }

  try {
    new URL(supabaseUrl!);

    if (
      !supabaseUrl!.startsWith("https://") ||
      !supabaseUrl!.endsWith(".supabase.co")
    ) {
      throw new Error("Invalid Supabase project URL.");
    }

    supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });

    return supabaseAdmin;
  } catch {
    throw new Error("Unable to initialize Supabase client.");
  }
}
