import { Field, Notice, SubmitButton, TextArea, getSearchMessage } from "@/app/forms";
import { createGuideRequest } from "../actions";
import { requireRole } from "@/lib/auth";
import { getLanguage, translate } from "@/lib/i18n";

export default async function RequestGuidePage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const profile = await requireRole("company");
  const language = await getLanguage();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const { error } = await getSearchMessage(searchParams);

  return (
    <main className="form-page">
      <section className="form-card">
        <p className="eyebrow">{profile.full_name}</p>
        <h1>{t("companyRequest")}</h1>
        {profile.status !== "approved" ? <Notice type="error" message="Your company account is still pending admin approval." /> : null}
        <Notice message={error} type="error" />
        <form action={createGuideRequest} className="grid-form" encType="multipart/form-data">
          <Field label={t("serviceTitle")} name="title" />
          <Field label={t("location")} name="location" />
          <Field label={t("requestedLanguage")} name="requestedLanguage" placeholder="Arabic" />
          <Field label={t("specialties")} name="specialties" placeholder="Tourism, Onboarding" />
          <Field label={t("startsOn")} name="startsOn" type="date" required={false} />
          <Field label={t("budget")} name="budget" type="number" required={false} />
          <label className="field">
            <span>{t("attachment")}</span>
            <input name="attachmentFile" type="file" />
          </label>
          <TextArea label={t("serviceDetails")} name="description" />
          <SubmitButton>{t("submit")}</SubmitButton>
        </form>
      </section>
    </main>
  );
}
