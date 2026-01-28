import { useMemo } from 'react';
import { formatCurrency } from '@/utils/currency';

export function useFormattedCurrency(value: number): string {
  return useMemo(() => formatCurrency(value), [value]);
}
