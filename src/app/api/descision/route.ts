
import { NextRequest, NextResponse } from "next/server";
import {
  demoProfiles,
  decisions,
  matchedIds,
} from "@/app/lib/store";

// export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { profileId?: unknown; action?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON." },
      { status: 400 },
    );
  }

  const { profileId, action } = body;

  if (
    typeof profileId !== "string" ||
    (action !== "like" && action !== "pass")
  ) {
    return NextResponse.json(
      { error: "Invalid decision." },
      { status: 400 },
    );
  }

  const profile = demoProfiles.find((p) => p.id === profileId);

  if (!profile) {
    return NextResponse.json(
      { error: "Profile not found." },
      { status: 404 },
    );
  }

  if (decisions.has(profileId)) {
    return NextResponse.json(
      { error: "Already decided." },
      { status: 409 },
    );
  }

  decisions.set(profileId, action);

  const matched = action === "like" && profile.mutualLike;

  if (matched) {
    matchedIds.add(profileId);
  }

  return NextResponse.json({
    success: true,
    matched,
    profileId,
  });
}