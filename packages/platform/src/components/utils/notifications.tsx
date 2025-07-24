import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

export const showSuccess = (message: string) =>
  showNotification({
    color: 'green',
    icon: <IconCheck size={16} />,
    message,
  });
export const showError = (message: string) =>
  showNotification({
    color: 'red',
    icon: <IconX size={16} />,
    message,
  });
