import { zValidator } from '@hono/zod-validator';
import {
  educationStudentJoinClassTable,
  educationStudentTable,
} from '@voltade/core-schema/schemas';
import { auth, drizzle } from '@voltade/sdk/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { factory } from '#server/factory.ts';

const createSchema = z.object({
  name: z.string().min(1),
  school: z.string().min(1),
  phone: z.string().min(1),
  class_ids: z.array(z.number()).optional().default([]),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  school: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  class_ids: z.array(z.number()).optional(),
});

export const route = factory
  .createApp()
  // Create a student
  .post('/', zValidator('json', createSchema), auth, drizzle(), async (c) => {
    const { name, school, phone, class_ids } = c.req.valid('json');

    const created = await c.var.tx.transaction(async (tx) => {
      const [student] = await tx
        .insert(educationStudentTable)
        .values({ name, school, phone })
        .returning();

      if (!student) throw new Error('Failed to create student');

      const ids = class_ids ?? [];
      if (ids.length > 0) {
        await tx.insert(educationStudentJoinClassTable).values(
          ids.map((classId) => ({
            student_id: student.id,
            class_id: classId,
          })),
        );
      }

      return student;
    });

    return c.json({ data: created });
  })
  // Update a student
  // TODO: Fix a bug preventing a student with no classes from being assigned new classes.
  .patch(
    '/:id{[0-9]+}',
    zValidator('json', updateSchema),
    auth,
    drizzle(),
    async (c) => {
      const id = Number(c.req.param('id'));
      const body = c.req.valid('json');

      const updated = await c.var.tx.transaction(async (tx) => {
        const { class_ids, ...studentUpdate } = body;

        let [student] = await tx
          .update(educationStudentTable)
          .set(studentUpdate)
          .where(eq(educationStudentTable.id, id))
          .returning();

        if (!student) throw new Error('Student not found');

        if (class_ids) {
          // Replace memberships
          await tx
            .delete(educationStudentJoinClassTable)
            .where(eq(educationStudentJoinClassTable.student_id, id));
          if (class_ids.length > 0) {
            await tx.insert(educationStudentJoinClassTable).values(
              class_ids.map((classId) => ({
                student_id: id,
                class_id: classId,
              })),
            );
          }
        }
        // Re-read student row
        [student] = await tx
          .select()
          .from(educationStudentTable)
          .where(eq(educationStudentTable.id, id));

        return student;
      });

      return c.json({ data: updated });
    },
  )
  // Delete a student
  .delete('/:id{[0-9]+}', auth, drizzle(), async (c) => {
    const id = Number(c.req.param('id'));

    await c.var.tx
      .update(educationStudentTable)
      .set({ is_active: false })
      .where(eq(educationStudentTable.id, id));

    return c.json({ ok: true });
  });

export default route;
