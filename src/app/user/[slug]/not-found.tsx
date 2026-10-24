import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ProfileNotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-5xl" aria-hidden="true">🔍</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Profile not found
        </h1>
        <p className="mt-2 max-w-sm text-slate-600">
          This user doesn’t exist, or their account isn’t available.
        </p>
        <Link
          href="/find"
          className="mt-6 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          Back to Find
        </Link>
      </main>
    </>
  );
}