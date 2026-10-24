import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import SwipeDeck from "@/components/SwipeDeck";
import { getAuthenticatedProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import ProfileSearch from "@/components/ProfileSearch";

export default function FindPage() {
  return (
    <>
      <Navbar activeHref="/find" />
      <Suspense
        fallback={<p className="p-6 text-slate-500">Loading...</p>}
      >
        <FindContent />
      </Suspense>
    </>
  );
}

async function FindContent() {
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    redirect("/login");
  }

  return <> <ProfileSearch /> <SwipeDeck /> </> ;
}