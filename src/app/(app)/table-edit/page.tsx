import Link from "next/link";
import { table_edit_ref } from "@/config/table-edit";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function TableEditPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Table Edit</h1>
      <p className="text-muted-foreground">
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
