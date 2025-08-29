import { zValidator } from '@hono/zod-validator';
import {
  educationParentTable,
  educationStudentJoinClassTable,
  educationStudentJoinParentTable,
  educationStudentTable,
} from '@voltade/core-schema/schemas';
import { auth, drizzle } from '@voltade/sdk/server';
import { z } from 'zod';

import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { platformClient } from '#server/utils/platformClient.ts';

const registrationSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  selected_class_ids: z.array(z.number()).min(1),
});

export const route = factory
  .createApp()
  .post(
    '/',
    auth,
    drizzle(),
    zValidator('json', registrationSchema),
    async (c) => {
      const { name, email, selected_class_ids } = c.req.valid('json');
      const user = c.get('user');
      const userId = user?.id;

      if (!userId) throw new Error('User not found');

      const result = await c.var.tx.transaction(async (tx) => {
        const parentData = await tx
          .insert(educationParentTable)
          .values({
            //id: userId,
            name,
            email,
          })
          .returning();

        const parent = parentData[0];

        if (!parent) {
          throw new Error('Failed to create parent');
        }

        await platformClient({
          url: '/api/organization/guest/add',
          body: {
            userId: user?.id,
          },
        });

        const [student] = await tx
          .insert(educationStudentTable)
          .values({ name, email })
          .returning();

        if (!student) throw new Error('Failed to create student');

        await platformClient({
          url: '/api/organization/guest/invite',
          body: {
            email,
            redirectUrl: '/o/voltade/registration/invite',
          },
        });

        await tx.insert(educationStudentJoinParentTable).values({
          student_id: student.id,
          parent_id: parent.id,
          relationship: 'father',
        });

        const joinRows = selected_class_ids.map((classId) => ({
          student_id: student.id,
          class_id: classId,
        }));

        await tx.insert(educationStudentJoinClassTable).values(joinRows);

        return student;
      });

      return c.json({ data: result });
    },
  );
