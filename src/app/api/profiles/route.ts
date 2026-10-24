
import { NextResponse } from "next/server";
import { demoProfiles, decisions, publicProfile } from "@/app/lib/store";
import { getAuthenticatedProfile } from "@/lib/auth/session";

// export const runtime = "bunjs";

export async function GET() {
  const authenticatedProfile = await getAuthenticatedProfile();

  if (!authenticatedProfile) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const profiles = demoProfiles
    .filter((profile) => !decisions.has(profile.id))
    .map(publicProfile);

  return NextResponse.json(profiles);
}