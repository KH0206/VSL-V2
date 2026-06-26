import type { ReactNode } from "react";

export function ActionBar({
  title,
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b pb-3">
      {title ? <h2 className="text-lg font-medium">{title}</h2> : <div />}
      <div className="flex gap-2">{children}</div>
    </div>
  );
}
