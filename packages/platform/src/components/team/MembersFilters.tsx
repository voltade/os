import { ActionIcon, Group, Select, TextInput } from '@mantine/core';
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

      <Select
        placeholder="All roles"
        data={[
          { value: 'owner', label: 'Owner' },
          { value: 'admin', label: 'Admin' },
          { value: 'developer', label: 'Developer' },
          { value: 'member', label: 'Member' },
        ]}
        value={roleFilter}
        clearable
        onChange={(val) => onRoleFilterChange(val)}
        style={{ minWidth: 200 }}
      />
    </Group>
  );
}
