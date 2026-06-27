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
import type { Project } from "./page";
import { createProject, deleteProject, updateProject } from "./actions";

function ActionsCell({ data }: ICellRendererParams<Project>) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(data?.project_name ?? "");
  const [pending, startTransition] = useTransition();

  if (!data) return null;

  const project = data;

  function handleSave() {
    startTransition(async () => {
      await updateProject(project.id, name);
      setOpen(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteProject(project.id);
    });
  }

  return (
    <div className="flex items-center gap-0.5 pt-0.5">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="ghost" size="icon-xs" aria-label="Edit row" />}>
          <Pencil className="size-3.5" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`edit-${data.id}`}>Project name</Label>
            <Input
              id={`edit-${data.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={pending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Delete row"
        onClick={handleDelete}
        disabled={pending}
      >
        <Trash2 className="size-3.5 text-destructive" />
      </Button>
    </div>
  );
}

function NewProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  function handleCreate() {
    startTransition(async () => {
      await createProject(name);
      setName("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-project-name">Project name</Label>
          <Input
            id="new-project-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={pending || !name.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectsGrid({ rows }: { rows: Project[] }) {
  const [selectMode, setSelectMode] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [, startTransition] = useTransition();
  const gridRef = useRef<AgGridReact<Project>>(null);

  function handleDeleteSelected() {
    const selected = gridRef.current?.api.getSelectedRows() ?? [];
    if (selected.length === 0) return;

    startTransition(async () => {
      await Promise.all(selected.map((row) => deleteProject(row.id)));
    });
  }

  const columnDefs = useMemo<ColDef<Project>[]>(
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
        cellRenderer: ActionsCell,
      },
      { field: "project_name", headerName: "Name", flex: 2 },
      {
        field: "created_at",
        headerName: "Created",
        flex: 1,
        valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleDateString() : ""),
      },
    ],
    [selectMode],
  );

  return (
    <div className="flex flex-col gap-4">
      <ActionBar
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Projects" }]}
        selectActive={selectMode}
        onSelectToggle={() => setSelectMode((v) => !v)}
        doItems={[
          { label: "Delete Selected", onClick: handleDeleteSelected },
          {
            label: "Report Selected",
            onClick: () => gridRef.current?.api.exportDataAsCsv({ onlySelected: true }),
          },
        ]}
        onNew={() => setNewOpen(true)}
        newLabel="New"
      />
      <DataGrid<Project>
        ref={gridRef}
        rowData={rows}
        columnDefs={columnDefs}
        rowSelection={selectMode ? "multiple" : "single"}
      />
      <NewProjectDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}
