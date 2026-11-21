'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Flame, Shield, Snowflake } from 'lucide-react';
import { UserProfile } from '@/types/user';
import {
  toLocalDateKey,
  getResolvedActiveDates,
  getEffectiveJoinDateKey,
  getDuolingoStreakLevel,
  DayCellStatus
} from '@/lib/streakEngine';
import { playClickSound } from '@/lib/audioEngine';

interface DuolingoStreakCalendarProps {
  profile: UserProfile | null;
  className?: string;
}

const HINDI_MONTHS = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Days of week starting from Sunday (र, सो, मं, बु, गु, शु, श)
const DAY_HEADERS_HI = ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'];
const DAY_HEADERS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface CalendarGridDay {
  dayNum: number;
  dateKey: string;
  isToday: boolean;
  status: DayCellStatus;
  isCurrentMonth: boolean;
  colIndex: number; // 0..6 (Sun..Sat)
}

export const DuolingoStreakCalendar: React.FC<DuolingoStreakCalendarProps> = ({
  profile,
  className = ''
}) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));

  const streakDays = profile?.streak ?? 1;
  const streakLevel = getDuolingoStreakLevel(streakDays);
  const freezesAvailable = profile?.streakFreezes ?? 1;
  const isHindi = profile?.languagePreference !== 'en';

  const monthName = isHindi
    ? HINDI_MONTHS[viewDate.getMonth()]
    : ENGLISH_MONTHS[viewDate.getMonth()];
  const yearNum = viewDate.getFullYear();

  const handlePrevMonth = () => {
    playClickSound();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    playClickSound();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Build the 7-column calendar matrix for viewDate
  const { weeks, activeDaysCount } = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun .. 6=Sat

    const todayKey = toLocalDateKey(today);
    const joinKey = getEffectiveJoinDateKey(profile, today);
    const activeDates = getResolvedActiveDates(profile, today);
    const totalFreezes = profile?.streakFreezes ?? 1;

    // 1. Generate all day items for the month
    const daysList: {
      dayNum: number;
      dateKey: string;
      isToday: boolean;
      status: DayCellStatus;
      colIndex: number;
    }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateKey = toLocalDateKey(dateObj);
      const isToday = dateKey === todayKey;
      const colIndex = dateObj.getDay();

      let status: DayCellStatus = 'upcoming';
      if (dateKey < joinKey) {
        status = 'pre_join';
      } else if (dateKey > todayKey) {
        status = 'upcoming';
      } else if (activeDates.has(dateKey) || isToday) {
        status = 'active';
      } else {
        status = 'missed';
      }

      daysList.push({ dayNum: d, dateKey, isToday, status, colIndex });
    }

    // 2. Apply freeze budget backwards from today for any missed days
    let freezeBudget = totalFreezes;
    for (let i = daysList.length - 1; i >= 0; i--) {
      if (daysList[i].status === 'missed' && freezeBudget > 0) {
        daysList[i].status = 'frozen';
        freezeBudget -= 1;
      }
    }

    // 3. Group into 7-column week rows (with empty pad before day 1)
    const weekRows: (CalendarGridDay | null)[][] = [];
    let currentRow: (CalendarGridDay | null)[] = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentRow.push(null);
    }

    daysList.forEach((day) => {
      currentRow.push({ ...day, isCurrentMonth: true });
      if (currentRow.length === 7) {
        weekRows.push(currentRow);
        currentRow = [];
      }
    });

    if (currentRow.length > 0) {
      while (currentRow.length < 7) {
        currentRow.push(null);
      }
      weekRows.push(currentRow);
    }

    const activeCount = daysList.filter((d) => d.status === 'active').length;
    return { weeks: weekRows, activeDaysCount: activeCount };
  }, [viewDate, profile, today]);

  const dayHeaders = isHindi ? DAY_HEADERS_HI : DAY_HEADERS_EN;

  return (
    <div className={`w-full rounded-[28px] bg-[#121826] border-2 border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.6)] p-4 sm:p-5 text-white ${className}`}>
      {/* ── TOP TITLE: स्ट्रिक कैलेंडर / Streak Calendar ── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
          <span>{isHindi ? 'स्ट्रिक कैलेंडर' : 'Streak Calendar'}</span>
        </h3>
        <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 fill-amber-400" />
          <span>{streakDays} {isHindi ? 'दिन' : 'Days'}</span>
        </span>
      </div>

      {/* ── WHITE/NEUTRAL INNER CARD (DUOLINGO AESTHETIC WITH DARK MODE POLISH) ── */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 sm:p-4 backdrop-blur-md">
        {/* Month Selector Bar: < अक्टूबर 2026 > */}
        <div className="flex items-center justify-between mb-4 px-2">
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-90"
            title="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm sm:text-base font-black tracking-wide text-white">
            {monthName} {yearNum}
          </span>

          <button
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-90"
            title="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 7 Days of Week Header Row: र सो मं बु गु शु श */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2.5">
          {dayHeaders.map((dh, i) => (
            <span
              key={i}
              className={`text-[11px] sm:text-xs font-black ${
                i === 0 ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {dh}
            </span>
          ))}
        </div>

        {/* Calendar Weeks Grid */}
        <div className="space-y-1.5">
          {weeks.map((week, wIdx) => {
            return (
              <div key={wIdx} className="grid grid-cols-7 gap-1">
                {week.map((cell, cIdx) => {
                  if (!cell) {
                    return <div key={`empty-${cIdx}`} className="aspect-square" />;
                  }

                  // Determine consecutive grouping for continuous fiery or ice frost bar
                  const prevActive = cIdx > 0 && week[cIdx - 1]?.status === 'active';
                  const nextActive = cIdx < 6 && week[cIdx + 1]?.status === 'active';
                  const isCellActive = cell.status === 'active';

                  const prevFrozen = cIdx > 0 && week[cIdx - 1]?.status === 'frozen';
                  const nextFrozen = cIdx < 6 && week[cIdx + 1]?.status === 'frozen';
                  const isCellFrozen = cell.status === 'frozen';

                  let pillRadiusClass = 'rounded-full';
                  let containerBg = '';

                  if (isCellActive) {
                    if (prevActive && nextActive) {
                      pillRadiusClass = 'rounded-none';
                    } else if (prevActive && !nextActive) {
                      pillRadiusClass = 'rounded-r-full rounded-l-none';
                    } else if (!prevActive && nextActive) {
                      pillRadiusClass = 'rounded-l-full rounded-r-none';
                    } else {
                      pillRadiusClass = 'rounded-full';
                    }
                    containerBg =
                      'bg-gradient-to-r from-[#FF7B00] via-[#FF3366] to-[#E91E63] text-white shadow-[0_2px_12px_rgba(255,87,34,0.6)]';
                  } else if (isCellFrozen) {
                    if (prevFrozen && nextFrozen) {
                      pillRadiusClass = 'rounded-none';
                    } else if (prevFrozen && !nextFrozen) {
                      pillRadiusClass = 'rounded-r-full rounded-l-none';
                    } else if (!prevFrozen && nextFrozen) {
                      pillRadiusClass = 'rounded-l-full rounded-r-none';
                    } else {
                      pillRadiusClass = 'rounded-full';
                    }
                    containerBg =
                      'bg-gradient-to-r from-[#38BDF8] via-[#0284C7] to-[#0369A1] text-white shadow-[0_2px_14px_rgba(56,189,248,0.7)] border border-cyan-300/40';
                  }

                  return (
                    <div
                      key={cell.dateKey}
                      className="relative aspect-square flex items-center justify-center"
                    >
                      {/* 1. Active Continuous Fiery Pill with Authentic Flame Logo */}
                      {isCellActive && (
                        <div
                          className={`w-full h-8 sm:h-9 flex items-center justify-center gap-1 font-black text-xs sm:text-sm ${pillRadiusClass} ${containerBg} z-10 transition-transform active:scale-95`}
                          title={`${cell.dateKey}: Active Streak 🔥`}
                        >
                          <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-200 shrink-0 drop-shadow-[0_0_4px_#FFA000]" />
                          <span>{cell.dayNum}</span>
                        </div>
                      )}

                      {/* 2. Freeze Continuous Ice Pill or Droplet Badge with Authentic Freezing Logo */}
                      {isCellFrozen && (
                        <div
                          className={`w-full h-8 sm:h-9 relative flex items-center justify-center gap-1 font-black text-xs sm:text-sm ${pillRadiusClass} ${containerBg} z-10 transition-transform active:scale-95`}
                          title={`${cell.dateKey}: Streak Freeze ❄️`}
                        >
                          <Snowflake className="w-3 h-3 text-cyan-100 shrink-0 animate-spin-slow drop-shadow-[0_0_4px_#38BDF8]" />
                          <span>{cell.dayNum}</span>
                        </div>
                      )}

                      {/* 3. Pre-Join Day (Before account creation) */}
                      {cell.status === 'pre_join' && (
                        <div
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-slate-600 text-xs font-semibold opacity-40 line-through"
                          title={`${cell.dateKey}: Before join`}
                        >
                          <span>{cell.dayNum}</span>
                        </div>
                      )}

                      {/* 4. Missed Day without freeze */}
                      {cell.status === 'missed' && (
                        <div
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-pink-400/80 text-xs font-bold"
                          title={`${cell.dateKey}: Missed`}
                        >
                          <span>{cell.dayNum}</span>
                        </div>
                      )}

                      {/* 5. Upcoming Day (Future) */}
                      {cell.status === 'upcoming' && (
                        <div
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-slate-500 text-xs font-semibold"
                          title={`${cell.dateKey}: Upcoming`}
                        >
                          <span>{cell.dayNum}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM SECTION: स्ट्रिक लक्ष्य / STREAK GOAL (MATCHES DUOLINGO SCREENSHOT) ── */}
      <div className="mt-4 pt-3.5 border-t border-white/10">
        <h4 className="text-xs sm:text-sm font-black text-white mb-2 flex items-center gap-1.5 px-1">
          <span>{isHindi ? 'स्ट्रिक लक्ष्य' : 'Streak Goal'}</span>
        </h4>

        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-pink-500/10 to-transparent border border-orange-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-black flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] shrink-0">
              <Flame className="w-7 h-7 fill-black" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-white">
                {streakDays} / {streakLevel.nextMilestone} {isHindi ? 'दिन का लक्ष्य' : 'Day Milestone'}
              </div>
              <p className="text-[10px] text-slate-300 font-semibold mt-0.5">
                {isHindi
                  ? `${streakLevel.title} स्तर ${streakLevel.level}`
                  : `${streakLevel.title} (Level ${streakLevel.level})`}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-black">
              <Snowflake className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{freezesAvailable} {isHindi ? 'फ्रीज़' : 'Freeze'}</span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-1">
              {activeDaysCount} {isHindi ? 'दिन सक्रिय' : 'Days Active'}
            </span>
          </div>
        </div>

        {/* Progress Bar towards Milestone */}
        <div className="mt-2.5 h-2 w-full rounded-full bg-white/10 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FF7B00] via-[#FF3366] to-[#E91E63] transition-all duration-500 shadow-[0_0_8px_rgba(255,87,34,0.6)]"
            style={{ width: `${Math.max(8, streakLevel.progressPercent)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
