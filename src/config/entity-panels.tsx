// Per-table registry of extra Edit-menu panels, beyond the default "Details"
// panel every table gets automatically. To add a new panel for a table,
// add an entry here and a panel component under src/components/panels/.
import type { EntityPanel } from "@/components/entity-actions-menu";
import { PersonSkillsPanel } from "@/components/panels/person-skills-panel";
import { ComingSoonPanel } from "@/components/panels/coming-soon-panel";

type Row = Record<string, unknown>;

export const extraPanelBuilders: Record<string, (row: Row) => EntityPanel[]> = {
  person: (row) => [
    {
      key: "skills",
      label: "Skills",
      render: (close) => <PersonSkillsPanel personId={row.id as number} onClose={close} />,
    },
    {
      key: "availability",
      label: "Availability",
      render: (close) => <ComingSoonPanel onClose={close} />,
    },
  ],
};

export function getExtraPanels(table: string, row: Row): EntityPanel[] {
  return extraPanelBuilders[table]?.(row) ?? [];
}
