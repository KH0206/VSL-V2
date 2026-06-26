import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isEditableTable } from "@/config/table-edit";
import { TableEditGrid } from "./table-edit-grid";

export default async function TableEditTablePage({
  params,
}: {
  params: Promise<{ table: string }>;
}) {
  const { table } = await params;

  if (!isEditableTable(table)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase.from(table).select("*");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Table Edit: {table}</h1>
      {error && <p className="text-sm text-destructive">{error.message}</p>}
      <TableEditGrid table={table} rows={rows ?? []} />
    </div>
  );
}
