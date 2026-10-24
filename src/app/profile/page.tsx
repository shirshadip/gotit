import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import ProfileEditor from "@/components/ProfileEditor";
import { getAuthenticatedProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileContent />
        </Suspense>
      </main>
    </>
  );
}

async function ProfileContent() {
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <ProfileEditor
      profile={{
        id: profile.id,
        name: profile.name ?? "",
        tag: profile.tag ?? "",
        bio: profile.bio ?? "",
        profile_pic: profile.profile_pic ?? null,
      }}
    />
  );
}

function ProfileSkeleton() {
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