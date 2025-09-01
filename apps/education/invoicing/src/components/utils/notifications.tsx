import { showNotification } from '@mantine/notifications';
import {
  IconAlertTriangleFilled,
  IconCheck,
  IconInfoCircleFilled,
  IconX,
} from '@tabler/icons-react';

export const DEFAULT_AUTOCLOSE_MS = 2000;

export const showSuccess = (
  message: string,
  autoClose: number | boolean = DEFAULT_AUTOCLOSE_MS,
) =>
  showNotification({
    color: 'green',
    icon: <IconCheck size={16} />,
    message,
    autoClose,
  });

export const showInfo = (
  message: string,
  autoClose: number | boolean = DEFAULT_AUTOCLOSE_MS,
) =>
  showNotification({
    color: 'gray',
    icon: <IconInfoCircleFilled size={16} />,
    message,
    autoClose,
  });

export const showWarning = (
  message: string,
  autoClose: number | boolean = DEFAULT_AUTOCLOSE_MS,
) =>
  showNotification({
    color: 'yellow',
    icon: <IconAlertTriangleFilled size={16} />,
    message,
    autoClose,
  });

export const showError = (message: string, autoClose?: number | boolean) =>
  showNotification({
    color: 'red',
    icon: <IconX size={16} />,
    message,
    autoClose,
  });
