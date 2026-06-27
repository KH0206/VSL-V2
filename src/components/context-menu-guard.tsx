"use client";

import { useEffect } from "react";

const AG_GRID_CONTEXT_MENU_SELECTOR = ".ag-root-wrapper, .ag-root, .ag-menu, .ag-popup";

export function ContextMenuGuard() {
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      const targetElement = event.target instanceof Element
        ? event.target
        : event.target instanceof Node
          ? event.target.parentElement
          : null;

      if (targetElement?.closest(AG_GRID_CONTEXT_MENU_SELECTOR)) {
        return;
      }

      event.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu, true);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, []);

  return null;
}