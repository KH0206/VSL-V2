"use client";

import type { ColDef } from "ag-grid-community";
import { DataGrid } from "@/components/data-grid";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

const columnDefs: ColDef<Profile>[] = [
  { field: "email", flex: 2 },
  { field: "full_name", headerName: "Name", flex: 1 },
  { field: "role", flex: 1 },
  {
    field: "created_at",
    headerName: "Joined",
    flex: 1,
    valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleDateString() : ""),
  },
];

export function UsersGrid({ rows }: { rows: Profile[] }) {
  return <DataGrid<Profile> rowData={rows} columnDefs={columnDefs} />;
}
