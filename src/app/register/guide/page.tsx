import { Field, Notice, SubmitButton, TextArea, getSearchMessage } from "@/app/forms";
import { getLanguage, translate } from "@/lib/i18n";
import { registerGuide } from "../actions";

export default async function GuideRegistrationPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const language = await getLanguage();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const { error } = await getSearchMessage(searchParams);

  return (
    <main className="form-page">
      <section className="form-card">
        <p className="eyebrow">{t("createAccount")}</p>
        <h1>{t("guideRegistration")}</h1>
        <Notice message={error} type="error" />
        <form action={registerGuide} className="grid-form" encType="multipart/form-data">
          <Field label={t("fullName")} name="fullName" />
          <Field label={t("email")} name="email" type="email" />
          <Field label={t("password")} name="password" type="password" />
          <Field label={t("phone")} name="phone" type="tel" required={false} />
          <Field label={t("city")} name="city" />
          <Field label={t("languages")} name="languages" placeholder="Arabic, English" />
          <Field label={t("specialties")} name="specialties" placeholder="Culture, Compliance" />
          <Field label={t("experienceYears")} name="experienceYears" type="number" />
          <Field label={t("hourlyRate")} name="hourlyRate" type="number" required={false} />
          <label className="field">
            <span>{t("licenseFile")}</span>
            <input name="licenseFile" type="file" />
          </label>
          <TextArea label={t("bio")} name="bio" />
          <SubmitButton>{t("submit")}</SubmitButton>
        </form>
      </section>
    </main>
  );
}
