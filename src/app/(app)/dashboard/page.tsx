import { createClient } from "@/lib/supabase/server";
import { ActionBar } from "@/components/action-bar";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="page-content">
      <ActionBar breadcrumbs={[{ label: "Home" }]} />
      <p className="page-intro">Signed in as {user?.email}</p>
    </div>
  );
}
