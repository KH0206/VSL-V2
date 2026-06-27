"use client";

import { useMemo, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
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
import { ActionBar } from "@/components/action-bar";
import { DataGrid } from "@/components/data-grid";
import { Button } from "@/components/ui/button";
import type { CategoryTotal } from "./page";

export function ReportView({ rows }: { rows: CategoryTotal[] }) {
  const [selectMode, setSelectMode] = useState(false);
  const gridRef = useRef<AgGridReact<CategoryTotal>>(null);

  const columnDefs = useMemo<ColDef<CategoryTotal>[]>(
    () => [
      {
        headerName: "",
        width: 74,
        maxWidth: 74,
        pinned: "left",
        lockPinned: true,
        sortable: false,
        filter: false,
        suppressMovable: true,
        checkboxSelection: selectMode,
        headerCheckboxSelection: selectMode,
        cellRenderer: () => (
          <div className="flex items-center gap-0.5 pt-0.5">
            <Button variant="ghost" size="icon-xs" disabled aria-label="Edit unavailable">
              <Pencil className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon-xs" disabled aria-label="Delete unavailable">
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
      { field: "category", flex: 1 },
      { field: "order_count", headerName: "Orders", flex: 1 },
      {
        field: "total_amount",
        headerName: "Total",
        flex: 1,
        valueFormatter: (p) => `£${Number(p.value).toFixed(2)}`,
      },
    ],
    [selectMode],
  );

  return (
    <div className="flex flex-col gap-6">
      <ActionBar
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Reports" }]}
        selectActive={selectMode}
        onSelectToggle={() => setSelectMode((v) => !v)}
        doItems={[
          {
            label: "Report Selected",
            onClick: () => gridRef.current?.api.exportDataAsCsv({ onlySelected: true }),
          },
          { label: "Delete Selected", disabled: true },
        ]}
      />
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

      <DataGrid<CategoryTotal>
        ref={gridRef}
        rowData={rows}
        columnDefs={columnDefs}
        rowSelection={selectMode ? "multiple" : "single"}
      />
    </div>
  );
}
