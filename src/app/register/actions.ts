"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { ApprovalStatus, UserRole } from "@/lib/supabase/types";

function asString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function asNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : null;
}

function asList(formData: FormData, key: string) {
  return asString(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function uploadOptionalFile(bucket: string, userId: string, file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

async function createAuthUser(formData: FormData, role: UserRole) {
  const fullName = asString(formData, "fullName");
  const email = asString(formData, "email");
  const password = asString(formData, "password");
  const phone = asString(formData, "phone") || null;

  if (!fullName || !email || !password) {
    throw new Error("Full name, email, and password are required.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        role,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Could not create the user account.");
  }

  const admin = createSupabaseAdminClient();
  await admin.from("profiles").upsert({
    id: data.user.id,
    email,
    full_name: fullName,
    phone,
    role,
    status: "pending" satisfies ApprovalStatus,
  });

  return data.user.id;
}

export async function registerGuide(formData: FormData) {
  try {
    const userId = await createAuthUser(formData, "guide");
    const licenseFilePath = await uploadOptionalFile("guide-documents", userId, formData.get("licenseFile"));
    const admin = createSupabaseAdminClient();

    const { error } = await admin.from("guide_applications").insert({
      user_id: userId,
      city: asString(formData, "city"),
      languages: asList(formData, "languages"),
      specialties: asList(formData, "specialties"),
      experience_years: asNumber(formData, "experienceYears") ?? 0,
      bio: asString(formData, "bio"),
      hourly_rate: asNumber(formData, "hourlyRate"),
      license_file_path: licenseFilePath,
      status: "pending",
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    redirect(`/register/guide?error=${encodeURIComponent(error instanceof Error ? error.message : "Registration failed.")}`);
  }

  redirect("/auth/login?message=Guide application submitted. Sign in to track approval status.");
}

export async function registerCompany(formData: FormData) {
  try {
    const userId = await createAuthUser(formData, "company");
    const documentFilePath = await uploadOptionalFile("company-documents", userId, formData.get("documentFile"));
    const admin = createSupabaseAdminClient();

    const { error } = await admin.from("company_applications").insert({
      user_id: userId,
      company_name: asString(formData, "companyName"),
      registration_number: asString(formData, "registrationNumber"),
      industry: asString(formData, "industry"),
      website: asString(formData, "website") || null,
      address: asString(formData, "address"),
      document_file_path: documentFilePath,
      status: "pending",
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    redirect(`/register/company?error=${encodeURIComponent(error instanceof Error ? error.message : "Registration failed.")}`);
  }

  redirect("/auth/login?message=Company application submitted. Sign in to track approval status.");
}
