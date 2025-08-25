import z from 'zod';

export const MemberRole = [
  'owner',
  'admin',
  'developer',
  'member',
  'guest',
] as const;
export const memberRoleSchema = z.enum(MemberRole);
