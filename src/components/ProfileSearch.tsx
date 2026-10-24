"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Result = {
  id: string;
  name: string;
  tag: string;
  bio: string;
  profile_pic: string | null;
};

type Status = "idle" | "loading" | "done" | "error";

export default function ProfileSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    const controller = new AbortController();

    // Debounce: wait 300ms after the last keystroke
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/profiles?q=${encodeURIComponent(q)}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error("Search failed");
        const data: Result[] = await res.json();
        setResults(data);
        setStatus("done");
      } catch (err) {
        if ((err as Error).name === "AbortError") return; // a newer search replaced this one
        setStatus("error");
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <section className="mx-auto w-full max-w-xl px-5 pt-10 sm:px-8">
      {/* Search box */}
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or #tag"
          aria-label="Search profiles by name or tag"
          maxLength={30}
          className="w-full rounded-full border border-slate-300 bg-white py-3 pl-12 pr-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Results */}
      <div aria-live="polite" className="mt-4">
        {status === "loading" && (
          <ul className="space-y-3">
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="flex animate-pulse items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
              >
                <div className="h-12 w-12 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-slate-200" />
                  <div className="h-3 w-48 rounded bg-slate-200" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {status === "error" && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            Something went wrong. Try searching again.
          </p>
        )}

        {status === "done" && results.length === 0 && (
          <p className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
            No profiles found for “{query.trim()}”.
          </p>
        )}

        {status === "done" && results.length > 0 && (
          <ul className="space-y-3">
            {results.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:ring-rose-300"
              >
                <Link
                  href={`/user/${encodeURIComponent(p.name)}`}
                  className="flex items-center gap-4 rounded-2xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-lg font-semibold text-slate-500">
                    {p.profile_pic ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.profile_pic}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      p.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="truncate font-semibold text-slate-900">{p.name}</p>
                      {p.tag && (
                        <span className="shrink-0 text-sm font-medium text-rose-600">
                          #{p.tag}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-1 text-sm text-slate-500">{p.bio}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}