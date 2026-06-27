"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  LayoutDashboard,
  Users,
  FolderKanban,
  BarChart3,
  Database,
  Link2,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard-overview", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/person-skills", label: "Person Skills", icon: Link2 },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/table-edit", label: "Edit", icon: Database },
];

export function Sidebar({ email }: { email: string }) {
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);
  const expanded = pinned || hoverExpanded;

  return (
    <aside
      onMouseEnter={() => setHoverExpanded(true)}
      onMouseLeave={() => !pinned && setHoverExpanded(false)}
      onFocusCapture={() => setHoverExpanded(true)}
      onBlurCapture={(e) => {
        if (!pinned && !e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setHoverExpanded(false);
        }
      }}
      className="relative h-screen w-14 shrink-0"
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 z-30 flex flex-col justify-between border-r border-blue-800 bg-blue-900 text-white shadow-sm transition-[width] duration-150",
          expanded ? "w-48" : "w-14",
        )}
      >
        <nav className="flex flex-col gap-1 p-2">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => {
                if (!pinned) {
                  setHoverExpanded(false);
                }
              }}
              className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              <Icon className="size-5 shrink-0 text-white" />
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

        <div className="flex flex-col gap-2 border-t border-blue-800 p-2">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
            aria-pressed={pinned}
            onClick={() => setPinned((value) => !value)}
            className="self-start text-white hover:bg-blue-800 hover:text-white"
          >
            {pinned ? <PanelLeftClose className="size-3.5" /> : <PanelLeftOpen className="size-3.5" />}
          </Button>
          <div
            className={cn(
              "overflow-hidden truncate px-2.5 text-xs text-blue-200 transition-all duration-150",
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
              onClick={() => {
                if (!pinned) {
                  setHoverExpanded(false);
                }
              }}
              className="w-full justify-start gap-3 border-blue-200 bg-transparent px-2.5 text-white hover:bg-blue-800 hover:text-white"
            >
              <LogOut className="size-5 shrink-0 text-white" />
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
      </div>
    </aside>
  );
}
