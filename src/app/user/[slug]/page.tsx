import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getAuthenticatedProfile } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto mb-4 w-full max-w-xl">
          <Link
            href="/find"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <span aria-hidden="true">←</span> Back to Find
          </Link>
        </div>
        {/* params is read inside Suspense so the page shell can render first */}
        <Suspense fallback={<PublicProfileSkeleton />}>
          <PublicProfileContent params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function PublicProfileContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const me = await getAuthenticatedProfile();
  if (!me) redirect("/login");

  const { slug } = await params;
  let name = slug;
  try {
    name = decodeURIComponent(slug);
  } catch {
    // slug was already decoded; use it as is
  }

  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, tag, bio, profile_pic, created_at")
    .eq("name", name)
    .eq("account_status", "active")
    .maybeSingle();

  if (!profile) notFound();

  // Your own public URL just goes to your editable page
  if (profile.id === me.id) redirect("/profile");

  const tag = (profile.tag ?? "").replace(/^#/, "");
  const initial = (profile.name || "?").charAt(0).toUpperCase();
  const joined = new Date(profile.created_at).toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });

  return (
    <article className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="h-28 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

      <div className="px-6 pb-6">
        <div className="-mt-12 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 text-3xl font-semibold text-slate-500 shadow">
          {profile.profile_pic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.profile_pic}
              alt={`${profile.name}'s profile picture`}
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </div>

        <div className="mt-4">
          <h1 className="break-words text-2xl font-bold text-slate-900">
            {profile.name}
          </h1>
          {tag && (
            <p className="text-sm font-medium text-indigo-600">#{tag}</p>
          )}
        </div>

        <p className="mt-4 whitespace-pre-wrap break-words text-slate-600">
          {profile.bio || (
            <span className="italic text-slate-400">No bio yet.</span>
          )}
        </p>

        <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400">
          Member since {joined}
        </p>
      </div>
    </article>
  );
}

function PublicProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-xl animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="h-28 bg-slate-200" />
      <div className="px-6 pb-6">
        <div className="-mt-12 h-24 w-24 rounded-full border-4 border-white bg-slate-300" />
        <div className="mt-4 h-5 w-40 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-24 rounded bg-slate-200" />
        <div className="mt-6 h-16 rounded bg-slate-200" />
      </div>
    </div>
  );
}