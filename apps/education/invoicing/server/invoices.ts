import { zValidator } from '@hono/zod-validator';
import { auth, drizzle } from '@voltade/sdk/server';
import { z } from 'zod';

import { factory } from '#server/factory.ts';

const createInvoiceSchema = z.object({
  student_id: z.number(),
  term_id: z.number(),
});

export const route = factory
  .createApp()
  .post(
    '/',
    zValidator('json', createInvoiceSchema),
    auth,
    drizzle(),
    async (c) => {
      const { student_id, term_id } = c.req.valid('json');

      console.log(student_id, term_id);

      return c.json({ ok: true });
    },
  );
