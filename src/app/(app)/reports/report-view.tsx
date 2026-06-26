"use client";

import { useRef } from "react";
import type { ColDef } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DataGrid } from "@/components/data-grid";
import { Button } from "@/components/ui/button";
import type { CategoryTotal } from "./page";

const columnDefs: ColDef<CategoryTotal>[] = [
  { field: "category", flex: 1 },
  { field: "order_count", headerName: "Orders", flex: 1 },
  {
    field: "total_amount",
    headerName: "Total",
    flex: 1,
    valueFormatter: (p) => `£${Number(p.value).toFixed(2)}`,
  },
];

export function ReportView({ rows }: { rows: CategoryTotal[] }) {
  const gridRef = useRef<AgGridReact<CategoryTotal>>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_amount" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => gridRef.current?.api.exportDataAsCsv()}
        >
          Export CSV
        </Button>
      </div>

      <DataGrid<CategoryTotal> ref={gridRef} rowData={rows} columnDefs={columnDefs} />
    </div>
  );
}
