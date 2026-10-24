import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { getAuthenticatedProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default function ChatPage() {
  return (
    <>
      <Navbar activeHref="/chat" />
      <Suspense
        fallback={<p className="p-6 text-slate-500">Loading...</p>}
      >
        <ChatContent />
      </Suspense>
    </>
  );
}

async function ChatContent() {
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    redirect("/login");
  }

  return <p className="p-6">Hello {profile.name}</p>;
}