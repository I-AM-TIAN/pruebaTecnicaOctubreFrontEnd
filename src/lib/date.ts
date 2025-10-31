import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export type DateRangePreset = 'today' | '7d' | '30d' | 'custom';

/**
 * Formatea una fecha para el formato ISO (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Obtiene el rango de fechas según el preset
 */
export function getDateRangeByPreset(preset: DateRangePreset): { from: Date; to: Date } {
  const today = new Date();
  
  switch (preset) {
    case 'today':
      return {
        from: startOfDay(today),
        to: endOfDay(today),
      };
    case '7d':
      return {
        from: startOfDay(subDays(today, 7)),
        to: endOfDay(today),
      };
    case '30d':
      return {
        from: startOfDay(subDays(today, 30)),
        to: endOfDay(today),
      };
    case 'custom':
    default:
      return {
        from: startOfDay(today),
        to: endOfDay(today),
      };
  }
}

/**
 * Formatea un rango de fechas para query params
 */
export function formatDateRangeForQuery(from: Date, to: Date): { from: string; to: string } {
  return {
    from: formatDateForAPI(from),
    to: formatDateForAPI(to),
  };
}

/**
 * Obtiene el rango de fechas formateado para API según preset
 */
export function getFormattedDateRange(preset: DateRangePreset): { from: string; to: string } {
  const { from, to } = getDateRangeByPreset(preset);
  return formatDateRangeForQuery(from, to);
}

/**
 * Valida si una fecha es válida
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Convierte string a Date
 */
export function parseDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    return isValidDate(date) ? date : null;
  } catch {
    return null;
  }
}

/**
 * Obtiene la fecha actual formateada para input date
 */
export function getTodayForInput(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Obtiene una fecha N días atrás formateada para input date
 */
export function getDaysAgoForInput(days: number): string {
  return format(subDays(new Date(), days), 'yyyy-MM-dd');
}
