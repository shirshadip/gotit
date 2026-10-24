"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/profile/actions";

type Profile = {
  id: string;
  name: string;
  tag: string;
  bio: string;
  profile_pic: string | null;
};

const MAX_FILE_MB = 2;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export default function ProfileEditor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(profile.name);
  const [tag, setTag] = useState(profile.tag);
  const [bio, setBio] = useState(profile.bio);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const avatarSrc = preview ?? profile.profile_pic;
  const initial = (profile.name || "?").charAt(0).toUpperCase();
  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60";

  function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
      setError("Choose a PNG, JPEG, WebP, or GIF image.");
      event.target.value = "";
      return;
    }
    if (selectedFile.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Image must be ${MAX_FILE_MB} MB or smaller.`);
      event.target.value = "";
      return;
    }

    setError(null);
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }

  function cancel() {
    setName(profile.name);
    setTag(profile.tag);
    setBio(profile.bio);
    setFile(null);
    setPreview(null);
    setError(null);
    setEditing(false);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("tag", tag);
      formData.set("bio", bio);
      if (file) formData.set("avatar", file);

      const result = await updateProfile(formData);
      if (result.error) {
        setError(result.error);
        return;
      }

      setFile(null);
      setPreview(null);
      setEditing(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
    >
      <div className="h-28 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

      <div className="px-5 pb-6 sm:px-6">
        <div className="-mt-12 flex items-end justify-between gap-3">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 text-3xl font-semibold text-slate-500 shadow">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc}
                  alt="Profile picture"
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </div>

            {editing && (
              <>
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={saving}
                  className="absolute -bottom-1 -right-1 rounded-full bg-indigo-600 p-2 text-white shadow ring-2 ring-white transition hover:bg-indigo-700 disabled:opacity-60"
                  aria-label="Change profile picture"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={onPickFile}
                  disabled={saving}
                  className="hidden"
                />
              </>
            )}
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setEditing(true);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Edit profile
            </button>
          )}
        </div>

        {editing ? (
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                id="name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={30}
                disabled={saving}
                className={inputClass}
                placeholder="Your username"
                autoComplete="nickname"
              />
            </div>

            <div>
              <label htmlFor="tag" className="mb-1 block text-sm font-medium text-slate-700">
                Tag
              </label>
              <div className="flex items-center">
                <span className="rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  #
                </span>
                <input
                  id="tag"
                  name="tag"
                  value={tag.replace(/^#/, "")}
                  onChange={(event) => setTag(event.target.value.replace(/[\s#]/g, ""))}
                  maxLength={20}
                  disabled={saving}
                  className={`${inputClass} rounded-l-none`}
                  placeholder="tag"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="mb-1 block text-sm font-medium text-slate-700">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                maxLength={200}
                rows={4}
                disabled={saving}
                className={`${inputClass} resize-none`}
                placeholder="Tell people about yourself"
              />
              <p className="mt-1 text-right text-xs text-slate-400">{bio.length}/200</p>
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-200">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancel}
                disabled={saving}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving && (
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden="true"
                  />
                )}
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <h1 className="break-words text-2xl font-bold text-slate-900">{profile.name}</h1>
            {profile.tag && (
              <p className="break-all text-sm font-medium text-indigo-600">
                #{profile.tag.replace(/^#/, "")}
              </p>
            )}
            <p className="mt-4 whitespace-pre-wrap break-words text-slate-600">
              {profile.bio || <span className="italic text-slate-400">No bio yet.</span>}
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
