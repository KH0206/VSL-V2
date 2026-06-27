"use client";

import { forwardRef } from "react";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  type ColDef,
  type ColGroupDef,
} from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

type GridColumnDef<T> = ColDef<T> | ColGroupDef<T>;
type DataGridProps<T> = AgGridReactProps<T> & {
  enableFilters?: boolean;
};

function hideIdColumns<T>(columnDefs?: GridColumnDef<T>[]): GridColumnDef<T>[] | undefined {
  return columnDefs?.map((columnDef) => {
    if ("children" in columnDef && Array.isArray(columnDef.children)) {
      return {
        ...columnDef,
        children: hideIdColumns(columnDef.children as GridColumnDef<T>[]),
      };
    }

    if ("field" in columnDef && columnDef.field === "id") {
      return { ...columnDef, hide: true };
    }

    return columnDef;
  });
}

function DataGridInner<T>(
  props: DataGridProps<T>,
  ref: React.Ref<AgGridReact<T>>,
) {
  const {
    enableFilters = false,
    columnDefs: rawColumnDefs,
    defaultColDef,
    ...agGridProps
  } = props;
  const columnDefs = hideIdColumns(rawColumnDefs as GridColumnDef<T>[] | undefined);
  const mergedDefaultColDef = enableFilters
    ? {
        ...defaultColDef,
        filter: true,
        floatingFilter: true,
      }
    : defaultColDef;

  return (
    <div style={{ height: 420, width: "100%" }}>
      <AgGridReact
        ref={ref}
        theme={themeQuartz}
        pagination
        paginationPageSize={100}
        {...agGridProps}
        defaultColDef={mergedDefaultColDef}
        columnDefs={columnDefs}
      />
    </div>
  );
}

export const DataGrid = forwardRef(DataGridInner) as <T>(
  props: DataGridProps<T> & { ref?: React.Ref<AgGridReact<T>> },
) => React.ReactElement;
