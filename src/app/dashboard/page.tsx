import { Notice, getSearchMessage } from "@/app/forms";
import { requireProfile } from "@/lib/auth";
import { getLanguage, translate } from "@/lib/i18n";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const profile = await requireProfile();
  const language = await getLanguage();
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const { message, error } = await getSearchMessage(searchParams);
  const admin = createSupabaseAdminClient();

  const guideApplication = profile.role === "guide"
    ? await admin.from("guide_applications").select("*").eq("user_id", profile.id).maybeSingle()
    : null;
  const companyApplication = profile.role === "company"
    ? await admin.from("company_applications").select("*").eq("user_id", profile.id).maybeSingle()
    : null;
  const requests = profile.role === "company"
    ? await admin.from("company_guide_requests").select("*").eq("company_id", profile.id).order("created_at", { ascending: false })
    : null;
  const assignedRequests = profile.role === "guide"
    ? await admin.from("company_guide_requests").select("*").eq("assigned_guide_id", profile.id).order("created_at", { ascending: false })
    : null;

  return (
    <main className="page-shell narrow">
      <section className="panel">
        <p className="eyebrow">{profile.role}</p>
        <h1>{t("dashboard")}</h1>
        <Notice message={message} />
        <Notice message={error} type="error" />
        <dl className="profile-list">
          <div><dt>{t("fullName")}</dt><dd>{profile.full_name}</dd></div>
          <div><dt>{t("email")}</dt><dd>{profile.email}</dd></div>
          <div><dt>{t("status")}</dt><dd><span className={`status ${profile.status}`}>{t(profile.status)}</span></dd></div>
        </dl>
        {profile.role === "company" && profile.status === "approved" ? (
          <a className="primary-button inline" href="/company/request-guide">{t("companyRequest")}</a>
        ) : null}
        {profile.role === "admin" ? <a className="primary-button inline" href="/admin">{t("adminDashboard")}</a> : null}
      </section>

      {guideApplication?.data ? (
        <section className="panel">
          <h2>{t("guideRegistration")}</h2>
          <p>{guideApplication.data.bio}</p>
          <p>{guideApplication.data.city} · {guideApplication.data.specialties.join(", ")}</p>
        </section>
      ) : null}

      {companyApplication?.data ? (
        <section className="panel">
          <h2>{companyApplication.data.company_name}</h2>
          <p>{companyApplication.data.industry}</p>
          <p>{companyApplication.data.address}</p>
        </section>
      ) : null}

      {requests?.data ? (
        <section className="panel">
          <h2>{t("companyRequest")}</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>{t("serviceTitle")}</th><th>{t("status")}</th><th>{t("location")}</th><th>{t("assignedGuide")}</th></tr></thead>
              <tbody>
                {requests.data.map((request) => (
                  <tr key={request.id}>
                    <td>{request.title}</td>
                    <td><span className={`status ${request.status}`}>{request.status}</span></td>
                    <td>{request.location}</td>
                    <td>{request.assigned_guide_id ? t("approved") : t("unassigned")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {assignedRequests?.data ? (
        <section className="panel">
          <h2>{t("assignedGuide")}</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>{t("serviceTitle")}</th><th>{t("status")}</th><th>{t("location")}</th><th>{t("startsOn")}</th></tr></thead>
              <tbody>
                {assignedRequests.data.map((request) => (
                  <tr key={request.id}>
                    <td>{request.title}</td>
                    <td><span className={`status ${request.status}`}>{request.status}</span></td>
                    <td>{request.location}</td>
                    <td>{request.starts_on ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
