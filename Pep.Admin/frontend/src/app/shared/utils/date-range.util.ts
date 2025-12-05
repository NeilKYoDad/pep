export type DateRangePreset =
    'lastMonth'  
  | 'last3Months'
  | 'last6Months'
  | 'currentYear'
  | 'previousYear'
  | 'next6Months'
  | 'next12Months'
  ;

export interface DateRange {
  from: Date;
  to: Date;
}

export const dateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const dateToMonthString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Calculates ISO date range boundaries for known presets.
 */
export function getDateRange(preset: DateRangePreset, today: Date = new Date()): DateRange {
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  switch (preset) {
    case 'lastMonth': {
      const start = new Date(normalizedToday.getFullYear(), normalizedToday.getMonth() - 1, 1, 0, 0, 0, 0);
      const end = new Date(normalizedToday.getFullYear(), normalizedToday.getMonth(), 0, 23, 59, 59, 999);
      return { from: start, to: end };
    }
    case 'last3Months': {
      const end = new Date(normalizedToday.getFullYear(), normalizedToday.getMonth(), 0, 23, 59, 59, 999);
      const start = new Date(end.getFullYear(), end.getMonth() - 2, 1, 0, 0, 0, 0);
      return { from: start, to: end };
    }
    case 'last6Months': {
      const end = new Date(normalizedToday.getFullYear(), normalizedToday.getMonth(), 0, 23, 59, 59, 999);
      const start = new Date(end.getFullYear(), end.getMonth() - 5, 1, 0, 0, 0, 0);
      return { from: start, to: end };
    }
    case 'currentYear': {
      const start = new Date(normalizedToday.getFullYear(), 0, 1, 0, 0, 0, 0);
      const end = new Date(normalizedToday.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { from: start, to: end };
    }
    case 'previousYear': {
      const year = normalizedToday.getFullYear() - 1;
      const start = new Date(year, 0, 1, 0, 0, 0, 0);
      const end = new Date(year, 11, 31, 23, 59, 59, 999);
      return { from: start, to: end };
    }
    case 'next12Months': {
      const start = new Date(normalizedToday.getFullYear(), normalizedToday.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(normalizedToday.getFullYear(), normalizedToday.getMonth() + 12, 0, 23, 59, 59, 999);
      return { from: start, to: end };
    }
    case 'next6Months': {
      const start = new Date(normalizedToday.getFullYear(), normalizedToday.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(normalizedToday.getFullYear(), normalizedToday.getMonth() + 6, 0, 23, 59, 59, 999);
      return { from: start, to: end };
    }

    default:
      throw new Error(`Unsupported date range preset: ${preset}`);
  }
}
