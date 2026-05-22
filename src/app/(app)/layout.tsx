import { redirect } from "next/navigation";
import { AppNav } from "@/components/layout/AppNav";
import { LiveTicker } from "@/components/layout/LiveTicker";
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
    <>
      <LiveTicker />
      <AppNav />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
    </>
  );
}
