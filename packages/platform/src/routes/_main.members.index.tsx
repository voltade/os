import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  Flex,
  Group,
  Loader,
  Menu,
  Modal,
  Pagination,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCrown,
  IconDots,
  IconEdit,
  IconMail,
  IconPhone,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUser,
  IconUserCheck,
  IconUserX,
} from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { api } from '#src/lib/api.ts';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/members/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: organisation, isPending } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
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

  // Get current user's role in the organization
  const currentUserMember = organisation?.members?.find(
    (member) => member.userId === session?.user?.id,
  );
  const currentUserRole = currentUserMember?.role;
  const canInviteMembers =
    currentUserRole === 'admin' || currentUserRole === 'owner';
  const canViewMembers =
    currentUserRole === 'admin' || currentUserRole === 'owner';

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
      const response = await api.members.invite.$post({
        json: {
          name: values.name,
          email: values.email,
          role: values.role as 'admin' | 'member' | 'owner',
        },
      });

      if (response.ok) {
        const result = await response.json();
        notifications.show({
          title: 'Invitation sent',
          message: result.message || `We’ve sent an invite to ${values.email}`,
          color: 'green',
        });
        form.reset();
        close();
      } else {
        const errorJson = (await response.json().catch(() => null)) as unknown;
        const message =
          (errorJson && (errorJson as any).error) ||
          (errorJson && (errorJson as any).message) ||
          'Please try again later';
        notifications.show({
          title: 'Failed to send invitation',
          message,
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

  // Get members from organization data
  const members = organisation?.members || [];

  // Filter and paginate members
  const {
    filteredMembers,
    totalPages,
    paginatedMembers,
    totalFilteredMembers,
  } = useMemo(() => {
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
      filteredMembers: filtered,
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

  const getRoleIcon = (role: string) => {
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
          <Title order={2}>Members</Title>
          <Text c="dimmed">
            Manage your team members and their permissions in{' '}
            {organisation?.name}
            {totalFilteredMembers > 0 && (
              <Text component="span" c="dimmed" ml="xs">
                • {totalFilteredMembers} member
                {totalFilteredMembers === 1 ? '' : 's'}
              </Text>
            )}
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

      {/* Filters */}
      <Card withBorder p="md">
        <Group>
          <TextInput
            placeholder="Search members..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filter by role"
            data={[
              { value: 'owner', label: 'Owner' },
              { value: 'admin', label: 'Admin' },
              { value: 'member', label: 'Member' },
            ]}
            value={roleFilter}
            onChange={handleRoleFilterChange}
            clearable
          />
        </Group>
      </Card>

      {/* Members List */}
      <Stack gap="sm">
        {paginatedMembers.map((member) => (
          <Card key={member.id} withBorder p="md">
            <Group justify="space-between">
              <Group>
                <Avatar
                  src={member.user.image}
                  name={member.user.name}
                  color="initials"
                  size="lg"
                />
                <div>
                  <Group gap="xs" align="center">
                    <Text fw={500}>{member.user.name}</Text>
                    <Badge
                      size="xs"
                      color={getRoleBadgeColor(member.role)}
                      leftSection={getRoleIcon(member.role)}
                    >
                      {capitalizeRole(member.role)}
                    </Badge>
                  </Group>
                  <Group gap="md" mt={4} wrap="nowrap">
                    <Group gap={4} align="center">
                      <IconMail size={14} color="var(--mantine-color-gray-6)" />
                      <Text size="sm" c="dimmed">
                        {member.user.email}
                      </Text>
                    </Group>
                  </Group>
                  <Text size="xs" c="dimmed" mt={2}>
                    Joined {formatDate(member.createdAt.toString())}
                  </Text>
                </div>
              </Group>

              <Menu shadow="md" width={220}>
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray">
                    <IconDots size={16} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconEdit size={14} />} disabled>
                    Edit Member
                  </Menu.Item>
                  <Menu.Item leftSection={<IconMail size={14} />} disabled>
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
            </Group>
          </Card>
        ))}
      </Stack>

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
