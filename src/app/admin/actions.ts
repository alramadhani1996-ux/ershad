"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { ApprovalStatus, RequestStatus } from "@/lib/supabase/types";

function requireId(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    throw new Error("Missing id.");
  }
  return id;
}

async function requireAdminId() {
  const profile = await requireRole("admin");
  return profile.id;
}

export async function reviewGuide(formData: FormData) {
  const adminId = await requireAdminId();
  const id = requireId(formData);
  const status = (formData.get("status") === "approved" ? "approved" : "rejected") satisfies ApprovalStatus;
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("guide_applications")
    .update({ status, reviewed_by: adminId, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .select("user_id")
    .single();

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  await admin.from("profiles").update({ status }).eq("id", data.user_id);
  redirect("/admin?message=Guide application reviewed.");
}

export async function reviewCompany(formData: FormData) {
  const adminId = await requireAdminId();
  const id = requireId(formData);
  const status = (formData.get("status") === "approved" ? "approved" : "rejected") satisfies ApprovalStatus;
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("company_applications")
    .update({ status, reviewed_by: adminId, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .select("user_id")
    .single();

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  await admin.from("profiles").update({ status }).eq("id", data.user_id);
  redirect("/admin?message=Company application reviewed.");
}

export async function reviewGuideRequest(formData: FormData) {
  const adminId = await requireAdminId();
  const id = requireId(formData);
  const status = (formData.get("status") === "approved" ? "approved" : "rejected") satisfies RequestStatus;
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("company_guide_requests")
    .update({ status, reviewed_by: adminId, reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin?message=Guide request reviewed.");
}

export async function assignGuideToRequest(formData: FormData) {
  const adminId = await requireAdminId();
  const id = requireId(formData);
  const guideId = String(formData.get("guideId") ?? "").trim();

  if (!guideId) {
    redirect("/admin?error=Please select a guide to assign.");
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("company_guide_requests")
    .update({
      assigned_guide_id: guideId,
      status: "matched",
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin?message=Guide assigned to request.");
}
