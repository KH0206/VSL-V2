"use client";

import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { XIcon } from "lucide-react";
import {
  createLink,
  deleteLink,
  getPersonSkillsPanelData,
  type PersonSkillsPanelData,
} from "@/app/(app)/person-skills/actions";

export function PersonSkillsPanel({
  personId,
  onClose,
}: {
  personId: number;
  onClose: () => void;
}) {
  const [data, setData] = useState<PersonSkillsPanelData | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function load() {
    getPersonSkillsPanelData(personId).then(setData);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personId]);

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const assignedSkillIds = new Set(data.links.map((l) => l.skill?.id));
  const availableSkills = data.allSkills.filter((s) => !assignedSkillIds.has(s.id));

  function handleAdd() {
    if (!selectedSkillId) return;
    startTransition(async () => {
      await createLink(personId, Number(selectedSkillId));
      setSelectedSkillId(undefined);
      load();
    });
  }

  function handleRemove(linkId: number) {
    startTransition(async () => {
      await deleteLink(linkId);
      load();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {data.links.length === 0 && (
          <p className="text-sm text-muted-foreground">No skills assigned yet.</p>
        )}
        {data.links.map((link) => (
          <Badge key={link.id} className="flex items-center gap-1">
            {link.skill?.skill}
            <button
              type="button"
              onClick={() => handleRemove(link.id)}
              disabled={pending}
              aria-label={`Remove ${link.skill?.skill}`}
            >
              <XIcon className="size-3" />
            </button>
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <Select
          value={selectedSkillId}
          onValueChange={(value) => setSelectedSkillId(value ?? undefined)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a skill to add">
              {() => availableSkills.find((s) => String(s.id) === selectedSkillId)?.skill ?? ""}
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
        <Button onClick={handleAdd} disabled={!selectedSkillId || pending}>
          Add
        </Button>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
