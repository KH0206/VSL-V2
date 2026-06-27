import { createClient } from "@/lib/supabase/server";
import { DashboardOverviewView, type AllocationItem } from "./dashboard-overview-view";

type AllocationRow = {
  id: number;
  project_id: number;
  person_id: number | null;
  asset_id: number | null;
  starts_on: string;
  ends_on: string;
  notes: string | null;
  project: { project_name: string | null } | null;
  person: { firstname: string; lastname: string } | null;
  asset: { alias: string | null; make: string | null; model: string | null } | null;
};

type ProjectOption = { id: number; project_name: string | null };
type PersonOption = { id: number; firstname: string | null; lastname: string | null };
type AssetOption = { id: number; alias: string | null; make: string | null; model: string | null };

export default async function DashboardOverviewPage() {
  const supabase = await createClient();

  const [{ data, error }, { data: projects }, { data: people }, { data: assets }] = await Promise.all([
    supabase
    .from("project_allocation")
    .select(
      "id, project_id, person_id, asset_id, starts_on, ends_on, notes, project:project_id(project_name), person:person_id(firstname, lastname), asset:asset_id(alias, make, model)",
    )
    .order("starts_on", { ascending: true }),
    supabase.from("project").select("id, project_name").order("project_name", { ascending: true }),
    supabase.from("person").select("id, firstname, lastname").order("lastname", { ascending: true }),
    supabase.from("asset").select("id, alias, make, model").order("alias", { ascending: true }),
  ]);

  const items: AllocationItem[] = ((data as AllocationRow[] | null) ?? []).map((row) => {
    const projectName = row.project?.project_name?.trim() || "Unnamed Project";

    if (row.person) {
      return {
        id: row.id,
        projectId: row.project_id,
        personId: row.person_id,
        assetId: row.asset_id,
        projectName,
        startsOn: row.starts_on,
        endsOn: row.ends_on,
        resourceType: "Person",
        resourceName: `${row.person.firstname} ${row.person.lastname}`,
        notes: row.notes,
      };
    }

    const assetLabel = row.asset?.alias || [row.asset?.make, row.asset?.model].filter(Boolean).join(" ") || "Unnamed Asset";

    return {
      id: row.id,
      projectId: row.project_id,
      personId: row.person_id,
      assetId: row.asset_id,
      projectName,
      startsOn: row.starts_on,
      endsOn: row.ends_on,
      resourceType: "Asset",
      resourceName: assetLabel,
      notes: row.notes,
    };
  });

  const projectOptions = ((projects as ProjectOption[] | null) ?? []).map((project) => ({
    id: project.id,
    label: project.project_name?.trim() || `Project ${project.id}`,
  }));

  const personOptions = ((people as PersonOption[] | null) ?? []).map((person) => ({
    id: person.id,
    label: `${person.firstname ?? ""} ${person.lastname ?? ""}`.trim() || `Person ${person.id}`,
  }));

  const assetOptions = ((assets as AssetOption[] | null) ?? []).map((asset) => ({
    id: asset.id,
    label:
      asset.alias?.trim() ||
      [asset.make, asset.model].filter(Boolean).join(" ").trim() ||
      `Asset ${asset.id}`,
  }));

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <p className="text-sm text-destructive">
          {error.message}. If this is a new setup, apply migration 0015_project_allocation.sql.
        </p>
      ) : null}
      <DashboardOverviewView
        items={items}
        projects={projectOptions}
        people={personOptions}
        assets={assetOptions}
      />
    </div>
  );
}
