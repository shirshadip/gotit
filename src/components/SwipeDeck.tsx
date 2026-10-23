"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import TinderCard from "react-tinder-card";
import type { Profile } from "@/app/lib/store";

type SwipeDirection = "left" | "right";
type TinderCardHandle = {
  swipe: (direction?: SwipeDirection) => Promise<void>;
  restoreCard: () => Promise<void>;
};

type DecisionResponse = {
  success: boolean;
  matched: boolean;
  profileId: string;
};

function isProfileList(value: unknown): value is Profile[] {
  return (
    Array.isArray(value) &&
    value.every(
      (profile) =>
        typeof profile === "object" &&
        profile !== null &&
        "id" in profile &&
        typeof profile.id === "string" &&
        "name" in profile &&
        typeof profile.name === "string" &&
        "age" in profile &&
        typeof profile.age === "number" &&
        "bio" in profile &&
        typeof profile.bio === "string" &&
        "interests" in profile &&
        Array.isArray(profile.interests) &&
        profile.interests.every(
          (interest: unknown) => typeof interest === "string",
        ) &&
        "photo" in profile &&
        typeof profile.photo === "string",
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

export default function SwipeDeck() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const cardRefs = useRef<Array<TinderCardHandle | null>>([]);
  const [matchStyle, matchApi] = useSpring(() => ({
    opacity: 0,
    transform: "translateY(8px)",
  }));

  const fetchProfiles = useCallback(async () => {
    const response = await fetch("/api/profiles");
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
      setProfiles(await fetchProfiles());
      cardRefs.current = [];
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
    async (profileId: string, direction: string) => {
      const action = direction === "right" ? "like" : "pass";
      setError("");
      setNotice("");

      try {
        const response = await fetch("/api/descision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId, action }),
        });

        if (!response.ok) {
          const result: unknown = await response.json();
          const message =
            typeof result === "object" &&
            result !== null &&
            "error" in result &&
            typeof result.error === "string"
              ? result.error
              : "Unable to save your decision.";
          throw new Error(message);
        }

        const result: unknown = await response.json();
        if (!isDecisionResponse(result)) {
          throw new Error("The decision response was invalid.");
        }
        if (result.success && result.matched) {
          const profile = profiles.find((item) => item.id === profileId);
          setNotice(`It’s a match! You and ${profile?.name ?? "someone"} like each other.`);
          void matchApi.start({
            opacity: 1,
            transform: "translateY(0px)",
            config: { tension: 260, friction: 18 },
          });
        }
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? `${saveError.message} Refresh the deck to try again.`
            : "Unable to save your decision. Refresh the deck to try again.",
        );
      }
    },
    [matchApi, profiles],
  );

  const swipe = (direction: SwipeDirection) => {
    const topCardIndex = profiles.length - 1;
    const card = cardRefs.current[topCardIndex];
    if (card) void card.swipe(direction);
  };

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

      {notice && (
        <div className="relative mx-auto mt-6 max-w-md">
          <animated.div
            aria-hidden="true"
            style={{
              ...matchStyle,
              position: "absolute",
              inset: 0,
              borderRadius: "0.75rem",
              backgroundColor: "#fff1f2",
            }}
          />
          <p
            role="status"
            className="relative rounded-xl bg-rose-50 px-4 py-3 text-center font-semibold text-rose-700"
          >
            {notice}
          </p>
        </div>
      )}

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
            className="flex h-[min(530px,65dvh)] min-h-[410px] w-full max-w-[390px] items-center justify-center rounded-[26px] border border-slate-200 bg-white text-slate-500 shadow-sm"
          >
            Finding people for you...
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex min-h-[300px] w-full max-w-[390px] flex-col items-center justify-center rounded-[26px] border border-slate-200 bg-white px-8 text-center shadow-sm">
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
            <div className="relative h-[min(530px,65dvh)] min-h-[410px] w-full max-w-[390px]">
              {profiles.map((profile, index) => (
                <TinderCard
                  key={profile.id}
                  ref={(instance) => {
                    cardRefs.current[index] = instance;
                  }}
                  className="absolute inset-0"
                  onSwipe={(direction) => {
                    void saveDecision(profile.id, direction);
                  }}
                  onCardLeftScreen={() => {
                    setProfiles((current) =>
                      current.filter((item) => item.id !== profile.id),
                    );
                  }}
                  preventSwipe={["up", "down"]}
                  swipeRequirementType="position"
                  swipeThreshold={100}
                >
                  <article className="profile-card !absolute !inset-0 !h-full !w-full !max-w-none">
                    {/* Profile photos are remote URLs supplied by the demo profile data. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profile.photo}
                      alt={`${profile.name}'s profile`}
                      className="profile-photo"
                    />
                    <div className="profile-gradient" />
                    <span className="demo-badge">SAY HELLO</span>
                    <div className="profile-details">
                      <h2>
                        {profile.name}, {profile.age}
                      </h2>
                      <p>{profile.bio}</p>
                      <div className="interest-list">
                        {profile.interests.map((interest) => (
                          <span key={interest}>{interest}</span>
                        ))}
                      </div>
                    </div>
                    <div className="pointer-events-none absolute left-0 right-0 top-6 flex justify-center gap-3 text-lg font-extrabold uppercase tracking-widest">
                      <span className="rounded-lg border-2 border-rose-300 bg-rose-950/50 px-3 py-1 text-rose-200">
                        Pass
                      </span>
                      <span className="rounded-lg border-2 border-emerald-300 bg-emerald-950/50 px-3 py-1 text-emerald-200">
                        Like
                      </span>
                    </div>
                  </article>
                </TinderCard>
              ))}
            </div>

            <div className="mt-7 flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => swipe("left")}
                aria-label="Pass on this profile"
                className="flex size-14 items-center justify-center rounded-full border border-rose-200 bg-white text-2xl text-rose-600 shadow-md transition hover:scale-105 hover:bg-rose-50"
              >
                <span aria-hidden="true">×</span>
              </button>
              <button
                type="button"
                onClick={() => swipe("right")}
                aria-label="Like this profile"
                className="flex size-16 items-center justify-center rounded-full bg-rose-600 text-2xl text-white shadow-lg shadow-rose-600/25 transition hover:scale-105 hover:bg-rose-700"
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
