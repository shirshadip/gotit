"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedProfile } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const AVATAR_TYPES = {
  "image/png": { extension: "png", signature: [137, 80, 78, 71, 13, 10, 26, 10] },
  "image/jpeg": { extension: "jpg", signature: [255, 216, 255] },
  "image/webp": { extension: "webp", signature: null },
  "image/gif": { extension: "gif", signature: null },
} as const;

type UpdateProfileResult = { error?: string };

function getStringField(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" ? value : null;
}

function hasSignature(bytes: Uint8Array, signature: readonly number[]): boolean {
  return signature.every((byte, index) => bytes[index] === byte);
}

async function isValidAvatar(file: File, mimeType: keyof typeof AVATAR_TYPES) {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (mimeType === "image/webp") {
    return (
      String.fromCharCode(...header.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...header.slice(8, 12)) === "WEBP"
    );
  }

  if (mimeType === "image/gif") {
    const signature = String.fromCharCode(...header.slice(0, 6));
    return signature === "GIF87a" || signature === "GIF89a";
  }

  return hasSignature(header, AVATAR_TYPES[mimeType].signature);
}

async function removeUploadedAvatar(path: string) {
  try {
    const { error } = await getSupabaseAdmin()
      .storage.from("avatars")
      .remove([path]);
    if (error) {
      console.error("Unable to remove profile avatar after failed update:", {
        code: error.name,
        path,
      });
    }
  } catch (error) {
    console.error("Unable to remove profile avatar after failed update:", {
      path,
      error,
    });
  }
}

export async function updateProfile(
  formData: FormData
): Promise<UpdateProfileResult> {
  let uploadedPath: string | null = null;

  try {
    const profile = await getAuthenticatedProfile();
    if (!profile) {
      return { error: "You must be signed in to update your profile." };
    }

    const rawName = getStringField(formData, "name");
    const rawTag = getStringField(formData, "tag");
    const rawBio = getStringField(formData, "bio");

    if (rawName === null || rawTag === null || rawBio === null) {
      return { error: "Please complete all profile fields." };
    }

    const name = rawName.trim();
    const tag = rawTag.replace(/^#+/, "").replace(/\s/g, "");
    const bio = rawBio.trim();

    if (!name) {
      return { error: "Username can't be empty." };
    }
    if (name.length > 30) {
      return { error: "Username must be 30 characters or fewer." };
    }
    if (tag.length > 20) {
      return { error: "Tag must be 20 characters or fewer." };
    }
    if (bio.length > 200) {
      return { error: "Bio must be 200 characters or fewer." };
    }

    const avatarValue = formData.get("avatar");
    if (avatarValue !== null && typeof avatarValue === "string") {
      return { error: "Please choose a valid image file." };
    }

    let avatar: File | null = avatarValue;
    if (avatar && avatar.size === 0 && !avatar.name) {
      avatar = null;
    }

    if (avatar && avatar.size > MAX_AVATAR_SIZE) {
      return { error: "Image must be 2 MB or smaller." };
    }

    let extension: string | null = null;
    if (avatar) {
      if (!Object.prototype.hasOwnProperty.call(AVATAR_TYPES, avatar.type)) {
        return { error: "Choose a PNG, JPEG, WebP, or GIF image." };
      }

      const mimeType = avatar.type as keyof typeof AVATAR_TYPES;
      if (!(await isValidAvatar(avatar, mimeType))) {
        return { error: "The selected file is not a valid image." };
      }

      extension = AVATAR_TYPES[mimeType].extension;
    }

    const supabase = getSupabaseAdmin();
    let profilePic: string | null = profile.profile_pic ?? null;

    if (avatar && extension) {
      uploadedPath = `${profile.id}/${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(uploadedPath, avatar, {
          cacheControl: "3600",
          contentType: avatar.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Profile avatar upload failed:", {
          code: uploadError.name,
        });
        uploadedPath = null;
        return { error: "Unable to upload your profile picture. Please try again." };
      }

      profilePic = supabase.storage.from("avatars").getPublicUrl(uploadedPath)
        .data.publicUrl;
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ name, tag, bio, profile_pic: profilePic })
      .eq("id", profile.id)
      .select("id")
      .maybeSingle();

    if (updateError || !updatedProfile) {
      if (uploadedPath) {
        await removeUploadedAvatar(uploadedPath);
        uploadedPath = null;
      }

      if (updateError?.code === "23505") {
        return { error: "That username is already taken." };
      }

      console.error("Profile database update failed:", {
        code: updateError?.code ?? "NO_PROFILE_UPDATED",
      });
      return { error: "Unable to update your profile. Please try again." };
    }

    uploadedPath = null;
    revalidatePath("/profile");
    return {};
  } catch (error) {
    if (uploadedPath) {
      await removeUploadedAvatar(uploadedPath);
    }

    console.error("Profile update action failed:", error);
    return { error: "Unable to update your profile. Please try again." };
  }
}
