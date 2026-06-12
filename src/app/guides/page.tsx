import { getLanguage, translate } from "@/lib/i18n";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export default async function GuidesPage() {
  const language = await getLanguage();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const admin = createSupabaseAdminClient();
  const { data: guides } = await admin
    .from("guide_applications")
    .select("id, user_id, city, languages, specialties, experience_years, bio, hourly_rate")
    .eq("status", "approved")
    .order("experience_years", { ascending: false });

  return (
    <main className="page-shell admin-shell">
      <section className="panel">
        <p className="eyebrow">{t("guideDirectory")}</p>
        <h1>{t("guideDirectory")}</h1>
        <p>{t("guideDirectoryIntro")}</p>
      </section>

      <section className="directory-grid">
        {guides?.length ? guides.map((guide) => (
          <article className="card guide-card" key={guide.id}>
            <p className="eyebrow">{guide.city}</p>
            <h2>{guide.specialties.join(", ")}</h2>
            <p>{guide.bio}</p>
            <dl className="mini-stats">
              <div><dt>{t("languages")}</dt><dd>{guide.languages.join(", ")}</dd></div>
              <div><dt>{t("experienceYears")}</dt><dd>{guide.experience_years}</dd></div>
              <div><dt>{t("hourlyRate")}</dt><dd>{guide.hourly_rate ? `${guide.hourly_rate}` : "—"}</dd></div>
            </dl>
          </article>
        )) : (
          <article className="panel">
            <p>{t("noItems")}</p>
          </article>
        )}
      </section>
    </main>
  );
}
