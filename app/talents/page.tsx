import { fetchTalents } from "@/lib/supabase-queries";
import TalentsContent from "./TalentsContent";

export const dynamic = "force-dynamic";

export default async function TalentsPage() {
  const talents = await fetchTalents();

  return <TalentsContent talents={talents} />;
}
