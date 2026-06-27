"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { DataGrid } from "@/components/data-grid";
import { ActionBar } from "@/components/action-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createLink, deleteLink } from "./actions";
import type { PersonOption, PersonSkillLink, SkillOption } from "./page";

type Row = {
  id: number;
  personName: string;
  skillName: string;
};

function toRows(links: PersonSkillLink[]): Row[] {
  return links
    .filter((l) => l.person && l.skill)
    .map((l) => ({
      id: l.id,
      personName: `${l.person!.firstname} ${l.person!.lastname}`,
      skillName: l.skill!.skill,
    }));
}

function AddLinkDialog({
  people,
  skills,
  existingLinks,
  open,
  onOpenChange,
}: {
  people: PersonOption[];
  skills: SkillOption[];
  existingLinks: PersonSkillLink[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [personId, setPersonId] = useState<string | null>(null);
  const [skillId, setSkillId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const availableSkills = useMemo(() => {
    if (!personId) return skills;
    const assignedSkillIds = new Set(
      existingLinks
        .filter((l) => l.person?.id === Number(personId))
        .map((l) => l.skill?.id),
    );
    return skills.filter((s) => !assignedSkillIds.has(s.id));
  }, [personId, skills, existingLinks]);

  function reset() {
    setPersonId(null);
    setSkillId(null);
  }

  function handleSave() {
    if (!personId || !skillId) return;
    startTransition(async () => {
      await createLink(Number(personId), Number(skillId));
      reset();
      onOpenChange(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign skill to person</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Person</label>
            <Select
              value={personId ?? undefined}
              onValueChange={(value) => {
                setPersonId(value);
                setSkillId(null);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a person">
                  {() => {
                    const selected = people.find((p) => String(p.id) === personId);
                    return selected ? `${selected.firstname} ${selected.lastname}` : "";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {people.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.firstname} {p.lastname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Skill</label>
            <Select
              value={skillId ?? undefined}
              onValueChange={setSkillId}
              disabled={!personId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={personId ? "Select a skill" : "Choose a person first"}>
                  {() => availableSkills.find((s) => String(s.id) === skillId)?.skill ?? ""}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableSkills.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            Quit
          </Button>
          <Button onClick={handleSave} disabled={!personId || !skillId || pending}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PersonSkillsView({
  links,
  people,
  skills,
}: {
  links: PersonSkillLink[];
  people: PersonOption[];
  skills: SkillOption[];
}) {
  const [selectMode, setSelectMode] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [, startTransition] = useTransition();
  const gridRef = useRef<AgGridReact<Row>>(null);
  const rows = toRows(links);

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteLink(id);
    });
  }

  function handleDeleteSelected() {
    const selected = gridRef.current?.api.getSelectedRows() ?? [];
    if (selected.length === 0) return;

    startTransition(async () => {
      await Promise.all(selected.map((row) => deleteLink(row.id)));
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
              <Button variant="ghost" size="icon-xs" disabled aria-label="Edit unavailable">
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Delete row"
                onClick={() => handleDelete(p.data!.id)}
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          ) : null,
      },
      { field: "personName", headerName: "Person", flex: 1 },
      { field: "skillName", headerName: "Skill", flex: 1 },
    ],
    [selectMode],
  );

  return (
    <div className="flex flex-col gap-4">
      <ActionBar
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Person Skills" },
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
        onNew={() => setNewOpen(true)}
        newLabel="New"
      />
      <DataGrid<Row>
        ref={gridRef}
        rowData={rows}
        columnDefs={columnDefs}
        rowSelection={selectMode ? "multiple" : "single"}
      />
      <AddLinkDialog
        people={people}
        skills={skills}
        existingLinks={links}
        open={newOpen}
        onOpenChange={setNewOpen}
      />
    </div>
  );
}
