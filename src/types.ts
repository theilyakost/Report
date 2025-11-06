/**
 * Статус выполнения процедуры.
 * 1 - Выполнено
 * 2 - Пропущено
 */
export type ProcedureStatus = 1 | 2;

export interface Patient {
    id: string;
    surname: string;
    name: string;
    time: string;
    room: string;
    department: string;
    assignments: string[];
    n: number;
    dates: Record<string, ProcedureStatus>;
}

export interface UserInfo {
    surname: string;
    name: string;
    position: string;
}

export type AppTheme = 'light' | 'dark' | 'system';