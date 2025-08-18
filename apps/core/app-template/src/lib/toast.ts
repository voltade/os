import { toast as sonnerToast } from 'sonner';

export const toast = window.toast ?? sonnerToast;
