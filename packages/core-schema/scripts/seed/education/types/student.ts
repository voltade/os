import type { Parent } from './parent.ts';

export interface Student {
  name: string;
  email: string;
  school: string;
  phone: string;
  created_at: Date;
  parents: Parent[];
}
