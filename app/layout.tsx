import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ORIENT’IA — Assistant Intelligent d'Orientation Pédagogique ISPM",
  description:
    "Plateforme décisionnelle d'orientation pédagogique de l'ISPM Madagascar. Recommandations explicables croisant prédiction ML et référentiels officiels.",
  icons: {
    icon: "/ISPM.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${workSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-100">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
