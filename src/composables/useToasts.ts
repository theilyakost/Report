import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
    duration: number;
    onUndo?: () => void;
}

const toasts = ref<Toast[]>([]);

export function useToasts() {
    const hideToast = (id: number) => {
        const index = toasts.value.findIndex(t => t.id === id);
        if (index > -1) {
            toasts.value.splice(index, 1);
        }
    };

    const showToast = (message: string, type: ToastType = 'info', duration: number = 5000, onUndo?: () => void): number => {
        const id = Date.now() + Math.random();

        if (onUndo) {
            toasts.value = [];
        }

        toasts.value.push({ id, message, type, duration, onUndo });

        setTimeout(() => {
            hideToast(id);
        }, duration);

        return id;
    };

    return { toasts, showToast, hideToast };
}