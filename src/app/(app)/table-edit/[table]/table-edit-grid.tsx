"use client";

import { useState, useTransition } from "react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
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

function NewRowDialog({ table, columns }: { table: string; columns: string[] }) {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>New row</DialogTrigger>
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
  const columns = getColumns(rows);
  const [, startTransition] = useTransition();

  function handleDelete(id: number | string) {
    startTransition(async () => {
      await deleteRow(table, id);
    });
  }

  const columnDefs: ColDef<Row>[] = [
    ...columns.map((field) => ({ field, flex: 1 })),
    {
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filter: false,
      cellRenderer: (p: ICellRendererParams<Row>) =>
        p.data ? (
          <div className="flex gap-2">
            <EntityActionsMenu panels={buildPanels(table, p.data, columns)} />
            <WhatsAppButton row={p.data} />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(p.data!.id as number | string)}
            >
              Delete
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        {columns.length > 0 ? (
          <NewRowDialog table={table} columns={columns} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No rows yet — columns can&apos;t be inferred until at least one row exists.
          </p>
        )}
      </div>
      <DataGrid<Row> rowData={rows} columnDefs={columnDefs} />
    </div>
  );
}
