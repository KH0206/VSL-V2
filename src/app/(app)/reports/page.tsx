import { createClient } from "@/lib/supabase/server";
import { ReportView } from "./report-view";

export type CategoryTotal = {
  category: string;
  total_amount: number;
  order_count: number;
};

export default async function ReportsPage() {
  const supabase = await createClient();

  // Calls the report_totals_by_category() Postgres function (stored procedure)
  // defined in supabase/migrations/0003_report_by_category.sql.
  const { data, error } = await supabase.rpc("report_totals_by_category");

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-destructive">{error.message}</p>}
      <ReportView rows={(data as CategoryTotal[]) ?? []} />
    </div>
  );
}
