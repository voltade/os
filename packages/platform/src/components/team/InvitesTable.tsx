import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Table,
  Text,
} from '@mantine/core';
import { IconMail } from '@tabler/icons-react';

export interface InviteRow {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | string;
  expiresAt?: string | Date | null;
  status?: string;
}

interface InvitesTableProps {
  invites: InviteRow[];
  loading?: boolean;
  onResend: (email: string, role: string) => void;
  onCancel: (invitationId: string) => void;
  getRoleBadgeColor: (role: string) => string;
  formatDate: (s: string) => string;
}

export function InvitesTable({
  invites,
  loading,
  onResend,
  onCancel,
  getRoleBadgeColor,
  formatDate,
}: InvitesTableProps) {
  return (
    <Table highlightOnHover horizontalSpacing="md" verticalSpacing="md">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Email</Table.Th>
          <Table.Th>Role</Table.Th>
          <Table.Th>Expires</Table.Th>
          <Table.Th style={{ width: 120 }}>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {loading ? (
          <Table.Tr>
            <Table.Td colSpan={4}>
              <Center p="lg">
                <Loader size="sm" />
              </Center>
            </Table.Td>
          </Table.Tr>
        ) : invites.length === 0 ? (
          <Table.Tr>
            <Table.Td colSpan={4}>
              <Center p="lg">
                <Text c="dimmed">No pending invitations</Text>
              </Center>
            </Table.Td>
          </Table.Tr>
        ) : (
          invites.map((inv) => (
            <Table.Tr key={inv.id}>
              <Table.Td>
                <Group gap={6} align="center">
                  <IconMail size={14} />
                  <Text>{inv.email}</Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <Badge size="sm" color={getRoleBadgeColor(inv.role)}>
                  {inv.role.charAt(0).toUpperCase() + inv.role.slice(1)}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {inv.expiresAt
                    ? formatDate(new Date(inv.expiresAt).toString())
                    : '—'}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group gap="xs" justify="flex-start">
                  <Button
                    size="xs"
                    variant="subtle"
                    onClick={() => onResend(inv.email, inv.role)}
                  >
                    Resend
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    onClick={() => onCancel(inv.id)}
                  >
                    Cancel
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))
        )}
      </Table.Tbody>
    </Table>
  );
}
