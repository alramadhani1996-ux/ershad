import { Field, Notice, SubmitButton, getSearchMessage } from "@/app/forms";
import { getLanguage, translate } from "@/lib/i18n";
import { registerCompany } from "../actions";

export default async function CompanyRegistrationPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const language = await getLanguage();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const { error } = await getSearchMessage(searchParams);

  return (
    <main className="form-page">
      <section className="form-card">
        <p className="eyebrow">{t("createAccount")}</p>
        <h1>{t("companyRegistration")}</h1>
        <Notice message={error} type="error" />
        <form action={registerCompany} className="grid-form" encType="multipart/form-data">
          <Field label={t("fullName")} name="fullName" />
          <Field label={t("email")} name="email" type="email" />
          <Field label={t("password")} name="password" type="password" />
          <Field label={t("phone")} name="phone" type="tel" required={false} />
          <Field label={t("companyName")} name="companyName" />
          <Field label={t("registrationNumber")} name="registrationNumber" />
          <Field label={t("industry")} name="industry" />
          <Field label={t("website")} name="website" type="url" required={false} />
          <Field label={t("address")} name="address" />
          <label className="field">
            <span>{t("document")}</span>
            <input name="documentFile" type="file" />
          </label>
          <SubmitButton>{t("submit")}</SubmitButton>
        </form>
      </section>
    </main>
  );
}
