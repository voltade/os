import {
  ActionIcon,
  Avatar,
  Badge,
  Group,
  Loader,
  Menu,
  Select,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconDots, IconEdit, IconMail, IconTrash } from '@tabler/icons-react';

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
    <Table highlightOnHover horizontalSpacing="md" verticalSpacing="md">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Member</Table.Th>
          <Table.Th>Joined</Table.Th>
          <Table.Th style={{ width: 220 }}>Role</Table.Th>
          <Table.Th style={{ width: 60 }}></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((member) => (
          <Table.Tr key={member.id}>
            <Table.Td>
              <Group>
                <Avatar
                  src={member.user.image || undefined}
                  name={member.user.name}
                  color="initials"
                />
                <div>
                  <Group gap="xs" align="center">
                    <Text fw={500}>{member.user.name}</Text>
                    {member.userId === currentUserId && (
                      <Badge size="xs" variant="light">
                        You
                      </Badge>
                    )}
                  </Group>
                  <Group gap={6} align="center">
                    <IconMail size={14} color="var(--mantine-color-gray-6)" />
                    <Text size="sm" c="dimmed">
                      {member.user.email}
                    </Text>
                  </Group>
                </div>
              </Group>
            </Table.Td>
            <Table.Td>
              <Text size="sm" c="dimmed">
                {new Date(member.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </Table.Td>
            <Table.Td>
              <Select
                disabled={!canEditRoles || member.userId === currentUserId}
                data={[
                  { value: 'owner', label: 'Owner' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'developer', label: 'Developer' },
                  { value: 'member', label: 'Member' },
                ]}
                value={member.role}
                allowDeselect={false}
                onChange={(val) =>
                  val &&
                  onChangeRole(
                    member.id,
                    val as 'owner' | 'admin' | 'developer' | 'member',
                  )
                }
                rightSection={
                  roleLoadingMemberId === member.id ? (
                    <Loader size={16} />
                  ) : null
                }
              />
            </Table.Td>
            <Table.Td>
              <Menu shadow="md" width={220}>
                <Menu.Target>
                  <Tooltip label="Actions" withArrow>
                    <ActionIcon variant="subtle" color="gray">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconEdit size={14} />} disabled>
                    Edit Member
                  </Menu.Item>
                  <Menu.Item leftSection={<IconMail size={14} />} disabled>
                    Send Message
                  </Menu.Item>
                  <Menu.Divider />
                  {member.userId !== currentUserId && (
                    <Menu.Item
                      onClick={() => onRemove(member.id, member.user.name)}
                      color="red"
                      leftSection={<IconTrash size={14} />}
                    >
                      Remove Member
                    </Menu.Item>
                  )}
                </Menu.Dropdown>
              </Menu>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
