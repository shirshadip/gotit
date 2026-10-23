
import { NextResponse } from "next/server";
import {
  demoProfiles,
  matchedIds,
  publicProfile,
} from "@/app/lib/store";

// export const runtime = "nodejs";

export async function GET() {
  const matches = demoProfiles
    .filter((profile) => matchedIds.has(profile.id))
    .map(publicProfile);

  return NextResponse.json(matches);
}