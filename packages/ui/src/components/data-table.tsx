'use client';

import {
  type Column,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  EyeOff,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '#components/button.tsx';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '#components/dropdown-menu.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#components/table.tsx';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  enableSorting?: boolean;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  // Server-side pagination props
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => Promise<void> | void;
  onPageSizeChange?: (pageSize: number) => Promise<void> | void;
  // Server-side sorting props
  onSortingChange?: (
    sortBy: string | null,
    sortOrder: 'asc' | 'desc' | null,
  ) => Promise<void> | void;
  isLoading?: boolean;
}

// Sortable column header component
function SortableHeader<TData>({
  column,
  children,
}: {
  column: Column<TData, unknown>;
  children: React.ReactNode;
}) {
  if (!column.getCanSort()) {
    return <div>{children}</div>;
  }

  const handleSort = () => {
    const currentSort = column.getIsSorted();
    if (currentSort === false) {
      // unsorted → asc
      column.toggleSorting(false);
    } else if (currentSort === 'asc') {
      // asc → desc
      column.toggleSorting(true);
    } else {
      // desc → unsorted
      column.clearSorting();
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleSort}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      {children}
      {column.getIsSorted() === 'asc' ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === 'desc' ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  enableSorting = false,
  enableColumnVisibility = false,
  enablePagination = false,
  pageSize = 10,
  totalCount,
  currentPage,
  onPageChange,
  onPageSizeChange: _onPageSizeChange,
  onSortingChange,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: currentPage ?? 0,
    pageSize,
  });

  // Server-side modes
  const isServerSidePagination = Boolean(
    onPageChange && totalCount !== undefined,
  );
  const isServerSideSorting = Boolean(onSortingChange);

  // Handle sorting changes
  const handleSortingChange = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState),
  ) => {
    const newSorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting)
        : updaterOrValue;

    setSorting(newSorting);

    if (isServerSideSorting && onSortingChange) {
      const sortItem = newSorting[0];
      if (sortItem) {
        onSortingChange(sortItem.id, sortItem.desc ? 'desc' : 'asc');
      } else {
        onSortingChange(null, null);
      }

      // Reset to page 1 when sorting changes
      if (isServerSidePagination && onPageChange) {
        onPageChange(0);
      }
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting &&
      !isServerSideSorting && {
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
      }),
    ...(enableSorting &&
      isServerSideSorting && {
        manualSorting: true,
        onSortingChange: handleSortingChange,
      }),
    ...(enableColumnVisibility && {
      onColumnVisibilityChange: setColumnVisibility,
    }),
    ...(enablePagination &&
      !isServerSidePagination && {
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
      }),
    ...(isServerSidePagination && {
      manualPagination: true,
      pageCount: Math.ceil((totalCount || 0) / pageSize),
    }),
    state: {
      ...(enableSorting && { sorting }),
      ...(enableColumnVisibility && { columnVisibility }),
      ...(enablePagination && { pagination }),
    },
  });

  return (
    <div className="space-y-4">
      {/* Column Visibility Toggle */}
      {enableColumnVisibility && (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <EyeOff className="mr-2 h-4 w-4" />
                Columns
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : enableSorting ? (
                        <SortableHeader column={header.column}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </SortableHeader>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {enablePagination && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            {isServerSidePagination ? (
              <>
                Showing {(currentPage ?? 0) * pageSize + 1} to{' '}
                {Math.min(((currentPage ?? 0) + 1) * pageSize, totalCount || 0)}{' '}
                of {totalCount || 0} entries
              </>
            ) : (
              <>
                Showing{' '}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{' '}
                to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length,
                )}{' '}
                of {table.getFilteredRowModel().rows.length} entries
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (isServerSidePagination && onPageChange) {
                  await onPageChange((currentPage ?? 0) - 1);
                } else {
                  table.previousPage();
                }
              }}
              disabled={
                isLoading ||
                (isServerSidePagination
                  ? (currentPage ?? 0) <= 0
                  : !table.getCanPreviousPage())
              }
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm font-medium">
              Page {(currentPage ?? table.getState().pagination.pageIndex) + 1}{' '}
              of{' '}
              {isServerSidePagination
                ? Math.ceil((totalCount || 0) / pageSize)
                : table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (isServerSidePagination && onPageChange) {
                  await onPageChange((currentPage ?? 0) + 1);
                } else {
                  table.nextPage();
                }
              }}
              disabled={
                isLoading ||
                (isServerSidePagination
                  ? (currentPage ?? 0) >=
                    Math.ceil((totalCount || 0) / pageSize) - 1
                  : !table.getCanNextPage())
              }
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export type { ColumnDef };
