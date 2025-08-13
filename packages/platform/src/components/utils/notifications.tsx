import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

export const showSuccess = (message: string) =>
  toast.success(message, {
    icon: <Check size={16} />,
  });

export const showError = (message: string) =>
  toast.error(message, {
    icon: <X size={16} />,
  });
