import {
  Button,
  Divider,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconPlus } from '@tabler/icons-react';

interface InviteMemberModalProps<T> {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<T>;
  roleOptions: { value: string; label: string }[];
  isInviting: boolean;
  onSubmit: (values: T) => void | Promise<void>;
}

export function InviteMemberModal<T>({
  opened,
  onClose,
  form,
  roleOptions,
  isInviting,
  onSubmit,
}: InviteMemberModalProps<T>) {
  return (
    <Modal opened={opened} onClose={onClose} title="Invite New Member" centered>
      <form onSubmit={form.onSubmit(onSubmit as any)}>
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            We’ll email an invitation to this person. They’ll be able to join
            your organization with the selected role.
          </Text>

          <TextInput
            label="Full Name"
            placeholder="Enter member's full name"
            withAsterisk
            {...(form.getInputProps as any)('name')}
          />

          <TextInput
            label="Email Address"
            placeholder="Enter member's email"
            type="email"
            withAsterisk
            {...(form.getInputProps as any)('email')}
          />

          <Select
            label="Role"
            placeholder="Select member role"
            data={roleOptions}
            withAsterisk
            {...(form.getInputProps as any)('role')}
          />

          <Divider my="xs" />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose} disabled={isInviting}>
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
  );
}
