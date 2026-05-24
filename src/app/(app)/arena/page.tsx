import { ArenaDashboard } from "@/components/arena/ArenaDashboard";
import { appTitle } from "@/lib/brand";

export const metadata = {
  title: appTitle("Analytics"),
  description: "Crew rankings and training analytics — ClimbCompare",
};

export default function ArenaPage() {
  return <ArenaDashboard />;
}
