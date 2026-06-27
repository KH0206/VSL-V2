"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { ActionBar } from "@/components/action-bar";
import { DataGrid } from "@/components/data-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EntityActionsMenu, type EntityPanel } from "@/components/entity-actions-menu";
import { getExtraPanels } from "@/config/entity-panels";
import { createRow, deleteRow, updateRow } from "./actions";

type Row = Record<string, unknown>;

const READ_ONLY_FIELDS = new Set(["id", "created_at"]);

function buildWhatsAppLink(row: Row): string | null {
  const raw = (row.whatsapp ?? row.phone) as string | undefined;
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

function WhatsAppButton({ row }: { row: Row }) {
  const link = buildWhatsAppLink(row);
  if (!link) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      render={<a href={link} target="_blank" rel="noopener noreferrer" />}
      nativeButton={false}
    >
      WhatsApp
    </Button>
  );
}

function getColumns(rows: Row[]): string[] {
  const keys = new Set<string>();
  for (const row of rows) {
    Object.keys(row).forEach((k) => keys.add(k));
  }
  return Array.from(keys);
}

function coerceValue(original: unknown, raw: string): unknown {
  if (typeof original === "number") {
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }
  return raw;
}

function RowFormFields({
  columns,
  values,
  original,
  onChange,
}: {
  columns: string[];
  values: Record<string, string>;
  original: Row;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {columns
        .filter((c) => !READ_ONLY_FIELDS.has(c))
        .map((field) => (
          <div key={field} className="flex flex-col gap-1">
            <Label htmlFor={`field-${field}`}>{field}</Label>
            <Input
              id={`field-${field}`}
              value={values[field] ?? ""}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder={typeof original[field]}
            />
          </div>
        ))}
    </div>
  );
}

function DetailsPanelContent({
  table,
  row,
  columns,
  onClose,
}: {
  table: string;
  row: Row;
  columns: string[];
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(columns.map((c) => [c, String(row[c] ?? "")])),
  );
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const updates: Record<string, unknown> = {};
      for (const field of columns) {
        if (READ_ONLY_FIELDS.has(field)) continue;
        updates[field] = coerceValue(row[field], values[field] ?? "");
      }
      await updateRow(table, row.id as number | string, updates);
      onClose();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <RowFormFields
        columns={columns}
        values={values}
        original={row}
        onChange={(field, value) => setValues((v) => ({ ...v, [field]: value }))}
      />
      <DialogFooter>
        <Button onClick={handleSave} disabled={pending}>
          Save
        </Button>
      </DialogFooter>
    </div>
  );
}

function buildPanels(table: string, row: Row, columns: string[]): EntityPanel[] {
  return [
    {
      key: "details",
      label: "Details",
      render: (close) => (
        <DetailsPanelContent table={table} row={row} columns={columns} onClose={close} />
      ),
    },
    ...getExtraPanels(table, row),
  ];
}

function NewRowDialog({
  table,
  columns,
  open,
  onOpenChange,
}: {
  table: string;
  columns: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(columns.filter((c) => !READ_ONLY_FIELDS.has(c)).map((c) => [c, ""])),
  );
  const [pending, startTransition] = useTransition();

  function handleCreate() {
    startTransition(async () => {
      const newValues: Record<string, unknown> = {};
      for (const field of columns) {
        if (READ_ONLY_FIELDS.has(field)) continue;
        if (values[field]) newValues[field] = values[field];
      }
      await createRow(table, newValues);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New row</DialogTitle>
        </DialogHeader>
        <RowFormFields
          columns={columns}
          values={values}
          original={{}}
          onChange={(field, value) => setValues((v) => ({ ...v, [field]: value }))}
        />
        <DialogFooter>
          <Button onClick={handleCreate} disabled={pending}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TableEditGrid({ table, rows }: { table: string; rows: Row[] }) {
  const [selectMode, setSelectMode] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const columns = getColumns(rows);
  const [, startTransition] = useTransition();
  const gridRef = useRef<AgGridReact<Row>>(null);

  function handleDelete(id: number | string) {
    startTransition(async () => {
      await deleteRow(table, id);
    });
  }

  function handleDeleteSelected() {
    const selected = gridRef.current?.api.getSelectedRows() ?? [];
    if (selected.length === 0) return;

    startTransition(async () => {
      await Promise.all(
        selected
          .filter((row) => row.id !== undefined)
          .map((row) => deleteRow(table, row.id as number | string)),
      );
    });
  }

  const columnDefs = useMemo<ColDef<Row>[]>(
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
        cellRenderer: (p: ICellRendererParams<Row>) =>
          p.data ? (
            <div className="flex items-center gap-0.5 pt-0.5">
              <EntityActionsMenu
                panels={buildPanels(table, p.data, columns)}
                triggerLabel="Edit row"
                triggerContent={<Pencil className="size-3.5" />}
              />
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Delete row"
                onClick={() => handleDelete(p.data!.id as number | string)}
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          ) : null,
      },
      ...columns.map((field) => ({ field, flex: 1 })),
      {
        headerName: "Contact",
        width: 96,
        sortable: false,
        filter: false,
        cellRenderer: (p: ICellRendererParams<Row>) => (p.data ? <WhatsAppButton row={p.data} /> : null),
      },
    ],
    [columns, selectMode, table],
  );

  return (
    <div className="flex flex-col gap-4">
      <ActionBar
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Edit", href: "/table-edit" },
          { label: table },
        ]}
        selectActive={selectMode}
        onSelectToggle={() => setSelectMode((v) => !v)}
        doItems={[
          { label: "Delete Selected", onClick: handleDeleteSelected },
          {
            label: "Report Selected",
            onClick: () => gridRef.current?.api.exportDataAsCsv({ onlySelected: true }),
          },
        ]}
        onNew={columns.length > 0 ? () => setNewOpen(true) : undefined}
        newLabel="New"
      />
      {columns.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No rows yet — columns can&apos;t be inferred until at least one row exists.
        </p>
      ) : null}
      <DataGrid<Row>
        ref={gridRef}
        rowData={rows}
        columnDefs={columnDefs}
        enableFilters={table === "person"}
        rowSelection={selectMode ? "multiple" : "single"}
      />
      {columns.length > 0 ? (
        <NewRowDialog table={table} columns={columns} open={newOpen} onOpenChange={setNewOpen} />
      ) : null}
    </div>
  );
}
