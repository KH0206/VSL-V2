"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createProject(projectName: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project")
    .insert({ project_name: projectName });

  if (error) throw new Error(error.message);
  revalidatePath("/projects");
}

export async function updateProject(id: number, projectName: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project")
    .update({ project_name: projectName })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/projects");
}

export async function deleteProject(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("project").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/projects");
}
