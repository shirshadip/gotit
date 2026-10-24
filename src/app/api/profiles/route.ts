import { NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const me = await getAuthenticatedProfile();
  if (!me) {
    return NextResponse.json({ error: "You're not signed in." }, { status: 401 });
  }

  const raw = new URL(req.url).searchParams.get("q") ?? "";

  // Allow "#tag" searches, and keep only safe characters. This also stops
  // anyone from injecting extra filters into the PostgREST .or() string.
  const q = raw
    .replace(/^#/, "")
    .replace(/[^\p{L}\p{N} _.\-]/gu, "")
    .trim()
    .slice(0, 30);

  if (!q) return NextResponse.json([]);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, tag, bio, profile_pic")
    .or(`name.ilike."%${q}%",tag.ilike."%${q}%"`)
    .neq("id", me.id)
    .eq("account_status", "active")
    .neq("name", "")
    .order("name", { ascending: true })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }

  return NextResponse.json(
    data.map((p) => ({
      id: String(p.id),
      name: p.name ?? "",
      tag: (p.tag ?? "").replace(/^#/, ""),
      bio: p.bio ?? "",
      profile_pic: p.profile_pic ?? null,
    })),
  );
}