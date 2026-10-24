
import "server-only";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function getAuthenticatedProfile() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const { data: profile, error } = await getSupabaseAdmin()
    .from("profiles")
    .select(
      "id, email, name, account_status, tag, bio, profile_pic"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Active account lookup failed", {
      code: error.code,
    });

    throw new Error("Unable to validate the current account.");
  }

  if (!profile || profile.account_status !== "active") {
    return null;
  }

  return {
    id: String(profile.id),
    email: profile.email,
    name: profile.name,
    tag: profile.tag,
    bio: profile.bio,
    profile_pic: profile.profile_pic,
  };
}