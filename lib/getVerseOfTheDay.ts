import { DailyVerse, VERSES_OF_THE_DAY } from './versesOfTheDay';

const CHURCH_TIMEZONE = 'Pacific/Auckland';
const EPOCH_YEAR = 2026;
const EPOCH_MONTH = 0;
const EPOCH_DAY = 1;
const MS_PER_DAY = 86_400_000;

function churchLocalDayIndex(date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: CHURCH_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);

  const churchDateUtc = Date.UTC(year, month - 1, day);
  const epochUtc = Date.UTC(EPOCH_YEAR, EPOCH_MONTH, EPOCH_DAY);

  return Math.floor((churchDateUtc - epochUtc) / MS_PER_DAY);
}

export function getVerseOfTheDay(date = new Date()): DailyVerse {
  const dayIndex = churchLocalDayIndex(date);
  const length = VERSES_OF_THE_DAY.length;
  const idx = ((dayIndex % length) + length) % length;
  return VERSES_OF_THE_DAY[idx];
}
