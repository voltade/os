import { Group } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { Input } from '@voltade/ui/input.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voltade/ui/select.tsx';

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
      <div className="flex-1 min-w-[260px]">
        <div className="relative">
          <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
          <Input
            className="pl-8 w-full"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onSearchChange(e.target.value)
            }
          />
          {searchQuery && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => onSearchChange('')}
            >
              <IconX className="size-4" />
            </button>
          )}
        </div>
      </div>

      <Select
        value={roleFilter ?? 'all'}
        onValueChange={(val) => onRoleFilterChange(val === 'all' ? null : val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="owner">Owner</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="developer">Developer</SelectItem>
          <SelectItem value="member">Member</SelectItem>
        </SelectContent>
      </Select>
    </Group>
  );
}
