import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  CopyButton,
  Divider,
  Group,
  Loader,
  Menu,
  Modal,
  Pagination,
  SegmentedControl,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCopy,
  IconCrown,
  IconDots,
  IconEdit,
  IconMail,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconUser,
  IconUserCheck,
  IconX,
} from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/team/')({
  component: RouteComponent,
});

// Types for invites returned by Better Auth (narrow subset we use)
interface OrganizationInviteRow {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | string;
  expiresAt?: string | Date | null;
  status?: 'pending' | 'cancelled' | 'accepted' | string;
}

function RouteComponent() {
  const { data: organisation, isPending } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<'members' | 'invites'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);
  const [pageSize] = useState(10); // Members per page
  const [opened, { open, close }] = useDisclosure(false);
  const [
    removeModalOpened,
    { open: openRemoveModal, close: closeRemoveModal },
  ] = useDisclosure(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [roleUpdateMemberId, setRoleUpdateMemberId] = useState<string | null>(
    null,
  );

  // Invites state
  const [invites, setInvites] = useState<OrganizationInviteRow[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);

  // Get current user's role in the organization
  const currentUserMember = organisation?.members?.find(
    (member) => member.userId === session?.user?.id,
  );
  const currentUserRole = currentUserMember?.role;
  const canInviteMembers =
    currentUserRole === 'admin' || currentUserRole === 'owner';
  const canViewMembers =
    currentUserRole === 'admin' || currentUserRole === 'owner';
  const canEditRoles = currentUserRole === 'owner';

  // Get allowed roles for invitation based on current user's role
  const getAllowedRoles = () => {
    if (currentUserRole === 'owner') {
      return [
        { value: 'member', label: 'Member' },
        { value: 'admin', label: 'Admin' },
        { value: 'owner', label: 'Owner' },
      ];
    }
    if (currentUserRole === 'admin') {
      return [{ value: 'member', label: 'Member' }];
    }
    return [];
  };

  // Form for inviting members
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      role: 'member',
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+$/.test(value)) return 'Invalid email';
        return null;
      },
      role: (value) => (!value ? 'Role is required' : null),
    },
  });

  const handleRemoveMemberClick = (member: { id: string; name: string }) => {
    setMemberToRemove(member);
    openRemoveModal();
  };

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);

    try {
      await authClient.organization.removeMember({
        memberIdOrEmail: memberToRemove.id,
        organizationId: organisation?.id || '',
      });
      notifications.show({
        title: 'Member removed',
        message: `${memberToRemove.name} has been removed from the organization`,
        color: 'green',
      });
      closeRemoveModal();
      setMemberToRemove(null);
    } catch (error) {
      console.error('Error removing member:', error);
      notifications.show({
        title: 'Failed to remove member',
        message:
          error instanceof Error ? error.message : 'Something went wrong',
        color: 'red',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleInviteMember = async (values: typeof form.values) => {
    setIsInviting(true);

    try {
      const { error } = await authClient.organization.inviteMember({
        email: values.email,
        role: values.role as 'admin' | 'member' | 'owner',
        organizationId: organisation?.id || undefined,
      });

      if (!error) {
        notifications.show({
          title: 'Invitation sent',
          message: `We’ve sent an invite to ${values.email}`,
          color: 'green',
        });
        form.reset();
        close();
        // refresh invites list if on invites tab
        if (activeTab === 'invites') await fetchInvites();
      } else {
        notifications.show({
          title: 'Failed to send invitation',
          message: error.message || 'Please try again later',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      notifications.show({
        title: 'Failed to send invitation',
        message:
          error instanceof Error ? error.message : 'Please try again later',
        color: 'red',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateRole = async (
    memberId: string,
    newRole: 'member' | 'admin' | 'owner',
  ) => {
    setRoleUpdateMemberId(memberId);
    try {
      const { error } = await authClient.organization.updateMemberRole({
        memberId,
        role: newRole,
        organizationId: organisation?.id || undefined,
      });
      if (error) throw new Error(error.message);
      notifications.show({
        title: 'Role updated',
        message: 'Member role has been updated',
        color: 'green',
      });
    } catch (e) {
      notifications.show({
        title: 'Failed to update role',
        message: e instanceof Error ? e.message : 'Unknown error',
        color: 'red',
      });
    } finally {
      setRoleUpdateMemberId(null);
    }
  };

  // Invites helpers
  const fetchInvites = useCallback(async () => {
    if (!organisation?.id) return;
    setInvitesLoading(true);
    try {
      const { data, error } = await authClient.organization.listInvitations({
        query: { organizationId: organisation.id },
      });
      if (error) throw new Error(error.message);
      const onlyPending = (data || []).filter(
        (i: OrganizationInviteRow) => (i.status ?? 'pending') === 'pending',
      );
      setInvites(onlyPending as OrganizationInviteRow[]);
    } catch (e) {
      notifications.show({
        title: 'Failed to load invitations',
        message: e instanceof Error ? e.message : 'Unknown error',
        color: 'red',
      });
    } finally {
      setInvitesLoading(false);
    }
  }, [organisation?.id]);

  const handleCancelInvite = async (invitationId: string) => {
    try {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId,
      });
      if (error) throw new Error(error.message);
      notifications.show({
        title: 'Invitation cancelled',
        message: 'The invite has been cancelled',
        color: 'green',
      });
      await fetchInvites();
    } catch (e) {
      notifications.show({
        title: 'Failed to cancel invitation',
        message: e instanceof Error ? e.message : 'Unknown error',
        color: 'red',
      });
    }
  };

  const handleResendInvite = async (email: string, role: string) => {
    try {
      const { error } = await authClient.organization.inviteMember({
        email,
        role: role as 'admin' | 'member' | 'owner',
        organizationId: organisation?.id || undefined,
        resend: true,
      });
      if (error) throw new Error(error.message);
      notifications.show({
        title: 'Invitation re-sent',
        message: 'We have re-sent the invitation email',
        color: 'green',
      });
    } catch (e) {
      notifications.show({
        title: 'Failed to resend invitation',
        message: e instanceof Error ? e.message : 'Unknown error',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'invites') fetchInvites();
  }, [activeTab, fetchInvites]);

  // Get members from organization data
  const members = organisation?.members || [];

  // Filter and paginate members
  const { totalPages, paginatedMembers, totalFilteredMembers } = useMemo(() => {
    // First filter
    const filtered = members.filter((member) => {
      const matchesSearch =
        member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = !roleFilter || member.role === roleFilter;

      return matchesSearch && matchesRole;
    });

    // Then paginate
    const total = Math.ceil(filtered.length / pageSize);
    const startIndex = (activePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    return {
      totalPages: total,
      paginatedMembers: paginated,
      totalFilteredMembers: filtered.length,
    };
  }, [members, searchQuery, roleFilter, activePage, pageSize]);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setActivePage(1);
  };

  const handleRoleFilterChange = (value: string | null) => {
    setRoleFilter(value);
    setActivePage(1);
  };

  const _getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <IconCrown size={16} />;
      case 'admin':
        return <IconUserCheck size={16} />;
      default:
        return <IconUser size={16} />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'grape';
      case 'admin':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const capitalizeRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (isPending) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    );
  }

  // If user can't view members, show access denied
  if (!canViewMembers) {
    return (
      <Stack justify="center" align="center" h="60vh">
        <div className="text-center">
          <Title order={2} className="text-xl font-bold text-gray-900 mb-4">
            Access Denied
          </Title>
          <Text className="text-gray-600 mb-6">
            You don't have permission to view the members page. Only admins and
            owners can access member management.
          </Text>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2}>Team</Title>
          <Text c="dimmed">
            Manage members and invitations for {organisation?.name}
          </Text>
        </div>
        {canInviteMembers && (
          <Button
            leftSection={<IconPlus size={16} />}
            variant="filled"
            onClick={open}
          >
            Invite Member
          </Button>
        )}
      </Group>

      <Tabs
        value={activeTab}
        onChange={(v) => setActiveTab(v as 'members' | 'invites')}
      >
        <Tabs.List>
          <Tabs.Tab value="members">
            Members{' '}
            {totalFilteredMembers > 0 && (
              <Badge ml="xs" variant="light">
                {totalFilteredMembers}
              </Badge>
            )}
          </Tabs.Tab>
          <Tabs.Tab value="invites">
            Invites{' '}
            {invites.length > 0 && (
              <Badge ml="xs" variant="light">
                {invites.length}
              </Badge>
            )}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="members" pt="md">
          {/* Filters */}
          <Card withBorder p="md">
            <Group wrap="wrap" gap="md">
              <TextInput
                placeholder="Search members..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{ flex: 1, minWidth: 260 }}
                rightSection={
                  searchQuery ? (
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={() => handleSearchChange('')}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  ) : null
                }
              />
              <SegmentedControl
                value={roleFilter ?? 'all'}
                onChange={(val) =>
                  handleRoleFilterChange(val === 'all' ? null : val)
                }
                data={[
                  { value: 'all', label: 'All' },
                  { value: 'owner', label: 'Owner' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'member', label: 'Member' },
                ]}
              />
            </Group>
          </Card>

          {/* Members Table */}
          <Card withBorder p="0" radius="md" shadow="sm">
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
                {paginatedMembers.map((member) => (
                  <Table.Tr key={member.id}>
                    <Table.Td>
                      <Group>
                        <Avatar
                          src={member.user.image}
                          name={member.user.name}
                          color="initials"
                        />
                        <div>
                          <Group gap="xs" align="center">
                            <Text fw={500}>{member.user.name}</Text>
                            {member.userId === session?.user?.id && (
                              <Badge size="xs" variant="light">
                                You
                              </Badge>
                            )}
                          </Group>
                          <Group gap={6} align="center">
                            <IconMail
                              size={14}
                              color="var(--mantine-color-gray-6)"
                            />
                            <Text size="sm" c="dimmed">
                              {member.user.email}
                            </Text>
                            <CopyButton
                              value={member.user.email}
                              timeout={1200}
                            >
                              {({ copied, copy }) => (
                                <Tooltip
                                  label={copied ? 'Copied' : 'Copy email'}
                                  withArrow
                                >
                                  <ActionIcon
                                    size="sm"
                                    variant="subtle"
                                    color={copied ? 'green' : 'gray'}
                                    onClick={copy}
                                  >
                                    <IconCopy size={14} />
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </CopyButton>
                          </Group>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {new Date(member.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          },
                        )}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Select
                        disabled={
                          !canEditRoles || member.userId === session?.user?.id
                        }
                        data={[
                          { value: 'owner', label: 'Owner' },
                          { value: 'admin', label: 'Admin' },
                          { value: 'member', label: 'Member' },
                        ]}
                        value={member.role}
                        allowDeselect={false}
                        onChange={(val) =>
                          val &&
                          handleUpdateRole(
                            member.id,
                            val as 'owner' | 'admin' | 'member',
                          )
                        }
                        rightSection={
                          roleUpdateMemberId === member.id ? (
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
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            disabled
                          >
                            Edit Member
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconMail size={14} />}
                            disabled
                          >
                            Send Message
                          </Menu.Item>
                          <Menu.Divider />
                          {member.userId !== session?.user?.id && (
                            <Menu.Item
                              onClick={() =>
                                handleRemoveMemberClick({
                                  id: member.id,
                                  name: member.user.name,
                                })
                              }
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
          </Card>

          {paginatedMembers.length === 0 && !isPending && (
            <Center py="xl">
              <Stack align="center" gap="xs">
                <IconUser size={48} color="var(--mantine-color-gray-5)" />
                <Text c="dimmed">No members found matching your criteria</Text>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setRoleFilter(null);
                    setActivePage(1);
                  }}
                >
                  Clear Filters
                </Button>
                {canInviteMembers && (
                  <Button leftSection={<IconPlus size={16} />} onClick={open}>
                    Invite Member
                  </Button>
                )}
              </Stack>
            </Center>
          )}

          {totalPages > 1 && (
            <Group justify="center">
              <Pagination
                value={activePage}
                onChange={setActivePage}
                total={totalPages}
              />
            </Group>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="invites" pt="md">
          <Card withBorder p="0" radius="md" shadow="sm">
            <Group justify="space-between" p="md">
              <Text fw={500}>Pending invitations</Text>
              <ActionIcon onClick={fetchInvites} variant="subtle">
                <IconRefresh size={16} />
              </ActionIcon>
            </Group>
            <Divider />
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
                {invitesLoading ? (
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
                          {capitalizeRole(inv.role)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {inv.expiresAt
                            ? formatDate(
                                new Date(inv.expiresAt as any).toString(),
                              )
                            : '—'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="flex-start">
                          <Button
                            size="xs"
                            variant="subtle"
                            onClick={() =>
                              handleResendInvite(inv.email, inv.role)
                            }
                          >
                            Resend
                          </Button>
                          <Button
                            size="xs"
                            color="red"
                            variant="light"
                            onClick={() => handleCancelInvite(inv.id)}
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
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* Invite Member Modal */}
      <Modal opened={opened} onClose={close} title="Invite New Member" centered>
        <form onSubmit={form.onSubmit(handleInviteMember)}>
          <Stack gap="md">
            <Text c="dimmed" size="sm">
              We’ll email an invitation to this person. They’ll be able to join
              your organization with the selected role.
            </Text>

            <TextInput
              label="Full Name"
              placeholder="Enter member's full name"
              withAsterisk
              {...form.getInputProps('name')}
            />

            <TextInput
              label="Email Address"
              placeholder="Enter member's email"
              type="email"
              withAsterisk
              {...form.getInputProps('email')}
            />

            <Select
              label="Role"
              placeholder="Select member role"
              data={getAllowedRoles()}
              withAsterisk
              {...form.getInputProps('role')}
            />

            <Divider my="xs" />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={close} disabled={isInviting}>
                Cancel
              </Button>
              <Button
                type="submit"
                leftSection={<IconPlus size={16} />}
                loading={isInviting}
              >
                Send Invitation
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      <Modal
        opened={removeModalOpened}
        onClose={closeRemoveModal}
        title="Remove Member"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to remove{' '}
            <strong>{memberToRemove?.name}</strong> from this organization?
          </Text>
          <Text size="sm" c="dimmed">
            This action cannot be undone. The member will lose access to all
            organization resources.
          </Text>

          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              onClick={closeRemoveModal}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleConfirmRemoveMember}
              leftSection={<IconTrash size={16} />}
              loading={isRemoving}
            >
              Remove Member
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
