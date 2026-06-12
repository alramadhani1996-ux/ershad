import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ApprovalStatus, UserRole } from "@/lib/supabase/types";

export interface AuthProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  status: ApprovalStatus;
}

export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id,email,full_name,phone,role,status")
    .eq("id", user.id)
    .single();

  return data;
}

export async function requireProfile() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login?message=Please sign in first.");
  }

  return profile;
}

export async function requireRole(role: UserRole) {
  const profile = await requireProfile();

  if (profile.role !== role) {
    redirect("/dashboard?message=You do not have access to that page.");
  }

  return profile;
}

export function isApproved(profile: AuthProfile) {
  return profile.status === "approved";
}
