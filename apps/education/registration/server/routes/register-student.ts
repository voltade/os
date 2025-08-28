import { zValidator } from '@hono/zod-validator';
import {
  educationStudentJoinClassTable,
  educationStudentTable,
} from '@voltade/core-schema/schemas';
import { auth } from '@voltade/sdk/server';
import { z } from 'zod';

import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { inviteGuestToOrganisation } from '#server/utils/inviteGuestToOrganisation.ts';

const registrationSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  selected_class_ids: z.array(z.number()).min(1),
});

export const route = factory
  .createApp()
  .post('/', auth, zValidator('json', registrationSchema), async (c) => {
    const { name, email, selected_class_ids } = c.req.valid('json');
    const user = c.get('user');

    await inviteGuestToOrganisation(user?.id ?? '');

    const result = await db.transaction(async (tx) => {
      const [student] = await tx
        .insert(educationStudentTable)
        .values({ name, email })
        .returning();

      //TODO: upsert user if there is an email

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
