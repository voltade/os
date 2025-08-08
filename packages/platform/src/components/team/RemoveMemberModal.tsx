import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

interface RemoveMemberModalProps {
  opened: boolean;
  onClose: () => void;
  memberName?: string | null;
  isRemoving: boolean;
  onConfirm: () => void;
}

export function RemoveMemberModal({
  opened,
  onClose,
  memberName,
  isRemoving,
  onConfirm,
}: RemoveMemberModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Remove Member" centered>
      <Stack gap="md">
        <Text>
          Are you sure you want to remove <strong>{memberName}</strong> from
          this organization?
        </Text>
        <Text size="sm" c="dimmed">
          This action cannot be undone. The member will lose access to all
          organization resources.
        </Text>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose} disabled={isRemoving}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={onConfirm}
            leftSection={<IconTrash size={16} />}
            loading={isRemoving}
          >
            Remove Member
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
