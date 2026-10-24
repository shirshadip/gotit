
import { NextResponse } from "next/server";
import {
  demoProfiles,
  matchedIds,
  publicProfile,
} from "@/app/lib/store";
import { getAuthenticatedProfile } from "@/lib/auth/session";

// export const runtime = "nodejs";

export async function GET() {
  const authenticatedProfile = await getAuthenticatedProfile();

  if (!authenticatedProfile) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const matches = demoProfiles
    .filter((profile) => matchedIds.has(profile.id))
    .map(publicProfile);

  return NextResponse.json(matches);
}