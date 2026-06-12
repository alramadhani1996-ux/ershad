import { setLanguage, signOut } from "./actions";
import { getCurrentProfile } from "@/lib/auth";
import { getLanguage, languages, translate } from "@/lib/i18n";

export async function Header() {
  const language = await getLanguage();
  const profile = await getCurrentProfile().catch(() => null);
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  return (
    <header className="site-header">
      <a className="brand" href="/">
        {t("platform")}
      </a>
      <nav className="nav-links" aria-label="Main navigation">
        <a href="/register/guide">{t("guideRegistration")}</a>
        <a href="/register/company">{t("companyRegistration")}</a>
        <a href="/guides">{t("guideDirectory")}</a>
        <a href="/company/request-guide">{t("companyRequest")}</a>
        <a href="/admin">{t("adminDashboard")}</a>
        {profile ? <a href="/dashboard">{t("dashboard")}</a> : <a href="/auth/login">{t("signIn")}</a>}
      </nav>
      <div className="header-actions">
        <form action={setLanguage} className="language-form" aria-label="Language switcher">
          {(Object.keys(languages) as Array<keyof typeof languages>).map((item) => (
            <button key={item} name="language" value={item} type="submit" aria-pressed={language === item}>
              {languages[item].label}
            </button>
          ))}
        </form>
        {profile ? (
          <form action={signOut}>
            <button className="text-button" type="submit">
              {t("signOut")}
            </button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
