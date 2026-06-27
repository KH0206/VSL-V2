"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type AllocationInput = {
  projectId: number;
  personId: number | null;
  assetId: number | null;
  startsOn: string;
  endsOn: string;
  notes?: string | null;
};

export async function createAllocation(input: AllocationInput) {
  const supabase = await createClient();
  const payload = {
    project_id: input.projectId,
    person_id: input.personId,
    asset_id: input.assetId,
    starts_on: input.startsOn,
    ends_on: input.endsOn,
    notes: input.notes?.trim() ? input.notes.trim() : null,
  };

  const { error } = await supabase.from("project_allocation").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard-overview");
  revalidatePath("/table-edit/project_allocation");
}

export async function updateAllocation(id: number, input: AllocationInput) {
  const supabase = await createClient();
  const payload = {
    project_id: input.projectId,
    person_id: input.personId,
    asset_id: input.assetId,
    starts_on: input.startsOn,
    ends_on: input.endsOn,
    notes: input.notes?.trim() ? input.notes.trim() : null,
  };

  const { error } = await supabase.from("project_allocation").update(payload).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard-overview");
  revalidatePath("/table-edit/project_allocation");
}

export async function updateAllocationDates(id: number, startsOn: string, endsOn: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_allocation")
    .update({ starts_on: startsOn, ends_on: endsOn })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard-overview");
  revalidatePath("/table-edit/project_allocation");
}

export async function updateAllocationGrouping(
  id: number,
  projectId: number,
  personId: number | null,
  assetId: number | null,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_allocation")
    .update({
      project_id: projectId,
      person_id: personId,
      asset_id: assetId,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard-overview");
  revalidatePath("/table-edit/project_allocation");
}

export async function deleteAllocation(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("project_allocation").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard-overview");
  revalidatePath("/table-edit/project_allocation");
}
