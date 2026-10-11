import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  // Redirect to onboarding if not completed yet
  if (!user.business_profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const clientUserData = {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    country: user.country,
    currency: user.preferred_currency,
    businessProfile: user.business_profile,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={clientUserData} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={clientUserData} />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
