import { redirect } from "next/navigation";
import { AppNav } from "@/components/layout/AppNav";
import { AppProviders } from "@/components/layout/AppProviders";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <AppProviders>
      <AppNav />
      <main className="flex-1 pb-16 lg:pb-0 [&:has(.arena-fullbleed)]:p-0 [&:has(.arena-fullbleed)]:pb-0">
        {children}
      </main>
    </AppProviders>
  );
}
