import { cookies } from "next/headers";

export type Language = "en" | "ar";

export const languageCookieName = "ershad-language";

export const languages: Record<Language, { label: string; dir: "ltr" | "rtl" }> = {
  en: { label: "English", dir: "ltr" },
  ar: { label: "العربية", dir: "rtl" },
};

const dictionary = {
  en: {
    platform: "Ershad Platform",
    tagline: "Connect certified guides with companies that need expert support.",
    guideRegistration: "Guide registration",
    guideDirectory: "Guide directory",
    guideDirectoryIntro: "Browse approved guides and their specialties before submitting a company request.",
    companyRegistration: "Company registration",
    adminDashboard: "Admin dashboard",
    companyRequest: "Request a guide",
    dashboard: "Dashboard",
    signIn: "Sign in",
    signOut: "Sign out",
    createAccount: "Create account",
    fullName: "Full name",
    email: "Email",
    password: "Password",
    phone: "Phone",
    city: "City",
    languages: "Languages",
    specialties: "Specialties",
    experienceYears: "Years of experience",
    bio: "Bio",
    hourlyRate: "Hourly rate",
    licenseFile: "License or certification file",
    companyName: "Company name",
    registrationNumber: "Commercial registration number",
    industry: "Industry",
    website: "Website",
    address: "Address",
    document: "Registration document",
    attachment: "Attachment",
    submit: "Submit",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    serviceTitle: "Service title",
    serviceDetails: "Service details",
    startsOn: "Preferred start date",
    location: "Location",
    budget: "Budget",
    requestedLanguage: "Requested language",
    status: "Status",
    actions: "Actions",
    approve: "Approve",
    reject: "Reject",
    noItems: "No records to show yet.",
    assignGuide: "Assign guide",
    assignedGuide: "Assigned guide",
    unassigned: "Unassigned",
  },
  ar: {
    platform: "منصة إرشاد",
    tagline: "نربط المرشدين المعتمدين بالشركات التي تحتاج إلى دعم متخصص.",
    guideRegistration: "تسجيل مرشد",
    guideDirectory: "دليل المرشدين",
    guideDirectoryIntro: "تصفح المرشدين المعتمدين وتخصصاتهم قبل إرسال طلب شركة.",
    companyRegistration: "تسجيل شركة",
    adminDashboard: "لوحة تحكم الإدارة",
    companyRequest: "طلب مرشد",
    dashboard: "لوحة التحكم",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    createAccount: "إنشاء حساب",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    phone: "الهاتف",
    city: "المدينة",
    languages: "اللغات",
    specialties: "التخصصات",
    experienceYears: "سنوات الخبرة",
    bio: "نبذة",
    hourlyRate: "الأجر بالساعة",
    licenseFile: "ملف الترخيص أو الشهادة",
    companyName: "اسم الشركة",
    registrationNumber: "رقم السجل التجاري",
    industry: "القطاع",
    website: "الموقع الإلكتروني",
    address: "العنوان",
    document: "وثيقة التسجيل",
    attachment: "مرفق",
    submit: "إرسال",
    pending: "قيد المراجعة",
    approved: "مقبول",
    rejected: "مرفوض",
    serviceTitle: "عنوان الخدمة",
    serviceDetails: "تفاصيل الخدمة",
    startsOn: "تاريخ البدء المفضل",
    location: "الموقع",
    budget: "الميزانية",
    requestedLanguage: "اللغة المطلوبة",
    status: "الحالة",
    actions: "الإجراءات",
    approve: "قبول",
    reject: "رفض",
    noItems: "لا توجد سجلات بعد.",
    assignGuide: "تعيين مرشد",
    assignedGuide: "المرشد المعين",
    unassigned: "غير معين",
  },
} satisfies Record<Language, Record<string, string>>;

export type TranslationKey = keyof (typeof dictionary)["en"];

export async function getLanguage(): Promise<Language> {
  const store = await cookies();
  const value = store.get(languageCookieName)?.value;
  return value === "ar" ? "ar" : "en";
}

export function translate(language: Language, key: TranslationKey): string {
  return dictionary[language][key];
}
