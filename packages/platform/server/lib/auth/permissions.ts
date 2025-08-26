import { createAccessControl } from 'better-auth/plugins/access';
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from 'better-auth/plugins/organization/access';

const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

const owner = ac.newRole({
  ...ownerAc.statements,
});

const admin = ac.newRole({
  ...adminAc.statements,
});

const developer = ac.newRole({
  ...adminAc.statements,
});

const guest = ac.newRole({
  ...memberAc.statements,
});

const member = ac.newRole({
  ...memberAc.statements,
});

export const roles = { owner, admin, developer, member, guest };
export const statements = statement;
