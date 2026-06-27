import Link from "next/link";
import { table_edit_ref } from "@/config/table-edit";
import { ActionBar } from "@/components/action-bar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function TableEditPage() {
  return (
    <div className="page-content">
      <ActionBar
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Edit" }]}
      />
      <p className="page-intro">
        Tables available for editing (configured in src/config/table-edit.ts)
      </p>
      <div className="grid max-w-sm gap-3">
        {table_edit_ref.map((table) => (
          <Link key={table} href={`/table-edit/${table}`}>
            <Card className="hover:bg-muted">
              <CardHeader>
                <CardTitle className="text-base">{table}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
