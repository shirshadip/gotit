import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Start with what you love",
    description:
      "Pick the things you’re into and meet people who are already excited to talk about them.",
    icon: "✳",
    color: "bg-rose-100 text-rose-700",
  },
  {
    number: "02",
    title: "Find your kind of people",
    description:
      "Explore thoughtful profiles built around shared interests, not just a swipe and a guess.",
    icon: "⌕",
    color: "bg-violet-100 text-violet-700",
  },
  {
    number: "03",
    title: "Let a good chat happen",
    description:
      "Say hello, trade recommendations, and see where a real conversation takes you.",
    icon: "↗",
    color: "bg-amber-100 text-amber-700",
  },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#fffdfb] text-slate-900">
      <section className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-rose-100/70 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-28">
          <div className="max-w-xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm">
              <span aria-hidden="true" className="text-base">✦</span>
              A little more connection, a lot more you
            </p>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Good things
              <br />
              start with
              <br />
              <span className="font-serif italic text-rose-600">hello.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-600">
              Meet people who get your interests, your humor, and the things
              you can talk about for hours. Your next favorite conversation is
              closer than you think.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/find"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-3 font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
              >
                Find your people
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white/80 px-7 py-3 font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-white"
              >
                Create your account
              </Link>
            </div>
            <div className="mt-9 flex items-center gap-3 text-sm text-slate-500">
              <div className="flex -space-x-2" aria-hidden="true">
                <span className="flex size-9 items-center justify-center rounded-full border-2 border-[#fffdfb] bg-amber-200 text-xs font-bold text-amber-900">J</span>
                <span className="flex size-9 items-center justify-center rounded-full border-2 border-[#fffdfb] bg-violet-200 text-xs font-bold text-violet-900">M</span>
                <span className="flex size-9 items-center justify-center rounded-full border-2 border-[#fffdfb] bg-emerald-200 text-xs font-bold text-emerald-900">A</span>
              </div>
              <span>Come as you are. Find your people.</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg py-8 sm:py-12">
            <div
              aria-hidden="true"
              className="absolute inset-8 rounded-[3rem] bg-gradient-to-br from-rose-200 via-orange-100 to-violet-200 blur-2xl"
            />
            <div className="relative rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-2xl shadow-rose-900/10 backdrop-blur sm:rotate-1 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">
                    A good place to begin
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Find your people
                  </h2>
                </div>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-rose-100 text-xl text-rose-700" aria-hidden="true">
                  ✦
                </span>
              </div>

              <div className="mt-7 space-y-3">
                <div className="flex items-center gap-4 rounded-2xl bg-[#fff8f5] p-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 to-orange-300 text-lg font-bold text-orange-950">JD</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">Jamie, 27</p>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Online</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Always looking for a new trail</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600">Hiking</span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600">Coffee</span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600">Indie films</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-[#f8f6ff] p-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-200 to-indigo-300 text-lg font-bold text-indigo-950">AR</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">Alex, 25</p>
                      <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">New here</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Making playlists for every mood</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600">Live music</span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600">Cooking</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                <p className="text-sm text-slate-500">A shared interest is a great hello.</p>
                <span className="flex size-10 items-center justify-center rounded-full bg-rose-600 text-lg text-white" aria-hidden="true">♥</span>
              </div>
            </div>
            <div className="absolute -left-3 top-2 -rotate-6 rounded-2xl border border-amber-100 bg-white px-4 py-3 shadow-lg sm:-left-8">
              <p className="text-xs font-medium text-slate-500">Conversation starter</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">“What are you listening to?”</p>
            </div>
            <div className="absolute -bottom-2 -right-1 rotate-3 rounded-2xl border border-rose-100 bg-white px-4 py-3 shadow-lg sm:-right-6">
              <p className="text-sm font-semibold text-rose-700">It starts with something in common ✨</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <p className="max-w-sm text-2xl font-semibold leading-snug tracking-tight text-slate-900">
            Not another crowd.
            <br />
            <span className="text-rose-600">A better kind of connection.</span>
          </p>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Gotit helps you meet people through the details that make you,
            you. Share what you love, discover someone new, and make space for
            conversations that feel easy from the start.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-600">
            Simple, by design
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Less awkward. More meaningful.
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            You don’t need a perfect opener. You just need a place to start.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5"
            >
              <div className="flex items-center justify-between">
                <span className={`flex size-12 items-center justify-center rounded-2xl text-2xl ${feature.color}`} aria-hidden="true">
                  {feature.icon}
                </span>
                <span className="text-sm font-semibold text-slate-300">{feature.number}</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-slate-950 px-7 py-14 text-center text-white sm:px-12 sm:py-20">
          <div aria-hidden="true" className="absolute -right-24 -top-32 size-80 rounded-full bg-rose-600/30 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-40 -left-16 size-80 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">
              Your next hello is waiting
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
              Come for the shared interests.
              <br className="hidden sm:block" /> Stay for the conversation.
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-300">
              Make a profile, show up as yourself, and see who you might click with.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-rose-100"
            >
              Get started
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white px-5 py-7 text-center text-sm text-slate-500">
        <p>© 2026 Gotit. Good things start with hello.</p>
      </footer>
    </main>
  );
}
