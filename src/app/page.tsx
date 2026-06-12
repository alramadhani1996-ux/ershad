import { getLanguage, translate } from "@/lib/i18n";

const features = [
  { title: "guideRegistration", href: "/register/guide" },
  { title: "companyRegistration", href: "/register/company" },
  { title: "guideDirectory", href: "/guides" },
  { title: "companyRequest", href: "/company/request-guide" },
] as const;

export default async function Home() {
  const language = await getLanguage();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">Next.js + Supabase</p>
        <h1 id="hero-title">{t("platform")}</h1>
        <p className="hero-copy">{t("tagline")}</p>
        <div className="actions" aria-label="Primary actions">
          <a href="/register/guide">{t("guideRegistration")}</a>
          <a href="/register/company">{t("companyRegistration")}</a>
        </div>
      </section>

      <section className="cards" aria-label="Platform workflows">
        {features.map((feature) => (
          <a className="card" href={feature.href} key={feature.href}>
            <h2>{t(feature.title)}</h2>
            <p>{feature.href}</p>
          </a>
        ))}
      </section>
    </main>
  );
}
