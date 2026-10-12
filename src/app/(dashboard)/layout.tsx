import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";

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

  return <AppShell user={clientUserData}>{children}</AppShell>;
}
