"use client";

import { useMemo, useState, useTransition } from "react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
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
}: {
  people: PersonOption[];
  skills: SkillOption[];
  existingLinks: PersonSkillLink[];
}) {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <Button onClick={() => setOpen(true)}>Add</Button>
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
              setOpen(false);
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
  const [, startTransition] = useTransition();
  const rows = toRows(links);

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteLink(id);
    });
  }

  const columnDefs: ColDef<Row>[] = [
    { field: "personName", headerName: "Person", flex: 1 },
    { field: "skillName", headerName: "Skill", flex: 1 },
    {
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filter: false,
      cellRenderer: (p: ICellRendererParams<Row>) =>
        p.data ? (
          <Button variant="destructive" size="sm" onClick={() => handleDelete(p.data!.id)}>
            Delete
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ActionBar title="Assignments">
        <AddLinkDialog people={people} skills={skills} existingLinks={links} />
      </ActionBar>
      <DataGrid<Row> rowData={rows} columnDefs={columnDefs} />
    </div>
  );
}
