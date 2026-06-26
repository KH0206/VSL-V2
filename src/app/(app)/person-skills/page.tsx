import { createClient } from "@/lib/supabase/server";
import { PersonSkillsView } from "./person-skills-view";

export type PersonOption = { id: number; firstname: string; lastname: string };
export type SkillOption = { id: number; skill: string };

export type PersonSkillLink = {
  id: number;
  created_at: string;
  person: PersonOption | null;
  skill: SkillOption | null;
};

export default async function PersonSkillsPage() {
  const supabase = await createClient();

  const [linksRes, peopleRes, skillsRes] = await Promise.all([
    supabase
      .from("person_skill_link")
      .select("id, created_at, person:person_id(id, firstname, lastname), skill:skill_id(id, skill)")
      .order("created_at", { ascending: false }),
    supabase.from("person").select("id, firstname, lastname").order("firstname"),
    supabase.from("skill").select("id, skill").order("skill"),
  ]);

  const error = linksRes.error || peopleRes.error || skillsRes.error;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Person Skills</h1>
      {error && <p className="text-sm text-destructive">{error.message}</p>}
      <PersonSkillsView
        links={(linksRes.data as unknown as PersonSkillLink[]) ?? []}
        people={peopleRes.data ?? []}
        skills={skillsRes.data ?? []}
      />
    </div>
  );
}
