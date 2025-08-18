import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@voltade/ui/card.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@voltade/ui/table.tsx';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

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

export default function ClassesTable() {
  const {
    data: classesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const res = await api['get-classes'].$get();
      if (!res.ok) throw new Error('Failed to fetch classes');
      const result = await res.json();
      return result.data as ClassData[];
    },
  });

  const formatTimeForDisplay = (utcTime: string | null) => {
    if (!utcTime) return 'N/A';
    // Convert UTC time to Singapore time for display
    return dayjs.utc(utcTime, 'HH:mm:ss').tz('Asia/Singapore').format('h:mm A');
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            Error loading classes: {(error as Error).message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Classes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading classes...</p>
        ) : !classesData || classesData.length === 0 ? (
          <p className="text-gray-500">No classes found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Level Group</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Start Time (SGT)</TableHead>
                <TableHead>End Time (SGT)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classesData.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell className="font-medium">{classItem.id}</TableCell>
                  <TableCell>{classItem.level_group_name || 'N/A'}</TableCell>
                  <TableCell>{classItem.subject_name || 'N/A'}</TableCell>
                  <TableCell>
                    {classItem.usual_day_of_the_week || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {formatTimeForDisplay(classItem.usual_start_time_utc)}
                  </TableCell>
                  <TableCell>
                    {formatTimeForDisplay(classItem.usual_end_time_utc)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
