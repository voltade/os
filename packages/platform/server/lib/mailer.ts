import nodemailer from 'nodemailer';

import { appEnvVariables } from '#server/env.ts';

export const mailer = nodemailer.createTransport({
  host: appEnvVariables.SMTP_HOST,
  port: appEnvVariables.SMTP_PORT,
  secure: appEnvVariables.SMTP_SECURE,
  auth: {
    user: appEnvVariables.SMTP_USER,
    pass: appEnvVariables.SMTP_PASS,
  },
  from: appEnvVariables.SMTP_FROM,
});
