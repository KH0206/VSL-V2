"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createLink(personId: number, skillId: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("person_skill_link")
    .insert({ person_id: personId, skill_id: skillId });

  if (error) throw new Error(error.message);
  revalidatePath("/person-skills");
  revalidatePath("/table-edit/person");
}

export async function deleteLink(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("person_skill_link").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/person-skills");
  revalidatePath("/table-edit/person");
}

export type PersonSkillsPanelData = {
  allSkills: { id: number; skill: string }[];
  links: { id: number; skill: { id: number; skill: string } | null }[];
};

export async function getPersonSkillsPanelData(personId: number): Promise<PersonSkillsPanelData> {
  const supabase = await createClient();

  const [skillsRes, linksRes] = await Promise.all([
    supabase.from("skill").select("id, skill").order("skill"),
    supabase
      .from("person_skill_link")
      .select("id, skill:skill_id(id, skill)")
      .eq("person_id", personId),
  ]);

  if (skillsRes.error) throw new Error(skillsRes.error.message);
  if (linksRes.error) throw new Error(linksRes.error.message);

  return {
    allSkills: skillsRes.data ?? [],
    links: (linksRes.data as unknown as PersonSkillsPanelData["links"]) ?? [],
  };
}
