import { createClient } from "@/lib/supabase/server";
import { ProjectsGrid } from "./projects-grid";

export type Project = {
  id: number;
  created_at: string;
  project_name: string | null;
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects, error } = await supabase
    .from("project")
    .select("id, created_at, project_name")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Projects</h1>
      {error && <p className="text-sm text-destructive">{error.message}</p>}
      <ProjectsGrid rows={projects ?? []} />
    </div>
  );
}
