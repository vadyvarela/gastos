import { useMemo } from 'react';
import { formatDate, formatMonth } from '@/utils/date';

export function useFormattedDate(dateString: string): string {
  return useMemo(() => formatDate(dateString), [dateString]);
}

export function useFormattedMonth(monthString: string): string {
  return useMemo(() => formatMonth(monthString), [monthString]);
}
