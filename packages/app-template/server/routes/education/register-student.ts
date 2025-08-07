import { zValidator } from '@hono/zod-validator';
import { educationStudentTable } from '@voltade/core-schema/schemas';
import { z } from 'zod';

import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';

const registrationSchema = z.object({
  name: z.string().min(1),
  selected_class: z.number(),
});

export const route = factory
  .createApp()
  .post(
    '/register-student',
    zValidator('json', registrationSchema),
    async (c) => {
      const { name, selected_class } = c.req.valid('json');
      const [student] = await db
        .insert(educationStudentTable)
        .values({ name, selected_class })
        .returning();
      return c.json({ data: student });
    },
  );
