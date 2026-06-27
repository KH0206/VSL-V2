"use client";

import { useMemo, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { ColDef } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { ActionBar } from "@/components/action-bar";
import { DataGrid } from "@/components/data-grid";
import { Button } from "@/components/ui/button";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

export function UsersGrid({ rows }: { rows: Profile[] }) {
  const [selectMode, setSelectMode] = useState(false);
  const gridRef = useRef<AgGridReact<Profile>>(null);

  const columnDefs = useMemo<ColDef<Profile>[]>(
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
      { field: "email", flex: 2 },
      { field: "full_name", headerName: "Name", flex: 1 },
      { field: "role", flex: 1 },
      {
        field: "created_at",
        headerName: "Joined",
        flex: 1,
        valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleDateString() : ""),
      },
    ],
    [selectMode],
  );

  return (
    <div className="flex flex-col gap-4">
      <ActionBar
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Users" }]}
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
      <DataGrid<Profile>
        ref={gridRef}
        rowData={rows}
        columnDefs={columnDefs}
        rowSelection={selectMode ? "multiple" : "single"}
      />
    </div>
  );
}
