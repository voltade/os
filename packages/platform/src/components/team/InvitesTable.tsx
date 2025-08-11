import { IconMail } from '@tabler/icons-react';
import { Badge } from '@voltade/ui/badge.tsx';
import { Button } from '@voltade/ui/button.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@voltade/ui/table.tsx';

export interface InviteRow {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | string;
  expiresAt?: string | Date | null;
  status?: string;
}

export interface InvitesTableProps {
  invites: InviteRow[];
  invitesLoading?: boolean;
  onResendInvite: (email: string, role: string) => void;
  onCancelInvite: (invitationId: string) => void;
}

export function InvitesTable({
  invites,
  invitesLoading,
  onResendInvite,
  onCancelInvite,
}: InvitesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="w-[120px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitesLoading ? (
          <TableRow>
            <TableCell colSpan={4}>
              <div className="flex items-center justify-center p-4">
                <span className="inline-block size-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
              </div>
            </TableCell>
          </TableRow>
        ) : invites.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4}>
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                No pending invitations
              </div>
            </TableCell>
          </TableRow>
        ) : (
          invites.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <IconMail size={14} />
                  <span>{inv.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {inv.role.charAt(0).toUpperCase() + inv.role.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {inv.expiresAt
                    ? new Date(inv.expiresAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResendInvite(inv.email, inv.role)}
                  >
                    Resend
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onCancelInvite(inv.id)}
                  >
                    Cancel
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
