import { zValidator } from '@hono/zod-validator';
import { educationClassTable } from '@voltade/core-schema/schemas';
import { z } from 'zod';

import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';

const createClassSchema = z.object({
  level_group_id: z.number(),
  subject_id: z.number(),
  usual_day_of_the_week: z.enum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]),
  usual_start_time_utc: z.string(),
  usual_end_time_utc: z.string(),
});

export const route = factory
  .createApp()
  .post('/', zValidator('json', createClassSchema), async (c) => {
    const {
      level_group_id,
      subject_id,
      usual_day_of_the_week,
      usual_start_time_utc,
      usual_end_time_utc,
    } = c.req.valid('json');
    const [cls] = await db
      .insert(educationClassTable)
      .values({
        level_group_id,
        subject_id,
        usual_day_of_the_week,
        usual_start_time_utc,
        usual_end_time_utc,
      })
      .returning();
    return c.json({ data: cls });
  });
