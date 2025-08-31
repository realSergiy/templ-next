import { clsx, type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const quarterToString = (quarter: number) => {
  const year = Math.floor(quarter / 10);
  const q = quarter % 10;
  return `Q${q} ${year}`;
};

export const getQuarterRange = () => {
  const currentYear = new Date().getFullYear();
  const quarters = [];

  for (let year = currentYear; year <= currentYear + 1; year++) {
    for (let q = 1; q <= 4; q++) {
      quarters.push(year * 10 + q);
    }
  }

  return quarters;
};

export const getQuarterPosition = (
  quarter: number,
  startQuarter: number,
  totalQuarters: number,
) => {
  const index = quarter - startQuarter;
  return (index / totalQuarters) * 100;
};

export const getQuarterWidth = (
  startQuarter: number,
  endQuarter: number,
  totalQuarters: number,
) => {
  const duration = endQuarter - startQuarter + 1;
  return (duration / totalQuarters) * 100;
};
