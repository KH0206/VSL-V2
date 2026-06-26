"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isEditableTable } from "@/config/table-edit";

function assertEditable(table: string) {
  if (!isEditableTable(table)) {
    throw new Error(`Table "${table}" is not in table_edit_ref`);
  }
}

export async function createRow(table: string, values: Record<string, unknown>) {
  assertEditable(table);
  const supabase = await createClient();
  const { error } = await supabase.from(table).insert(values);
  if (error) throw new Error(error.message);
  revalidatePath(`/table-edit/${table}`);
}

export async function updateRow(
  table: string,
  id: number | string,
  values: Record<string, unknown>,
) {
  assertEditable(table);
  const supabase = await createClient();
  const { error } = await supabase.from(table).update(values).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/table-edit/${table}`);
}

export async function deleteRow(table: string, id: number | string) {
  assertEditable(table);
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/table-edit/${table}`);
}
