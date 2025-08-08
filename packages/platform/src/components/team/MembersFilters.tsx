import { ActionIcon, Group, SegmentedControl, TextInput } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';

interface MembersFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  roleFilter: string | null;
  onRoleFilterChange: (role: string | null) => void;
}

export function MembersFilters({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
}: MembersFiltersProps) {
  return (
    <Group wrap="wrap" gap="md" p="md">
      <TextInput
        placeholder="Search members..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ flex: 1, minWidth: 260 }}
        rightSection={
          searchQuery ? (
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => onSearchChange('')}
            >
              <IconX size={14} />
            </ActionIcon>
          ) : null
        }
      />
      <SegmentedControl
        value={roleFilter ?? 'all'}
        onChange={(val) => onRoleFilterChange(val === 'all' ? null : val)}
        data={[
          { value: 'all', label: 'All' },
          { value: 'owner', label: 'Owner' },
          { value: 'admin', label: 'Admin' },
          { value: 'member', label: 'Member' },
        ]}
      />
    </Group>
  );
}
