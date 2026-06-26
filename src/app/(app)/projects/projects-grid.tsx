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
    <div className="flex gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          Edit
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
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={pending}
      >
        Delete
      </Button>
    </div>
  );
}

function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  function handleCreate() {
    startTransition(async () => {
      await createProject(name);
      setName("");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>New project</DialogTrigger>
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

const columnDefs: ColDef<Project>[] = [
  { field: "project_name", headerName: "Name", flex: 2 },
  {
    field: "created_at",
    headerName: "Created",
    flex: 1,
    valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleDateString() : ""),
  },
  {
    headerName: "Actions",
    flex: 1,
    cellRenderer: ActionsCell,
    sortable: false,
    filter: false,
  },
];

export function ProjectsGrid({ rows }: { rows: Project[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <NewProjectDialog />
      </div>
      <DataGrid<Project> rowData={rows} columnDefs={columnDefs} />
    </div>
  );
}
