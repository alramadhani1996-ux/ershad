"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

function asString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function asList(formData: FormData, key: string) {
  return asString(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function asNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : null;
}

async function uploadOptionalAttachment(userId: string, file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage.from("request-attachments").upload(path, file, {
    contentType: file.type || "application/octet-stream",
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

export async function createGuideRequest(formData: FormData) {
  const profile = await requireRole("company");

  if (profile.status !== "approved") {
    redirect("/dashboard?error=Your company account must be approved before requesting guides.");
  }

  try {
    const attachmentFilePath = await uploadOptionalAttachment(profile.id, formData.get("attachmentFile"));
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("company_guide_requests").insert({
      company_id: profile.id,
      title: asString(formData, "title"),
      description: asString(formData, "description"),
      location: asString(formData, "location"),
      requested_language: asString(formData, "requestedLanguage"),
      specialties: asList(formData, "specialties"),
      starts_on: asString(formData, "startsOn") || null,
      budget: asNumber(formData, "budget"),
      attachment_file_path: attachmentFilePath,
      status: "pending",
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    redirect(`/company/request-guide?error=${encodeURIComponent(error instanceof Error ? error.message : "Could not create request.")}`);
  }

  redirect("/dashboard?message=Guide request submitted for admin review.");
}
