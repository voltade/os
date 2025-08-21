import { zValidator } from '@hono/zod-validator';
import {
  educationStudentJoinClassTable,
  educationStudentTable,
} from '@voltade/core-schema/schemas';
import { z } from 'zod';

import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';

const registrationSchema = z.object({
  name: z.string().min(1),
  school: z.string().min(1),
  phone: z.string().min(1),
  email: z.email(),
  selected_class_ids: z.array(z.number()).min(1),
});

export const route = factory
  .createApp()
  .post('/', zValidator('json', registrationSchema), async (c) => {
    const { name, school, phone, email, selected_class_ids } =
      c.req.valid('json');

    const result = await db.transaction(async (tx) => {
      const [student] = await tx
        .insert(educationStudentTable)
        .values({ name, school, phone, email })
        .returning();

      if (!student) throw new Error('Failed to create student');

      const joinRows = selected_class_ids.map((classId) => ({
        student_id: student.id,
        class_id: classId,
      }));

      await tx.insert(educationStudentJoinClassTable).values(joinRows);

      return student;
    });

    return c.json({ data: result });
  });
