"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type EntityPanel = {
  key: string;
  label: string;
  // Receives a close() callback so panels can dismiss the dialog after an action.
  render: (close: () => void) => ReactNode;
};

export function EntityActionsMenu({
  panels,
  triggerLabel = "Edit",
}: {
  panels: EntityPanel[];
  triggerLabel?: string;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const active = panels.find((p) => p.key === openKey);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          {triggerLabel}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {panels.map((p) => (
            <DropdownMenuItem key={p.key} onClick={() => setOpenKey(p.key)}>
              {p.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openKey !== null} onOpenChange={(open) => !open && setOpenKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{active?.label}</DialogTitle>
          </DialogHeader>
          {active?.render(() => setOpenKey(null))}
        </DialogContent>
      </Dialog>
    </>
  );
}
