"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Users, FolderKanban, BarChart3, Database, Link2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/users", label: "Users", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/person-skills", label: "Person Skills", icon: Link2 },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/table-edit", label: "Table Edit", icon: Database },
];

export function Sidebar({ email }: { email: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={cn(
        "flex h-screen flex-col justify-between border-r bg-background transition-all duration-150",
        expanded ? "w-48" : "w-14",
      )}
    >
      <nav className="flex flex-col gap-1 p-2">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Icon className="size-5 shrink-0" />
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap transition-all duration-150",
                expanded ? "max-w-[10rem] opacity-100" : "max-w-0 opacity-0",
              )}
            >
              {label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-2 border-t p-2">
        <div
          className={cn(
            "overflow-hidden truncate px-2.5 text-xs text-muted-foreground transition-all duration-150",
            expanded ? "max-w-[10rem] opacity-100" : "max-w-0 opacity-0",
          )}
        >
          {email}
        </div>
        <form action="/logout" method="post">
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="w-full justify-start gap-3 px-2.5"
          >
            <LogOut className="size-5 shrink-0" />
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap transition-all duration-150",
                expanded ? "max-w-[10rem] opacity-100" : "max-w-0 opacity-0",
              )}
            >
              Log out
            </span>
          </Button>
        </form>
      </div>
    </aside>
  );
}
