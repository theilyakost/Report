import { vibrate as tauriVibrate } from '@tauri-apps/plugin-haptics';
export function useHaptics() {

    const vibrate = async (duration: number) => {
        try {
            await tauriVibrate(duration);
        } catch (e) {
            console.error(`Haptics (vibrate: ${duration}ms) failed:`, e);
        }
    };

    /**
     * Короткий, четкий отклик для выбора элементов.
     */
    const triggerSelection = () => {
        vibrate(20);
    };

    /**
     * Отклик для подтверждения успешного действия.
     */
    const triggerConfirm = () => {
        vibrate(60);
    };

    /**
     * Отклик для предупреждения или ошибки.
     */
    const triggerError = () => {
        vibrate(300);
    };

    return {
        triggerSelection,
        triggerConfirm,
        triggerError
    };
}