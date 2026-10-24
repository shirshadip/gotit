"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import TinderCard from "react-tinder-card";
import Link from "next/link";

type SwipeDirection = "left" | "right";
type TinderCardHandle = {
  swipe: (direction?: SwipeDirection) => Promise<void>;
  restoreCard: () => Promise<void>;
};

type DeckProfile = {
  id: string;
  name: string;
  bio: string;
  profile_pic: string | null;
};

type DecisionResponse = {
  success: boolean;
  matched: boolean;
  profileId: string;
};

const PROFILES_URL = "/api/profiles";
const DECISION_URL = "/api/descision"; // keep this spelling in sync with your route folder
const VISIBLE_CARDS = 3;

function isProfileList(value: unknown): value is DeckProfile[] {
  return (
    Array.isArray(value) &&
    value.every(
      (p) =>
        typeof p === "object" &&
        p !== null &&
        "id" in p &&
        typeof p.id === "string" &&
        "name" in p &&
        typeof p.name === "string" &&
        "bio" in p &&
        typeof p.bio === "string" &&
        "profile_pic" in p &&
        (p.profile_pic === null || typeof p.profile_pic === "string"),
    )
  );
}

function isDecisionResponse(value: unknown): value is DecisionResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    typeof value.success === "boolean" &&
    "matched" in value &&
    typeof value.matched === "boolean" &&
    "profileId" in value &&
    typeof value.profileId === "string"
  );
}

function ProfileCard({
  profile,
  isTop,
  hint,
}: {
  profile: DeckProfile;
  isTop: boolean;
  hint: SwipeDirection | null;
}) {
  const initial = (profile.name || "?").charAt(0).toUpperCase();

  return (
    <article
      className={`flex h-full w-full select-none flex-col gap-3 rounded-3xl border-2 border-[#10739e] bg-[#b1ddf0] p-3 shadow-xl transition duration-300 ${
        isTop ? "scale-100" : "translate-y-3 scale-[0.95] opacity-90"
      }`}
    >
      {/* Photo */}
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-white">
        {profile.profile_pic ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.profile_pic}
            alt={`${profile.name}'s profile`}
            draggable={false}
            className="pointer-events-none h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-200 text-6xl font-semibold text-slate-400">
            {initial}
          </div>
        )}

        <span
          className={`pointer-events-none absolute left-4 top-4 -rotate-12 rounded-lg border-4 border-emerald-500 bg-white/70 px-3 py-1 text-2xl font-extrabold tracking-widest text-emerald-600 transition-opacity duration-150 ${
            isTop && hint === "right" ? "opacity-100" : "opacity-0"
          }`}
        >
          LIKE
        </span>
        <span
          className={`pointer-events-none absolute right-4 top-4 rotate-12 rounded-lg border-4 border-rose-500 bg-white/70 px-3 py-1 text-2xl font-extrabold tracking-widest text-rose-600 transition-opacity duration-150 ${
            isTop && hint === "left" ? "opacity-100" : "opacity-0"
          }`}
        >
          PASS
        </span>
      </div>

      {/* Name */}
      <div className="rounded-xl border-2 border-[#56517e] bg-[#d0cee2] px-4 py-2 text-center text-lg font-semibold text-slate-900">
        <span className="block truncate">{profile.name}</span>
      </div>

      {/* Bio */}
      <div className="h-24 overflow-hidden rounded-xl border border-[#36393d] bg-[#f9f7ed] px-4 py-3 text-sm leading-6 text-slate-700">
        <p className="line-clamp-3 break-words">{profile.bio}</p>
      </div>
    </article>
  );
}

export default function SwipeDeck() {
  const [profiles, setProfiles] = useState<DeckProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hint, setHint] = useState<SwipeDirection | null>(null);
  const [matchName, setMatchName] = useState("");
  const [matchOpen, setMatchOpen] = useState(false);

  // Cards keyed by profile id (array indexes go stale as cards leave)
  const cardRefs = useRef(new Map<string, TinderCardHandle>());
  // Ids already swiped, so a card can never be decided twice
  const decided = useRef(new Set<string>());
  const matchTimer = useRef<number | undefined>(undefined);

  const toast = useSpring({
    opacity: matchOpen ? 1 : 0,
    transform: matchOpen
      ? "translateY(0px) scale(1)"
      : "translateY(-12px) scale(0.96)",
    config: { tension: 260, friction: 18 },
  });

  useEffect(() => () => window.clearTimeout(matchTimer.current), []);

  const fetchProfiles = useCallback(async () => {
    const response = await fetch(PROFILES_URL);
    if (!response.ok) {
      throw new Error("Unable to load profiles. Please try again.");
    }
    const result: unknown = await response.json();
    if (!isProfileList(result)) {
      throw new Error("The profiles response was invalid.");
    }
    return result;
  }, []);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchProfiles();
      decided.current.clear();
      cardRefs.current.clear();
      setProfiles(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load profiles. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [fetchProfiles]);

  useEffect(() => {
    let active = true;

    void fetchProfiles()
      .then((result) => {
        if (active) setProfiles(result);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load profiles. Please try again.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchProfiles]);

  const saveDecision = useCallback(
    async (profile: DeckProfile, direction: string) => {
      const action = direction === "right" ? "like" : "pass";
      setError("");

      try {
        const response = await fetch(DECISION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: profile.id, action }),
        });

        const result: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          const message =
            typeof result === "object" &&
            result !== null &&
            "error" in result &&
            typeof result.error === "string"
              ? result.error
              : "Unable to save your decision.";
          throw new Error(message);
        }

        if (!isDecisionResponse(result)) {
          throw new Error("The decision response was invalid.");
        }

        if (result.success && result.matched) {
          setMatchName(profile.name || "someone");
          setMatchOpen(true);
          window.clearTimeout(matchTimer.current);
          matchTimer.current = window.setTimeout(() => setMatchOpen(false), 4000);
        }
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? `${saveError.message} Refresh the deck to try again.`
            : "Unable to save your decision. Refresh the deck to try again.",
        );
      }
    },
    [],
  );

  const handleSwipe = (profile: DeckProfile, direction: string) => {
    if (decided.current.has(profile.id)) return; // ignore double fires
    decided.current.add(profile.id);
    setHint(null);
    void saveDecision(profile, direction);
  };

  // Buttons: swipe the top card that hasn't already been decided
  const swipe = (direction: SwipeDirection) => {
    for (let i = profiles.length - 1; i >= 0; i--) {
      const profile = profiles[i];
      if (decided.current.has(profile.id)) continue;
      void cardRefs.current.get(profile.id)?.swipe(direction);
      return;
    }
  };

  // Only mount the top few cards; the last item is the top of the stack
  const visible = profiles.slice(-VISIBLE_CARDS);

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-600">
          Find your people
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          A good connection might be one swipe away.
        </h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
          Swipe right to say you’re interested, or left to meet someone else.
        </p>
      </div>

      {/* Match toast */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <animated.div
          style={toast}
          role="status"
          aria-live="polite"
          className="rounded-xl bg-rose-600 px-5 py-3 text-center font-semibold text-white shadow-lg"
        >
          It’s a match! You and {matchName} like each other.
        </animated.div>
      </div>

      {error && (
        <div
          role="alert"
          className="mx-auto mt-6 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadProfiles()}
            className="mt-2 font-semibold underline underline-offset-2"
          >
            Refresh profiles
          </button>
        </div>
      )}

      <div className="mx-auto mt-10 flex w-full flex-col items-center">
        {loading ? (
          <div
            role="status"
            className="flex h-[min(530px,65dvh)] min-h-[410px] w-full max-w-[390px] items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-500 shadow-sm"
          >
            Finding people for you...
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex min-h-[300px] w-full max-w-[390px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-8 text-center shadow-sm">
            <span className="text-4xl text-rose-500" aria-hidden="true">✦</span>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              You’re all caught up
            </h2>
            <p className="mt-2 leading-6 text-slate-600">
              There are no more profiles to show right now. Check back soon!
            </p>
            <button
              type="button"
              onClick={() => void loadProfiles()}
              className="mt-5 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Check again
            </button>
          </div>
        ) : (
          <>
          <Link href={`/user/${visible[visible.length - 1].id}`} className="w-full">
            <div className="relative h-[min(530px,65dvh)] min-h-[410px] w-full max-w-[390px] hover:cursor-grab active:cursor-grabbing">
              {visible.map((profile, index) => (
                <TinderCard
                  key={profile.id}
                  ref={(instance) => {
                    if (instance) cardRefs.current.set(profile.id, instance);
                    else cardRefs.current.delete(profile.id);
                  }}
                  className="absolute inset-0"
                  onSwipe={(direction) => handleSwipe(profile, direction)}
                  onSwipeRequirementFulfilled={(direction) => {
                    if (direction === "left" || direction === "right") {
                      setHint(direction);
                    }
                  }}
                  onSwipeRequirementUnfulfilled={() => setHint(null)}
                  onCardLeftScreen={() => {
                    cardRefs.current.delete(profile.id);
                    setProfiles((current) =>
                      current.filter((item) => item.id !== profile.id),
                    );
                  }}
                  preventSwipe={["up", "down"]}
                  swipeRequirementType="position"
                  swipeThreshold={100}
                >
                  <ProfileCard
                    profile={profile}
                    isTop={index === visible.length - 1}
                    hint={hint}
                  />
                </TinderCard>
              ))}
            </div>
            </Link>
            <div className="mt-7 flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => swipe("left")}
                aria-label="Pass on this profile"
                className="flex size-14 items-center justify-center rounded-full border border-rose-200 bg-white text-2xl text-rose-600 shadow-md transition hover:scale-105 hover:bg-rose-50 active:scale-95"
              >
                <span aria-hidden="true">×</span>
              </button>
              <button
                type="button"
                onClick={() => swipe("right")}
                aria-label="Like this profile"
                className="flex size-16 items-center justify-center rounded-full bg-rose-600 text-2xl text-white shadow-lg shadow-rose-600/25 transition hover:scale-105 hover:bg-rose-700 active:scale-95"
              >
                <span aria-hidden="true">♥</span>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}