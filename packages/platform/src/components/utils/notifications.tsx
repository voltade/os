import { IconCheck, IconX } from '@tabler/icons-react';
import { toast } from 'sonner';

export const showSuccess = (message: string) =>
  toast.success(message, {
    icon: <IconCheck size={16} />,
  });

export const showError = (message: string) =>
  toast.error(message, {
    icon: <IconX size={16} />,
  });
