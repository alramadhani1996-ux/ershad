import { signIn } from "../actions";
import { Field, Notice, SubmitButton, getSearchMessage } from "@/app/forms";
import { getLanguage, translate } from "@/lib/i18n";

export default async function LoginPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const language = await getLanguage();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const { message, error } = await getSearchMessage(searchParams);

  return (
    <main className="form-page">
      <section className="form-card compact">
        <p className="eyebrow">{t("dashboard")}</p>
        <h1>{t("signIn")}</h1>
        <Notice message={message} />
        <Notice message={error} type="error" />
        <form action={signIn} className="stacked-form">
          <Field label={t("email")} name="email" type="email" />
          <Field label={t("password")} name="password" type="password" />
          <SubmitButton>{t("signIn")}</SubmitButton>
        </form>
      </section>
    </main>
  );
}
