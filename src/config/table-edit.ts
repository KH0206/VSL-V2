// Manually-controlled list of tables that are editable via the /table-edit UI.
// Add a table name here to expose it in the Table Edit list and CRUD page.
export const table_edit_ref = ["project", "orders", "person", "skill", "asset", "project_allocation", "task"] as const;

export type TableEditRef = (typeof table_edit_ref)[number];

export function isEditableTable(table: string): table is TableEditRef {
  return (table_edit_ref as readonly string[]).includes(table);
}
