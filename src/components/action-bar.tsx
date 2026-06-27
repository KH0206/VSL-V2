"use client";

import Link from "next/link";
import { ChevronRight, ListChecks, Plus, WandSparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ActionBarBreadcrumb = {
  label: string;
  href?: string;
};

export type ActionBarDoItem = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
};

const containerVariants = {
  neutral: "border-border bg-card text-card-foreground",
  accent: "border-border bg-secondary text-secondary-foreground",
  success: "border-green-300 bg-green-100 text-black",
} as const;

export function ActionBar({
  breadcrumbs,
  selectActive = false,
  onSelectToggle,
  doItems = [],
  onNew,
  newLabel = "New",
  variant = "neutral",
  className,
}: {
  breadcrumbs: ActionBarBreadcrumb[];
  selectActive?: boolean;
  onSelectToggle?: () => void;
  doItems?: ActionBarDoItem[];
  onNew?: () => void;
  newLabel?: string;
  variant?: keyof typeof containerVariants;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border p-3", containerVariants[variant], className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1 text-[0.82rem] font-medium leading-none text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <div key={`${crumb.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="size-3.5" />}
              {crumb.href ? (
                <Link href={crumb.href} className="transition-colors hover:text-foreground hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-semibold text-foreground">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant={selectActive ? "secondary" : "outline"}
            size="sm"
            onClick={onSelectToggle}
            disabled={!onSelectToggle}
          >
            <ListChecks className="size-4" />
            Select
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" disabled={doItems.length === 0} />}>
              <WandSparkles className="size-4" />
              Do
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {doItems.map((item) => (
                <DropdownMenuItem
                  key={item.label}
                  onClick={item.onClick}
                  disabled={item.disabled || !item.onClick}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={onNew} disabled={!onNew}>
            <Plus className="size-4" />
            {newLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
