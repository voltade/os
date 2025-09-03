import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@voltade/ui/card.tsx';
import { type ColumnDef, DataTable } from '@voltade/ui/data-table.tsx';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useState } from 'react';

import { api } from '#src/lib/api.ts';

dayjs.extend(utc);
dayjs.extend(timezone);

interface ClassData {
  id: number;
  level_group_id: number | null;
  level_group_name: string | null;
  subject_id: number | null;
  subject_name: string | null;
  usual_day_of_the_week:
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday'
    | null;
  usual_start_time_utc: string | null;
  usual_end_time_utc: string | null;
  course_id: number | null;
}

interface ClassesTableProps {
  headerAction?: React.ReactNode;
}

const formatTimeForDisplay = (utcTime: string | null) => {
  if (!utcTime) return 'N/A';
  // Convert UTC time to Singapore time for display
  return dayjs.utc(utcTime, 'HH:mm:ss').tz('Asia/Singapore').format('h:mm A');
};

export default function ClassesTable({ headerAction }: ClassesTableProps) {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['classes', page, pageSize, sortBy, sortOrder],
    queryFn: async () => {
      const queryParams: Record<string, string> = {
        page: page.toString(),
        limit: pageSize.toString(),
      };

      if (sortBy && sortOrder) {
        queryParams.sortBy = sortBy;
        queryParams.sortOrder = sortOrder;
      }

      const res = await api['get-classes'].$get({
        query: queryParams,
      });
      if (!res.ok) throw new Error('Failed to fetch classes');
      return await res.json();
    },
  });

  const classesData = response?.data || [];
  const pagination = response?.pagination;

  const columns: ColumnDef<ClassData>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('id')}</div>
      ),
    },
    {
      accessorKey: 'level_group_name',
      header: 'Level',
      cell: ({ row }) => <div>{row.getValue('level_group_name') || 'N/A'}</div>,
    },
    {
      accessorKey: 'subject_name',
      header: 'Subject',
      cell: ({ row }) => <div>{row.getValue('subject_name') || 'N/A'}</div>,
    },
    {
      accessorKey: 'usual_day_of_the_week',
      header: 'Day',
      cell: ({ row }) => (
        <div>{row.getValue('usual_day_of_the_week') || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'usual_start_time_utc',
      header: 'Start Time (SGT)',
      cell: ({ row }) => (
        <div>{formatTimeForDisplay(row.getValue('usual_start_time_utc'))}</div>
      ),
    },
    {
      accessorKey: 'usual_end_time_utc',
      header: 'End Time (SGT)',
      cell: ({ row }) => (
        <div>{formatTimeForDisplay(row.getValue('usual_end_time_utc'))}</div>
      ),
    },
  ];

  const handlePageChange = async (newPage: number) => {
    setPage(newPage);
  };

  const handleSortingChange = async (
    newSortBy: string | null,
    newSortOrder: 'asc' | 'desc' | null,
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    // Note: Page reset is handled in DataTable
  };

  if (error) {
    return (
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Classes</CardTitle>
          {headerAction}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Error loading classes: {(error as Error).message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Classes</CardTitle>
        {headerAction}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
            Loading classes...
          </div>
        ) : !classesData || classesData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No classes found.</p>
        ) : (
          <DataTable
            columns={columns}
            data={classesData}
            enableSorting={true}
            enableColumnVisibility={true}
            enablePagination={true}
            pageSize={pageSize}
            totalCount={pagination?.total}
            currentPage={page}
            onPageChange={handlePageChange}
            onSortingChange={handleSortingChange}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}
