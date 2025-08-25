import nodemailer from 'nodemailer';

import { platformEnvVariables } from '#server/env.ts';

export const mailer = nodemailer.createTransport({
  host: platformEnvVariables.SMTP_HOST,
  port: platformEnvVariables.SMTP_PORT,
  secure: platformEnvVariables.SMTP_SECURE,
  // TODO: remove this for production
  tls: { rejectUnauthorized: false },
  auth: {
    user: platformEnvVariables.SMTP_USER,
    pass: platformEnvVariables.SMTP_PASS,
  },
  from: platformEnvVariables.SMTP_FROM,
});
