"use client";

import { forwardRef } from "react";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, themeQuartz } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

function DataGridInner<T>(
  props: AgGridReactProps<T>,
  ref: React.Ref<AgGridReact<T>>,
) {
  return (
    <div style={{ height: 420, width: "100%" }}>
      <AgGridReact
        ref={ref}
        theme={themeQuartz}
        pagination
        paginationPageSize={10}
        {...props}
      />
    </div>
  );
}

export const DataGrid = forwardRef(DataGridInner) as <T>(
  props: AgGridReactProps<T> & { ref?: React.Ref<AgGridReact<T>> },
) => React.ReactElement;
