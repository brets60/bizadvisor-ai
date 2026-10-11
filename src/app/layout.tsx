import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BizAdvisor AI — Practical AI-Powered Business Advisory Platform",
  description:
    "Empowering entrepreneurs, startups, freelancers, and small business owners with personalized, context-aware AI advisory, business plans, financial planning tools, and growth execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans selection:bg-brand-100 selection:text-brand-900">
        {children}
      </body>
    </html>
  );
}
