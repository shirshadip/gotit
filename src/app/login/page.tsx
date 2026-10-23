import Navbar from "@/components/Navbar";
import LoginButtons from "@/components/login-btn";

export default function LoginPage() {
  return (
    <>
      <Navbar activeHref="/login" />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-4 py-16">
        <section className="flex w-full max-w-md flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Welcome to Gotit
          </p>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900">
            Meet someone new
          </h1>
          <p className="mb-8 text-slate-600">
            Sign in to discover people, share interests, and find meaningful connections.
          </p>
          <LoginButtons />
        </section>
      </main>
    </>
  );
}
