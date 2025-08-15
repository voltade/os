import { Avatar, AvatarFallback, AvatarImage } from '@voltade/ui/avatar.tsx';
import { Badge as ShadcnBadge } from '@voltade/ui/badge.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@voltade/ui/dropdown-menu.tsx';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as ShadcnSelect,
} from '@voltade/ui/select.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@voltade/ui/table.tsx';
import { Tooltip } from '@voltade/ui/tooltip.tsx';
import { Edit, Mail, MoreHorizontal, Trash2 } from 'lucide-react';

interface UserRef {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface MemberRow {
  id: string;
  userId: string;
  user: UserRef;
  role: 'owner' | 'admin' | 'developer' | 'member' | string;
  createdAt: string | Date;
}

export interface MembersTableProps {
  rows: MemberRow[];
  currentUserId?: string;
  canEditRoles: boolean;
  roleLoadingMemberId?: string | null;
  onChangeRole: (
    memberId: string,
    role: 'owner' | 'admin' | 'developer' | 'member',
  ) => void;
  onRemove: (memberId: string, memberName: string) => void;
}

export function MembersTable({
  rows,
  currentUserId,
  canEditRoles,
  roleLoadingMemberId,
  onChangeRole,
  onRemove,
}: MembersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="w-[220px]">Role</TableHead>
          <TableHead className="w-[60px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((member) => {
          const isYou = member.userId === currentUserId;
          const canEditThis = canEditRoles && !isYou;
          return (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    {member.user.image ? (
                      <AvatarImage
                        src={member.user.image}
                        alt={member.user.name}
                      />
                    ) : (
                      <AvatarFallback>
                        {member.user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.user.name}</span>
                      {isYou && (
                        <ShadcnBadge variant="secondary">You</ShadcnBadge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail size={14} />
                      <span>{member.user.email}</span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {new Date(member.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <ShadcnSelect
                    value={member.role}
                    onValueChange={(val) =>
                      onChangeRole(
                        member.id,
                        val as 'owner' | 'admin' | 'developer' | 'member',
                      )
                    }
                    disabled={!canEditThis}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </ShadcnSelect>
                  {roleLoadingMemberId === member.id && (
                    <span className="ml-2 inline-block size-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-md p-1"
                    >
                      <Tooltip>
                        <MoreHorizontal size={16} />
                      </Tooltip>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      onClick={() => {
                        window.location.href = `http://127.0.0.1.nip.io/apps/ma93tqa2p#/settings`;
                      }}
                    >
                      <Edit size={14} className="mr-2" /> Edit Member
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Mail size={14} className="mr-2" /> Send Message
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {!isYou && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive-foreground"
                        onClick={() => onRemove(member.id, member.user.name)}
                      >
                        <Trash2
                          size={14}
                          className="mr-2 text-destructive focus:text-destructive-foreground"
                        />{' '}
                        Remove Member
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
