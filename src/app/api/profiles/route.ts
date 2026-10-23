
import { NextResponse } from "next/server";
import { demoProfiles, decisions, publicProfile } from "@/app/lib/store";

// export const runtime = "bunjs";

export async function GET() {
  const profiles = demoProfiles
    .filter((profile) => !decisions.has(profile.id))
    .map(publicProfile);

  return NextResponse.json(profiles);
}