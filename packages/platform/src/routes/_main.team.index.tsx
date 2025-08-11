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

import { InviteMemberModal } from '#src/components/team/InviteMemberModal';
import { InvitesTable } from '#src/components/team/InvitesTable';
import { MembersFilters } from '#src/components/team/MembersFilters';
import { MembersTable } from '#src/components/team/MembersTable';
import { RemoveMemberModal } from '#src/components/team/RemoveMemberModal';
import { AccessDenied } from '#src/components/utils/access-denied';
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
        { value: 'developer', label: 'Developer' },
        { value: 'admin', label: 'Admin' },
        { value: 'owner', label: 'Owner' },
      ];
    }
    if (currentUserRole === 'admin') {
      return [
        { value: 'member', label: 'Member' },
        { value: 'developer', label: 'Developer' },
      ];
    }
    return [];
  };

  // Form for inviting members (no name required)
  const form = useForm({
    initialValues: {
      email: '',
      role: 'member',
    },
    validate: {
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
    newRole: 'member' | 'admin' | 'owner' | 'developer',
  ) => {
    setRoleUpdateMemberId(memberId);
    try {
      const { error } = await authClient.organization.updateMemberRole({
        memberId,
        role: newRole as any,
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
    return <AccessDenied />;
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
          {/* Members Table (with header filters) */}
          <Card withBorder p="0" radius="md" shadow="sm">
            <MembersFilters
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              roleFilter={roleFilter}
              onRoleFilterChange={handleRoleFilterChange}
            />
            <Divider />
            <MembersTable
              rows={paginatedMembers}
              currentUserId={session?.user?.id}
              canEditRoles={canEditRoles}
              onChangeRole={handleUpdateRole}
              roleLoadingMemberId={roleUpdateMemberId}
              onRemove={(id, name) => handleRemoveMemberClick({ id, name })}
            />
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
            <InvitesTable
              invites={invites}
              invitesLoading={invitesLoading}
              onCancelInvite={handleCancelInvite}
              onResendInvite={handleResendInvite}
            />
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* Invite Member Modal */}
      <InviteMemberModal
        opened={opened}
        onClose={close}
        form={form}
        roleOptions={getAllowedRoles()}
        isInviting={isInviting}
        onSubmit={handleInviteMember}
      />

      {/* Remove Member Confirmation Modal */}
      <RemoveMemberModal
        opened={removeModalOpened}
        onClose={closeRemoveModal}
        memberName={memberToRemove?.name ?? null}
        isRemoving={isRemoving}
        onConfirm={handleConfirmRemoveMember}
      />
    </Stack>
  );
}
