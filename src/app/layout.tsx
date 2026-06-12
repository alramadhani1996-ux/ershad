import type { Metadata } from "next";
import { Header } from "./language-switcher";
import { getLanguage, languages } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ershad",
  description: "A bilingual guide marketplace and approval platform powered by Next.js and Supabase.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = await getLanguage();

  return (
    <html lang={language} dir={languages[language].dir}>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
