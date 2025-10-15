import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

/**
 * Глобальное реактивное состояние для всех уведомлений.
 * Определяем его вне функции, чтобы оно было синглтоном
 */
const toasts = ref<Toast[]>([]);

/**
 * Composable-функция для управления уведомлениями.
 */
export function useToasts() {

    /**
     * Показывает новое уведомление.
     * @param message Текст уведомления.
     * @param type Тип ('success', 'error', 'info').
     * @param duration Время отображения в миллисекундах.
     */
    const showToast = (message: string, type: ToastType = 'info', duration: number = 4000) => {
        const id = Date.now() + Math.random();
        toasts.value.push({ id, message, type });

        setTimeout(() => {
            hideToast(id);
        }, duration);
    };

    /**
     * Скрывает уведомление по его ID.
     * @param id Уникальный идентификатор уведомления.
     */
    const hideToast = (id: number) => {
        const index = toasts.value.findIndex(t => t.id === id);
        if (index > -1) {
            toasts.value.splice(index, 1);
        }
    };

    /**
     * Возвращаем сам массив уведомлений (для отображения в App.vue)
     * и функцию для их создания (для использования в других компонентах).
     */
    return { toasts, showToast };
}