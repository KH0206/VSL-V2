"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Timeline, { DateHeader, TimelineHeaders } from "react-calendar-timeline";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ActionBar } from "@/components/action-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAllocation,
  deleteAllocation,
  updateAllocation,
  updateAllocationDates,
  updateAllocationGrouping,
} from "./actions";

export type AllocationItem = {
  id: number;
  projectId: number;
  personId: number | null;
  assetId: number | null;
  projectName: string;
  startsOn: string;
  endsOn: string;
  resourceType: "Person" | "Asset";
  resourceName: string;
  notes?: string | null;
};

type OptionItem = {
  id: number;
  label: string;
};

type ViewMode = "all" | "person" | "asset";
type ZoomLevel = "day" | "week" | "month" | "year";

type TimelineGroup = {
  id: string;
  title: string;
  mode: ViewMode;
  entityId: number;
};

type TimelineItem = {
  id: number;
  group: string;
  title: string;
  start_time: number;
  end_time: number;
  canMove: boolean;
  canResize: "left" | "right" | "both" | false;
  canChangeGroup: false;
  itemProps: {
    title: string;
    style: {
      background: string;
      color: string;
      border: string;
      borderRadius: string;
      boxShadow: string;
      fontSize: string;
      fontWeight: number;
    };
  };
};

const DAY_MS = 24 * 60 * 60 * 1000;
const ZOOM_WINDOWS: Record<ZoomLevel, number> = {
  day: 1 * DAY_MS,
  week: 7 * DAY_MS,
  month: 30 * DAY_MS,
  year: 365 * DAY_MS,
};

function toIsoDateLocal(timestampMs: number): string {
  const date = new Date(timestampMs);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function clampEndDate(startsOn: string, endsOn: string): string {
  if (!startsOn || !endsOn) return endsOn;
  return endsOn < startsOn ? startsOn : endsOn;
}

function shiftDateIso(dateIso: string, deltaDays: number): string {
  const date = new Date(`${dateIso}T00:00:00`);
  date.setDate(date.getDate() + deltaDays);
  return toIsoDateLocal(date.getTime());
}

function keyForOption(mode: ViewMode, optionId: number): string {
  return `${mode}:${optionId}`;
}

export function DashboardOverviewView({
  items,
  projects,
  people,
  assets,
}: {
  items: AllocationItem[];
  projects: OptionItem[];
  people: OptionItem[];
  assets: OptionItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("month");
  const [visibleTimeStart, setVisibleTimeStart] = useState<number>(() => Date.now() - ZOOM_WINDOWS.month / 2);
  const [visibleTimeEnd, setVisibleTimeEnd] = useState<number>(() => Date.now() + ZOOM_WINDOWS.month / 2);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formProjectId, setFormProjectId] = useState<string>("");
  const [formResourceType, setFormResourceType] = useState<"Person" | "Asset">("Person");
  const [formPersonId, setFormPersonId] = useState<string>("");
  const [formAssetId, setFormAssetId] = useState<string>("");
  const [formStartsOn, setFormStartsOn] = useState("");
  const [formEndsOn, setFormEndsOn] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const itemById = useMemo(
    () => new Map<number, AllocationItem>(items.map((item) => [item.id, item])),
    [items],
  );

  const canSubmit =
    !!formProjectId &&
    !!formStartsOn &&
    !!formEndsOn &&
    (formResourceType === "Person" ? !!formPersonId : !!formAssetId);

  function openCreateDialog() {
    const todayIso = toIsoDateLocal(Date.now());
    setEditingId(null);
    setErrorMessage(null);
    setFormProjectId(projects[0] ? String(projects[0].id) : "");
    setFormResourceType("Person");
    setFormPersonId(people[0] ? String(people[0].id) : "");
    setFormAssetId(assets[0] ? String(assets[0].id) : "");
    setFormStartsOn(todayIso);
    setFormEndsOn(todayIso);
    setFormNotes("");
    setDialogOpen(true);
  }

  function openEditDialog(item: AllocationItem) {
    setEditingId(item.id);
    setErrorMessage(null);
    setFormProjectId(String(item.projectId));
    if (item.personId) {
      setFormResourceType("Person");
      setFormPersonId(String(item.personId));
      setFormAssetId(assets[0] ? String(assets[0].id) : "");
    } else {
      setFormResourceType("Asset");
      setFormAssetId(item.assetId ? String(item.assetId) : assets[0] ? String(assets[0].id) : "");
      setFormPersonId(people[0] ? String(people[0].id) : "");
    }
    setFormStartsOn(item.startsOn);
    setFormEndsOn(item.endsOn);
    setFormNotes(item.notes ?? "");
    setDialogOpen(true);
  }

  function handleSaveDialog() {
    if (!canSubmit) return;

    const projectId = Number(formProjectId);
    const personId = formResourceType === "Person" ? Number(formPersonId) : null;
    const assetId = formResourceType === "Asset" ? Number(formAssetId) : null;
    const endsOn = clampEndDate(formStartsOn, formEndsOn);

    setErrorMessage(null);
    startTransition(async () => {
      try {
        if (editingId === null) {
          await createAllocation({
            projectId,
            personId,
            assetId,
            startsOn: formStartsOn,
            endsOn,
            notes: formNotes,
          });
        } else {
          await updateAllocation(editingId, {
            projectId,
            personId,
            assetId,
            startsOn: formStartsOn,
            endsOn,
            notes: formNotes,
          });
        }

        setDialogOpen(false);
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to save assignment");
      }
    });
  }

  function handleDeleteDialog() {
    if (editingId === null) return;
    setErrorMessage(null);

    startTransition(async () => {
      try {
        await deleteAllocation(editingId);
        setDialogOpen(false);
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to delete assignment");
      }
    });
  }

  function handleItemMove(itemId: number, dragTime: number) {
    const source = itemById.get(Number(itemId));
    if (!source) return;

    const sourceStart = new Date(`${source.startsOn}T00:00:00`).getTime();
    const deltaDays = Math.round((dragTime - sourceStart) / DAY_MS);
    const nextStart = shiftDateIso(source.startsOn, deltaDays);
    const nextEnd = shiftDateIso(source.endsOn, deltaDays);

    startTransition(async () => {
      try {
        await updateAllocationDates(source.id, nextStart, nextEnd);
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to move assignment");
      }
    });
  }

  function handleItemMoveWithGroup(itemId: number, dragTime: number, newGroupOrder: number) {
    const source = itemById.get(Number(itemId));
    const targetGroup = timelineGroups[newGroupOrder];
    if (!source || !targetGroup) return;

    const sourceStart = new Date(`${source.startsOn}T00:00:00`).getTime();
    const deltaDays = Math.round((dragTime - sourceStart) / DAY_MS);
    const nextStart = shiftDateIso(source.startsOn, deltaDays);
    const nextEnd = shiftDateIso(source.endsOn, deltaDays);

    let nextProjectId = source.projectId;
    let nextPersonId = source.personId;
    let nextAssetId = source.assetId;

    if (viewMode === "all") {
      nextProjectId = targetGroup.entityId;
    } else if (viewMode === "person") {
      nextPersonId = targetGroup.entityId;
      nextAssetId = null;
    } else {
      nextAssetId = targetGroup.entityId;
      nextPersonId = null;
    }

    startTransition(async () => {
      try {
        await Promise.all([
          updateAllocationDates(source.id, nextStart, nextEnd),
          updateAllocationGrouping(source.id, nextProjectId, nextPersonId, nextAssetId),
        ]);
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to move assignment");
      }
    });
  }

  function handleItemResize(itemId: number, time: number, edge: "left" | "right") {
    const source = itemById.get(Number(itemId));
    if (!source) return;

    const nextDate = toIsoDateLocal(time);
    const nextStart = edge === "left" ? nextDate : source.startsOn;
    const nextEnd = edge === "right" ? nextDate : source.endsOn;
    const safeEnd = clampEndDate(nextStart, nextEnd);

    startTransition(async () => {
      try {
        await updateAllocationDates(source.id, nextStart, safeEnd);
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to resize assignment");
      }
    });
  }

  const filteredItems = useMemo(() => {
    if (viewMode === "person") {
      return items.filter((item) => item.resourceType === "Person");
    }
    if (viewMode === "asset") {
      return items.filter((item) => item.resourceType === "Asset");
    }
    return items;
  }, [items, viewMode]);

  const overlapIds = useMemo(() => {
    const ids = new Set<number>();
    const byResource = new Map<string, { id: number; start: number; end: number }[]>();

    for (const item of filteredItems) {
      const start = new Date(item.startsOn).getTime();
      const end = new Date(item.endsOn).getTime();
      const key = `${item.resourceType}:${item.resourceName}`;
      const group = byResource.get(key) ?? [];
      group.push({ id: item.id, start, end });
      byResource.set(key, group);
    }

    for (const ranges of byResource.values()) {
      const sorted = ranges.sort((a, b) => a.start - b.start);
      for (let i = 0; i < sorted.length; i += 1) {
        for (let j = i + 1; j < sorted.length; j += 1) {
          if (sorted[j].start > sorted[i].end) {
            break;
          }
          if (sorted[i].start <= sorted[j].end && sorted[j].start <= sorted[i].end) {
            ids.add(sorted[i].id);
            ids.add(sorted[j].id);
          }
        }
      }
    }

    return ids;
  }, [filteredItems]);

  const timelineGroups = useMemo<TimelineGroup[]>(() => {
    if (viewMode === "all") {
      return [...projects]
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((project) => ({
          id: keyForOption("all", project.id),
          title: project.label,
          mode: "all",
          entityId: project.id,
        }));
    }

    if (viewMode === "person") {
      return [...people]
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((person) => ({
          id: keyForOption("person", person.id),
          title: person.label,
          mode: "person",
          entityId: person.id,
        }));
    }

    return [...assets]
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((asset) => ({
        id: keyForOption("asset", asset.id),
        title: asset.label,
        mode: "asset",
        entityId: asset.id,
      }));
  }, [assets, people, projects, viewMode]);

  const timelineItems = useMemo<TimelineItem[]>(() => {
    return filteredItems.map((item) => {
      const hasOverlap = overlapIds.has(item.id);
      const isPerson = item.resourceType === "Person";
      const normalBg = isPerson ? "#1d4ed8" : "#059669";
      const overlapBg = isPerson ? "#b91c1c" : "#c2410c";

      return {
        id: item.id,
        group:
          viewMode === "all"
            ? keyForOption("all", item.projectId)
            : viewMode === "person"
              ? keyForOption("person", item.personId ?? -1)
              : keyForOption("asset", item.assetId ?? -1),
        title: `${item.resourceName} (${item.projectName})`,
        start_time: new Date(item.startsOn).getTime(),
        end_time: new Date(item.endsOn).getTime() + DAY_MS - 1,
        canMove: true,
        canResize: "both",
        canChangeGroup: true,
        itemProps: {
          title: `${item.resourceName} (${item.projectName}) | ${item.startsOn} to ${item.endsOn}`,
          style: {
            background: hasOverlap ? overlapBg : normalBg,
            color: "#ffffff",
            border: `1px solid ${hasOverlap ? "#7f1d1d" : "rgba(15,23,42,0.25)"}`,
            borderRadius: "6px",
            boxShadow: "none",
            fontSize: "12px",
            fontWeight: 600,
          },
        },
      };
    });
  }, [filteredItems, overlapIds, viewMode]);

  const dataBounds = useMemo(() => {
    if (timelineItems.length === 0) {
      const now = Date.now();
      return { min: now - ZOOM_WINDOWS.month, max: now + ZOOM_WINDOWS.month };
    }

    const min = Math.min(...timelineItems.map((item) => item.start_time));
    const max = Math.max(...timelineItems.map((item) => item.end_time));
    return { min, max };
  }, [timelineItems]);

  useEffect(() => {
    const windowMs = ZOOM_WINDOWS[zoomLevel];
    const center = dataBounds.min + (dataBounds.max - dataBounds.min) / 2;
    setVisibleTimeStart(center - windowMs / 2);
    setVisibleTimeEnd(center + windowMs / 2);
  }, [dataBounds.max, dataBounds.min, zoomLevel]);

  function shiftWindow(direction: -1 | 1) {
    const span = visibleTimeEnd - visibleTimeStart;
    const delta = span * 0.8 * direction;
    setVisibleTimeStart((prev) => prev + delta);
    setVisibleTimeEnd((prev) => prev + delta);
  }

  function goToNow() {
    const windowMs = ZOOM_WINDOWS[zoomLevel];
    const center = Date.now();
    setVisibleTimeStart(center - windowMs / 2);
    setVisibleTimeEnd(center + windowMs / 2);
  }

  function handleZoomChange(nextZoom: string) {
    const parsed = (nextZoom as ZoomLevel) || "month";
    const center = (visibleTimeStart + visibleTimeEnd) / 2;
    const windowMs = ZOOM_WINDOWS[parsed];
    setZoomLevel(parsed);
    setVisibleTimeStart(center - windowMs / 2);
    setVisibleTimeEnd(center + windowMs / 2);
  }

  return (
    <div className="page-content">
      <ActionBar
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Dashboard" }]}
        variant="accent"
        onNew={openCreateDialog}
        newLabel="New"
      />

      <Card>
        <CardHeader>
          <CardTitle>Project Allocation Timeline</CardTitle>
          <p className="page-intro">
            Zoomable schedule view with overlap highlighting and resource-focused filters.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => shiftWindow(-1)}>
              <ChevronLeft className="size-3.5" />
              Back
            </Button>
            <Button variant="outline" size="sm" onClick={goToNow}>
              Now
            </Button>
            <Button variant="outline" size="sm" onClick={() => shiftWindow(1)}>
              Forward
              <ChevronRight className="size-3.5" />
            </Button>

            <Select defaultValue={zoomLevel} value={zoomLevel} onValueChange={handleZoomChange}>
              <SelectTrigger size="sm" className="min-w-[9rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Zoom: Day</SelectItem>
                <SelectItem value="week">Zoom: Week</SelectItem>
                <SelectItem value="month">Zoom: Month</SelectItem>
                <SelectItem value="year">Zoom: Year</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue={viewMode} value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
              <SelectTrigger size="sm" className="min-w-[11rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Show by: All</SelectItem>
                <SelectItem value="person">Show by: Person</SelectItem>
                <SelectItem value="asset">Show by: Asset</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {timelineItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No allocations found yet. Add rows to project_allocation to populate this dashboard.
            </p>
          ) : (
            <div className="dashboard-timeline overflow-hidden rounded-lg border border-border/80">
              <Timeline
                groups={timelineGroups}
                items={timelineItems}
                defaultTimeStart={dataBounds.min}
                defaultTimeEnd={dataBounds.max}
                visibleTimeStart={visibleTimeStart}
                visibleTimeEnd={visibleTimeEnd}
                sidebarWidth={220}
                lineHeight={46}
                itemHeightRatio={0.72}
                canMove={true}
                canResize={"both"}
                canChangeGroup={true}
                canSelect={true}
                stackItems={true}
                minZoom={ZOOM_WINDOWS.day}
                maxZoom={ZOOM_WINDOWS.year * 2}
                dragSnap={DAY_MS}
                onTimeChange={(start, end) => {
                  setVisibleTimeStart(start);
                  setVisibleTimeEnd(end);
                }}
                onItemClick={(itemId) => {
                  const item = itemById.get(Number(itemId));
                  if (item) {
                    openEditDialog(item);
                  }
                }}
                onItemMove={(itemId, dragTime, newGroupOrder) => {
                  handleItemMoveWithGroup(Number(itemId), dragTime, newGroupOrder);
                }}
                onItemResize={(itemId, time, edge) => {
                  handleItemResize(Number(itemId), time, edge);
                }}
              >
                <TimelineHeaders>
                  <DateHeader unit="primaryHeader" />
                  <DateHeader />
                </TimelineHeaders>
              </Timeline>
            </div>
          )}

          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge className="bg-blue-600 text-white">Person allocation</Badge>
            <Badge className="bg-emerald-600 text-white">Asset allocation</Badge>
            <Badge className="bg-orange-600 text-white">Overlap highlight</Badge>
            <Badge variant="outline">Drag and resize enabled</Badge>
            <Badge variant="outline">Drag between rows to reassign</Badge>
            <Badge variant="outline">Click bar to edit</Badge>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId === null ? "New assignment" : "Edit assignment"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="alloc-project">Project</Label>
              <select
                id="alloc-project"
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                value={formProjectId}
                onChange={(event) => setFormProjectId(event.target.value)}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="alloc-type">Resource type</Label>
              <select
                id="alloc-type"
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                value={formResourceType}
                onChange={(event) => setFormResourceType(event.target.value as "Person" | "Asset")}
              >
                <option value="Person">Person</option>
                <option value="Asset">Asset</option>
              </select>
            </div>

            {formResourceType === "Person" ? (
              <div className="grid gap-1">
                <Label htmlFor="alloc-person">Person</Label>
                <select
                  id="alloc-person"
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                  value={formPersonId}
                  onChange={(event) => setFormPersonId(event.target.value)}
                >
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid gap-1">
                <Label htmlFor="alloc-asset">Asset</Label>
                <select
                  id="alloc-asset"
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                  value={formAssetId}
                  onChange={(event) => setFormAssetId(event.target.value)}
                >
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1">
                <Label htmlFor="alloc-start">Start date</Label>
                <Input
                  id="alloc-start"
                  type="date"
                  value={formStartsOn}
                  onChange={(event) => {
                    setFormStartsOn(event.target.value);
                    setFormEndsOn((prev) => clampEndDate(event.target.value, prev));
                  }}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="alloc-end">End date</Label>
                <Input
                  id="alloc-end"
                  type="date"
                  value={formEndsOn}
                  onChange={(event) => setFormEndsOn(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="alloc-notes">Notes</Label>
              <Input
                id="alloc-notes"
                value={formNotes}
                onChange={(event) => setFormNotes(event.target.value)}
                placeholder="Optional notes"
              />
            </div>

            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          </div>

          <DialogFooter>
            {editingId !== null ? (
              <Button variant="destructive" onClick={handleDeleteDialog} disabled={pending}>
                Delete
              </Button>
            ) : null}
            <Button onClick={handleSaveDialog} disabled={pending || !canSubmit}>
              {editingId === null ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
