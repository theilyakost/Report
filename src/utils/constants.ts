/**
 * Системные константы и чистые функции бизнес-логики.
 * TODO: вынести это в настройки
 */
export const DEPARTMENTS = [
    'Неврология',
    'Терапия',
    'Хирургия',
    'Гериатрия',
    'Дневной стационар',
    '10-е отделение',
    'Реабилитация'
];

export const AVAILABLE_ASSIGNMENTS = [
    'ШВЗ', // Шейно-воротниковая зона
    'Поясничный отдел',
    'Спина',
    'Правая верхняя конечность',
    'Левая верхняя конечность',
    'Правая нижняя конечность',
    'Левая нижняя конечность',
    'Правые конечности чередовать',
    'Левые конечности чередовать',
    'Нет'
];

const SPECIAL_UNITS: Record<string, number> = {
    'Спина': 2.5,
    'Нет': 0
};

const DEFAULT_UNIT_VALUE = 1.5;
export function getUnitsForAssignment(assignmentName: string): number {
    return SPECIAL_UNITS[assignmentName] ?? DEFAULT_UNIT_VALUE;
}