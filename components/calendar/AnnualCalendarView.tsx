import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  CALENDAR_KIND_META,
  itemsOnDate,
  parseDateKey,
  startOfWeekMonday,
  toDateKey,
  type CalendarItem,
  type CalendarKind,
} from '../../lib/calendarItems';

type CalendarView = 'year' | 'month' | 'week';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function monthGrid(year: number, monthIndex: number): Date[] {
  const first = new Date(year, monthIndex, 1, 12, 0, 0);
  const start = startOfWeekMonday(first);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
}

function clampToYear(date: Date, year: number): Date {
  const copy = new Date(date);
  if (copy.getFullYear() < year) return new Date(year, 0, 1, 12, 0, 0);
  if (copy.getFullYear() > year) return new Date(year, 11, 31, 12, 0, 0);
  return copy;
}

function formatLongDate(key: string): string {
  return parseDateKey(key).toLocaleDateString('en-NZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface AnnualCalendarViewProps {
  items: CalendarItem[];
  isLoading?: boolean;
}

export const AnnualCalendarView: React.FC<AnnualCalendarViewProps> = ({ items, isLoading }) => {
  const year = new Date().getFullYear();
  const todayKey = toDateKey(new Date());
  const [view, setView] = useState<CalendarView>('year');
  const [focusDate, setFocusDate] = useState(() => clampToYear(new Date(), year));
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey);

  const selectedItems = useMemo(
    () => (selectedDate ? itemsOnDate(items, selectedDate) : []),
    [items, selectedDate]
  );

  const weekStart = useMemo(() => startOfWeekMonday(focusDate), [focusDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    }),
    [weekStart]
  );

  const goMonth = (delta: number) => {
    setFocusDate((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + delta, 1, 12, 0, 0);
      return clampToYear(next, year);
    });
  };

  const goWeek = (delta: number) => {
    setFocusDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + delta * 7);
      return clampToYear(next, year);
    });
  };

  const openDay = (date: Date, switchToMonth = false) => {
    if (date.getFullYear() !== year) return;
    const key = toDateKey(date);
    setSelectedDate(key);
    setFocusDate(date);
    if (switchToMonth) setView('month');
  };

  const kindsOnDay = (dateKey: string): CalendarKind[] => {
    const seen = new Set<CalendarKind>();
    itemsOnDate(items, dateKey).forEach((item) => seen.add(item.kind));
    return Array.from(seen);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          {view !== 'year' && (
            <>
              <button
                type="button"
                onClick={() => (view === 'month' ? goMonth(-1) : goWeek(-1))}
                className="p-2 rounded-[4px] border border-gray-200 hover:bg-gray-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={view === 'month' ? 'Previous month' : 'Previous week'}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => (view === 'month' ? goMonth(1) : goWeek(1))}
                className="p-2 rounded-[4px] border border-gray-200 hover:bg-gray-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={view === 'month' ? 'Next month' : 'Next week'}
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
          <h2 className="text-xl md:text-2xl font-serif text-charcoal">
            {view === 'year' && year}
            {view === 'month' && `${MONTH_NAMES[focusDate.getMonth()]} ${year}`}
            {view === 'week' && `Week of ${weekStart.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}`}
          </h2>
        </div>
        <div className="inline-flex rounded-[4px] border border-gray-200 overflow-hidden self-start">
          {(['year', 'month', 'week'] as CalendarView[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider min-h-[44px] ${
                view === option ? 'bg-charcoal text-white' : 'bg-white text-neutral hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {(Object.keys(CALENDAR_KIND_META) as CalendarKind[]).map((kind) => (
          <span key={kind} className="inline-flex items-center gap-1.5 text-neutral">
            <span className={`w-2 h-2 rounded-full ${CALENDAR_KIND_META[kind].dotClass}`} />
            {CALENDAR_KIND_META[kind].label}
          </span>
        ))}
      </div>

      {isLoading && (
        <p className="text-neutral text-sm">Updating calendar…</p>
      )}

      {view === 'year' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {MONTH_NAMES.map((name, monthIndex) => (
                <div key={name} className="bg-white border border-gray-200 rounded-[8px] p-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFocusDate(new Date(year, monthIndex, 1, 12, 0, 0));
                      setView('month');
                    }}
                    className="text-sm font-bold text-charcoal mb-2 hover:text-gold"
                  >
                    {name}
                  </button>
                  <div className="grid grid-cols-7 gap-px text-[10px] text-neutral mb-1">
                    {WEEKDAYS.map((d) => (
                      <span key={d} className="text-center font-semibold">
                        {d.charAt(0)}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-px">
                    {monthGrid(year, monthIndex).map((date) => {
                      const key = toDateKey(date);
                      const inMonth = date.getMonth() === monthIndex;
                      const kinds = inMonth ? kindsOnDay(key) : [];
                      const isToday = key === todayKey;
                      const isSelected = key === selectedDate;
                      return (
                        <button
                          key={key + monthIndex}
                          type="button"
                          disabled={!inMonth}
                          onClick={() => openDay(date)}
                          className={`relative h-8 text-[11px] rounded-full ${
                            !inMonth
                              ? 'text-gray-200'
                              : isSelected
                                ? 'bg-charcoal text-white'
                                : isToday
                                  ? 'bg-gold/30 text-charcoal font-bold'
                                  : 'text-charcoal hover:bg-gray-100'
                          }`}
                        >
                          {date.getDate()}
                          {kinds.length > 0 && (
                            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                              {kinds.slice(0, 4).map((kind) => (
                                <span key={kind} className={`w-1 h-1 rounded-full ${CALENDAR_KIND_META[kind].dotClass}`} />
                              ))}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'month' && (
            <div className="bg-white border border-gray-200 rounded-[8px] overflow-hidden">
              <div className="grid grid-cols-7 border-b border-gray-100">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="px-1 py-2 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthGrid(year, focusDate.getMonth()).map((date) => {
                  const key = toDateKey(date);
                  const inMonth = date.getMonth() === focusDate.getMonth();
                  const dayItems = inMonth ? itemsOnDate(items, key) : [];
                  const isToday = key === todayKey;
                  const isSelected = key === selectedDate;
                  return (
                    <div
                      key={key}
                      onClick={() => inMonth && openDay(date)}
                      className={`min-h-[5.5rem] sm:min-h-[7rem] p-1 sm:p-1.5 text-left border-t border-r border-gray-100 align-top ${
                        inMonth ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50/60'
                      } ${isSelected ? 'ring-1 ring-inset ring-gold' : ''}`}
                    >
                      <button
                        type="button"
                        disabled={!inMonth}
                        onClick={() => inMonth && openDay(date)}
                        className={`inline-flex w-6 h-6 items-center justify-center text-xs rounded-full ${
                          isToday ? 'bg-gold text-charcoal font-bold' : inMonth ? 'text-charcoal hover:bg-gray-100' : 'text-gray-300'
                        }`}
                        aria-label={inMonth ? `Select ${date.getDate()} ${MONTH_NAMES[focusDate.getMonth()]}` : undefined}
                      >
                        {date.getDate()}
                      </button>
                      <div className="mt-1 space-y-0.5 hidden sm:block">
                        {dayItems.slice(0, 3).map((item) => (
                          <Link
                            key={`${item.kind}-${item.id}`}
                            to={item.href}
                            onClick={(e) => e.stopPropagation()}
                            className={`block truncate text-[10px] px-1 py-0.5 rounded border ${CALENDAR_KIND_META[item.kind].chipClass} hover:shadow-sm`}
                          >
                            {item.title}
                          </Link>
                        ))}
                        {dayItems.length > 3 && (
                          <button
                            type="button"
                            onClick={() => openDay(date)}
                            className="block text-[10px] text-neutral hover:text-charcoal"
                          >
                            +{dayItems.length - 3} more
                          </button>
                        )}
                      </div>
                      <div className="mt-1 flex gap-0.5 sm:hidden">
                        {kindsOnDay(key).slice(0, 4).map((kind) => (
                          <span key={kind} className={`w-1.5 h-1.5 rounded-full ${CALENDAR_KIND_META[kind].dotClass}`} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === 'week' && (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              {weekDays.map((date) => {
                const key = toDateKey(date);
                const inYear = date.getFullYear() === year;
                const dayItems = inYear ? itemsOnDate(items, key) : [];
                const isToday = key === todayKey;
                return (
                  <div
                    key={key}
                    className={`bg-white border rounded-[8px] p-3 min-h-[12rem] ${
                      isToday ? 'border-gold' : 'border-gray-200'
                    } ${!inYear ? 'opacity-40' : ''}`}
                  >
                    <button
                      type="button"
                      disabled={!inYear}
                      onClick={() => openDay(date)}
                      className="w-full text-left mb-3"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral">
                        {date.toLocaleDateString('en-NZ', { weekday: 'short' })}
                      </p>
                      <p className={`text-lg font-serif ${isToday ? 'text-gold' : 'text-charcoal'}`}>
                        {date.getDate()}
                      </p>
                    </button>
                    <div className="space-y-1.5">
                      {dayItems.map((item) => (
                        <Link
                          key={`${item.kind}-${item.id}`}
                          to={item.href}
                          className={`block text-xs px-2 py-1.5 rounded border ${CALENDAR_KIND_META[item.kind].chipClass} hover:shadow-sm`}
                        >
                          {item.title}
                        </Link>
                      ))}
                      {dayItems.length === 0 && inYear && (
                        <p className="text-xs text-neutral">No items</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

      {selectedDate && (
        <div className="bg-white border border-gray-200 rounded-[8px] p-4 sm:p-5">
          <h3 className="font-serif text-lg text-charcoal mb-1">{formatLongDate(selectedDate)}</h3>
          <p className="text-xs text-neutral mb-4">Tap an item to open it.</p>
          {selectedItems.length === 0 ? (
            <p className="text-sm text-neutral">Nothing scheduled on this day.</p>
          ) : (
            <ul className="space-y-2">
              {selectedItems.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <Link
                    to={item.href}
                    className={`flex items-start justify-between gap-3 px-3 py-3 rounded-[6px] border ${CALENDAR_KIND_META[item.kind].chipClass} hover:shadow-sm`}
                  >
                    <span>
                      <span className="block text-[10px] font-bold uppercase tracking-wider">
                        {CALENDAR_KIND_META[item.kind].label}
                      </span>
                      <span className="block text-sm font-semibold text-charcoal">{item.title}</span>
                      {item.subtitle && <span className="block text-xs text-neutral mt-0.5">{item.subtitle}</span>}
                    </span>
                    <span className="text-xs font-bold shrink-0 mt-1">View</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
