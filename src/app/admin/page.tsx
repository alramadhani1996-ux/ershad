import { Notice, getSearchMessage } from "@/app/forms";
import { assignGuideToRequest, reviewCompany, reviewGuide, reviewGuideRequest } from "./actions";
import { requireRole } from "@/lib/auth";
import { getLanguage, translate } from "@/lib/i18n";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

function ReviewButtons({
  id,
  action,
  approveLabel,
  rejectLabel,
}: {
  id: string;
  action: (formData: FormData) => Promise<void>;
  approveLabel: string;
  rejectLabel: string;
}) {
  return (
    <div className="review-actions">
      <form action={action}>
        <input name="id" type="hidden" value={id} />
        <button name="status" value="approved" type="submit">{approveLabel}</button>
      </form>
      <form action={action}>
        <input name="id" type="hidden" value={id} />
        <button className="danger" name="status" value="rejected" type="submit">{rejectLabel}</button>
      </form>
    </div>
  );
}

function SignedFileLink({ href, label }: { href?: string; label: string }) {
  if (!href) {
    return "—";
  }

  return (
    <a href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}

function AssignGuideForm({
  requestId,
  guides,
  label,
}: {
  requestId: string;
  guides: Array<{ user_id: string; city: string; specialties: string[] }>;
  label: string;
}) {
  return (
    <form action={assignGuideToRequest} className="assign-form">
      <input name="id" type="hidden" value={requestId} />
      <select name="guideId" required defaultValue="">
        <option value="" disabled>{label}</option>
        {guides.map((guide) => (
          <option key={guide.user_id} value={guide.user_id}>
            {guide.city} · {guide.specialties.join(", ")}
          </option>
        ))}
      </select>
      <button name="status" value="matched" type="submit">{label}</button>
    </form>
  );
}

export default async function AdminPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  await requireRole("admin");
  const language = await getLanguage();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const { message, error } = await getSearchMessage(searchParams);
  const admin = createSupabaseAdminClient();

  const [guides, companies, requests, approvedGuides] = await Promise.all([
    admin.from("guide_applications").select("*").eq("status", "pending").order("created_at", { ascending: true }),
    admin.from("company_applications").select("*").eq("status", "pending").order("created_at", { ascending: true }),
    admin.from("company_guide_requests").select("*").in("status", ["pending", "approved"]).order("created_at", { ascending: true }),
    admin.from("guide_applications").select("user_id,city,specialties").eq("status", "approved").order("experience_years", { ascending: false }),
  ]);

  const guideDocumentUrls = new Map<string, string>();
  const companyDocumentUrls = new Map<string, string>();
  const requestAttachmentUrls = new Map<string, string>();

  await Promise.all([
    ...(guides.data ?? []).map(async (guide) => {
      if (!guide.license_file_path) return;
      const { data } = await admin.storage.from("guide-documents").createSignedUrl(guide.license_file_path, 60 * 10);
      if (data?.signedUrl) guideDocumentUrls.set(guide.id, data.signedUrl);
    }),
    ...(companies.data ?? []).map(async (company) => {
      if (!company.document_file_path) return;
      const { data } = await admin.storage.from("company-documents").createSignedUrl(company.document_file_path, 60 * 10);
      if (data?.signedUrl) companyDocumentUrls.set(company.id, data.signedUrl);
    }),
    ...(requests.data ?? []).map(async (request) => {
      if (!request.attachment_file_path) return;
      const { data } = await admin.storage.from("request-attachments").createSignedUrl(request.attachment_file_path, 60 * 10);
      if (data?.signedUrl) requestAttachmentUrls.set(request.id, data.signedUrl);
    }),
  ]);

  return (
    <main className="page-shell admin-shell">
      <section className="panel">
        <p className="eyebrow">{t("adminDashboard")}</p>
        <h1>{t("adminDashboard")}</h1>
        <Notice message={message} />
        <Notice message={error} type="error" />
      </section>

      <section className="panel">
        <h2>{t("guideRegistration")}</h2>
        {guides.data?.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>{t("city")}</th><th>{t("specialties")}</th><th>{t("experienceYears")}</th><th>{t("document")}</th><th>{t("actions")}</th></tr></thead>
              <tbody>
                {guides.data.map((guide) => (
                  <tr key={guide.id}>
                    <td>{guide.city}</td>
                    <td>{guide.specialties.join(", ")}</td>
                    <td>{guide.experience_years}</td>
                    <td><SignedFileLink href={guideDocumentUrls.get(guide.id)} label={t("document")} /></td>
                    <td><ReviewButtons id={guide.id} action={reviewGuide} approveLabel={t("approve")} rejectLabel={t("reject")} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p>{t("noItems")}</p>}
      </section>

      <section className="panel">
        <h2>{t("companyRegistration")}</h2>
        {companies.data?.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>{t("companyName")}</th><th>{t("industry")}</th><th>{t("registrationNumber")}</th><th>{t("document")}</th><th>{t("actions")}</th></tr></thead>
              <tbody>
                {companies.data.map((company) => (
                  <tr key={company.id}>
                    <td>{company.company_name}</td>
                    <td>{company.industry}</td>
                    <td>{company.registration_number}</td>
                    <td><SignedFileLink href={companyDocumentUrls.get(company.id)} label={t("document")} /></td>
                    <td><ReviewButtons id={company.id} action={reviewCompany} approveLabel={t("approve")} rejectLabel={t("reject")} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p>{t("noItems")}</p>}
      </section>

      <section className="panel">
        <h2>{t("companyRequest")}</h2>
        {requests.data?.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>{t("serviceTitle")}</th><th>{t("location")}</th><th>{t("requestedLanguage")}</th><th>{t("attachment")}</th><th>{t("assignedGuide")}</th><th>{t("actions")}</th></tr></thead>
              <tbody>
                {requests.data.map((request) => (
                  <tr key={request.id}>
                    <td>{request.title}</td>
                    <td>{request.location}</td>
                    <td>{request.requested_language}</td>
                    <td><SignedFileLink href={requestAttachmentUrls.get(request.id)} label={t("attachment")} /></td>
                    <td>
                      {approvedGuides.data?.length ? (
                        <AssignGuideForm requestId={request.id} guides={approvedGuides.data} label={t("assignGuide")} />
                      ) : t("unassigned")}
                    </td>
                    <td><ReviewButtons id={request.id} action={reviewGuideRequest} approveLabel={t("approve")} rejectLabel={t("reject")} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p>{t("noItems")}</p>}
      </section>
    </main>
  );
}
