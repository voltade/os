import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@voltade/ui/button.tsx';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@voltade/ui/dialog.tsx';
import { Input } from '@voltade/ui/input.tsx';
import { MultiSelect } from '@voltade/ui/multiselect.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@voltade/ui/table.tsx';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useId, useMemo, useState } from 'react';

import { api } from '#src/lib/api.ts';
import { pgRest } from '#src/lib/pg-rest.ts';
import { toast } from '#src/lib/toast.ts';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const BASE_MONDAY_UTC_DATE = '2024-01-01 00:00:00';

const WEEKDAY_TO_INDEX: Record<string, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

type StudentRow = {
  id: number | null;
  name: string | null;
  phone: string | null;
  school: string | null;
  email: string | null;
  class_ids: number[] | null;
};

export default function StudentsTable() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await pgRest
        .from('student_view')
        .select('id, name, phone, school, email, class_ids, is_active')
        .is('is_active', true)
        .order('id', { ascending: true });
      if (error) throw new Error(error.message);
      return data as StudentRow[];
    },
  });

  type ClassRow = {
    id: number;
    level_group_name: string;
    subject_name: string;
    usual_day_of_the_week: string;
    usual_start_time_utc: string;
    usual_end_time_utc: string;
  };

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await pgRest
        .from('class_view')
        .select(
          'id, level_group_name, subject_name, usual_day_of_the_week, usual_start_time_utc, usual_end_time_utc',
        );
      if (error) throw new Error(error.message);
      return data as ClassRow[];
    },
  });

  const classMap = useMemo(() => {
    const map = new Map<number, ClassRow>();
    for (const c of classesData ?? []) map.set(c.id, c);
    return map;
  }, [classesData]);

  const formatClassLabel = (c: {
    level_group_name?: string;
    subject_name?: string;
    usual_day_of_the_week?: string;
    usual_start_time_utc?: string;
    usual_end_time_utc?: string;
  }) => {
    const normDay = (c.usual_day_of_the_week || '').toLowerCase();
    const dayIdx = WEEKDAY_TO_INDEX[normDay] ?? 0;
    const baseMondayUtc = dayjs
      .utc(BASE_MONDAY_UTC_DATE, 'YYYY-MM-DD HH:mm:ss', true)
      .add(dayIdx, 'day');

    const startUtc = dayjs.utc(
      `${baseMondayUtc.format('YYYY-MM-DD')} ${c.usual_start_time_utc || '00:00:00'}`,
      'YYYY-MM-DD HH:mm:ss',
      true,
    );
    const endUtc = dayjs.utc(
      `${baseMondayUtc.format('YYYY-MM-DD')} ${c.usual_end_time_utc || '00:00:00'}`,
      'YYYY-MM-DD HH:mm:ss',
      true,
    );

    const startSgt = startUtc.tz('Asia/Singapore');
    const endSgt = endUtc.tz('Asia/Singapore');

    const localDay = `${startSgt.format('dddd')}s`;
    const startLabel = startSgt.format('h A');
    const endLabel = endSgt.format('h A');

    return `${c.level_group_name} ${c.subject_name} (${localDay}, ${startLabel}–${endLabel})`;
  };

  const [createForm, setCreateForm] = useState({
    name: '',
    school: '',
    phone: '',
    email: '',
    classIds: [] as string[],
  });
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    id: number | null;
    name: string;
    school: string;
    phone: string;
    email: string;
    classIds: string[];
  }>({
    id: null,
    name: '',
    school: '',
    phone: '',
    email: '',
    classIds: [],
  });
  const formId = useId();
  const nameId = `${formId}-name`;
  const schoolId = `${formId}-school`;
  const phoneId = `${formId}-phone`;
  const emailId = `${formId}-email`;
  const classesId = `${formId}-classes`;

  const createStudent = useMutation({
    mutationFn: async () => {
      const payload = {
        name: createForm.name,
        school: createForm.school,
        phone: createForm.phone,
        email: createForm.email,
        class_ids: createForm.classIds.map((x) => Number(x)),
      };
      const res = await api.students.$post({ json: payload });
      if (!res.ok) throw new Error('Create failed');
      return res.json();
    },
    onSuccess: async () => {
      setCreateForm({
        name: '',
        school: '',
        phone: '',
        email: '',
        classIds: [],
      });
      toast.success('Student created');
      await qc.invalidateQueries({ queryKey: ['students'] });
      setOpen(false);
    },
    onError: () => toast.error('Failed to create student'),
  });

  const updateStudent = useMutation({
    mutationFn: async (vars: {
      id: number;
      patch: Partial<{
        name: string;
        school: string;
        phone: string;
        email: string;
        class_ids: number[];
      }>;
    }) => {
      const res = await api.students[':id{[0-9]+}'].$patch({
        param: { id: String(vars.id) },
        json: vars.patch,
      });
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onSuccess: async () => {
      toast.success('Student updated');
      await qc.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => toast.error('Failed to update student'),
  });

  const deleteStudent = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.students[':id{[0-9]+}'].$delete({
        param: { id: String(id) },
      });
      if (!res.ok) throw new Error('Archive failed');
      return res.json();
    },
    onSuccess: async () => {
      toast.success('Student archived');
      await qc.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => toast.error('Failed to archive student'),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: Certain dependencies are stable between renders.
  const rows = useMemo(() => {
    return (data ?? []).map((s) => {
      const id = s.id ?? undefined;
      return (
        <TableRow key={s.id ?? Math.random()}>
          <TableCell>{s.id ?? '-'}</TableCell>
          <TableCell>{s.name ?? '-'}</TableCell>
          <TableCell>{s.school ?? '-'}</TableCell>
          <TableCell>{s.phone ?? '-'}</TableCell>
          <TableCell>{s.email ?? '-'}</TableCell>
          <TableCell>
            {(() => {
              const ids = (
                Array.isArray(s.class_ids) ? s.class_ids : []
              ).filter(
                (x): x is number => typeof x === 'number' && Number.isFinite(x),
              ) as number[];
              if (ids.length === 0) return '–';
              return (
                <div className="flex flex-col items-start gap-1">
                  {ids.map((cid) => {
                    const cls = classMap.get(cid);
                    const label = cls ? formatClassLabel(cls) : `Class #${cid}`;
                    return (
                      <span
                        key={cid}
                        className="inline-flex items-center gap-1 rounded-full border bg-secondary text-secondary-foreground px-2 py-0.5 text-xs"
                      >
                        <span>{label}</span>
                      </span>
                    );
                  })}
                </div>
              );
            })()}
          </TableCell>
          <TableCell>
            {id !== undefined && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditForm({
                      id,
                      name: s.name ?? '',
                      school: s.school ?? '',
                      phone: s.phone ?? '',
                      email: s.email ?? '',
                      classIds: Array.isArray(s.class_ids)
                        ? s.class_ids.map((n) => String(n))
                        : [],
                    });
                    setEditOpen(true);
                  }}
                  disabled={updateStudent.isPending}
                >
                  Edit
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deleteStudent.isPending}
                    >
                      Archive
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Archive student?</DialogTitle>
                      <DialogDescription>
                        The student's invoices as well as enrollments in classes
                        and lessons will be hidden but not deleted.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={() => deleteStudent.mutate(id)}
                        disabled={deleteStudent.isPending}
                      >
                        {deleteStudent.isPending ? 'Archiving…' : 'Archive'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </TableCell>
        </TableRow>
      );
    });
  }, [data, classMap, updateStudent.isPending, deleteStudent.isPending]);

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>Error: {(error as Error).message}</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Students</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">New student</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New student</DialogTitle>
              <DialogDescription>
                Create a new student and optionally assign classes.
              </DialogDescription>
            </DialogHeader>
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                createStudent.mutate();
              }}
            >
              <div className="flex flex-col gap-1">
                <label htmlFor={nameId} className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id={nameId}
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Jane Doe"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={schoolId} className="text-sm font-medium">
                  School
                </label>
                <Input
                  id={schoolId}
                  value={createForm.school}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, school: e.target.value }))
                  }
                  placeholder="Springfield High"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={phoneId} className="text-sm font-medium">
                  Phone
                </label>
                <Input
                  id={phoneId}
                  value={createForm.phone}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+65 8123 4567"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={emailId} className="text-sm font-medium">
                  Email
                </label>
                <Input
                  type="email"
                  id={emailId}
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="jane@example.com"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div id={classesId} className="text-sm font-medium">
                  Classes
                </div>
                <MultiSelect
                  aria-labelledby={classesId}
                  value={createForm.classIds}
                  onValueChange={(v) =>
                    setCreateForm((p) => ({ ...p, classIds: v }))
                  }
                  options={(classesData ?? []).map((cls) => ({
                    value: String(cls.id),
                    label: formatClassLabel(cls),
                  }))}
                />
              </div>
              <DialogFooter className="mt-2">
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={
                    !createForm.name ||
                    !createForm.school ||
                    !createForm.phone ||
                    !createForm.email ||
                    createStudent.isPending
                  }
                >
                  {createStudent.isPending ? 'Creating…' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>School</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Enrolled Classes</TableHead>
            <TableHead className="w-[160px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{rows}</TableBody>
      </Table>
      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{`Edit Student #${editForm.id ?? ''}`}</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!editForm.id) return;
              if (
                !editForm.name ||
                !editForm.school ||
                !editForm.phone ||
                !editForm.email
              )
                return;
              updateStudent.mutate(
                {
                  id: editForm.id,
                  patch: {
                    name: editForm.name,
                    school: editForm.school,
                    phone: editForm.phone,
                    email: editForm.email,
                    class_ids: editForm.classIds.map((x) => Number(x)),
                  },
                },
                {
                  onSuccess: async () => {
                    setEditOpen(false);
                  },
                },
              );
            }}
          >
            <div className="flex flex-col gap-1">
              <label
                className="text-sm font-medium"
                htmlFor={`${formId}-edit-name`}
              >
                Name
              </label>
              <Input
                id={`${formId}-edit-name`}
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Jane Doe"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                className="text-sm font-medium"
                htmlFor={`${formId}-edit-school`}
              >
                School
              </label>
              <Input
                id={`${formId}-edit-school`}
                value={editForm.school}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, school: e.target.value }))
                }
                placeholder="Springfield High"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                className="text-sm font-medium"
                htmlFor={`${formId}-edit-phone`}
              >
                Phone
              </label>
              <Input
                id={`${formId}-edit-phone`}
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+65 8123 4567"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                className="text-sm font-medium"
                htmlFor={`${formId}-edit-email`}
              >
                Email
              </label>
              <Input
                type="email"
                id={`${formId}-edit-email`}
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="jane@example.com"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div
                id={`${formId}-edit-classes`}
                className="text-sm font-medium"
              >
                Classes
              </div>
              <MultiSelect
                aria-labelledby={`${formId}-edit-classes`}
                value={editForm.classIds}
                onValueChange={(v) =>
                  setEditForm((p) => ({ ...p, classIds: v }))
                }
                options={(classesData ?? []).map((cls) => ({
                  value: String(cls.id),
                  label: formatClassLabel(cls),
                }))}
              />
            </div>
            <DialogFooter className="mt-2">
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={
                  !editForm.name ||
                  !editForm.school ||
                  !editForm.phone ||
                  !editForm.email ||
                  updateStudent.isPending
                }
              >
                {updateStudent.isPending ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
