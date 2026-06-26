import { createClient } from "@/lib/supabase/server";
import { UsersGrid } from "./users-grid";

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Users</h1>
      {error && <p className="text-sm text-destructive">{error.message}</p>}
      <UsersGrid rows={profiles ?? []} />
    </div>
  );
}
