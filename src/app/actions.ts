"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { languageCookieName, type Language } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function setLanguage(formData: FormData) {
  const language = formData.get("language") === "ar" ? "ar" : "en";
  const store = await cookies();
  store.set(languageCookieName, language satisfies Language, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/login?message=Signed out.");
}
