import React, { useState } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

/**
 * CalendarRangePicker — a brutalist-styled month calendar that lets the user
 * click to set a start date and end date range.
 *
 * @param {{ start: Date|string|null, end: Date|string|null }} value
 * @param {(range: { start: Date|null, end: Date|null }) => void} onChange
 */
const CalendarRangePicker = ({ value, onChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const parseDate = (d) => {
    if (!d) return null;
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const startDate = parseDate(value.start);
  const endDate = parseDate(value.end);

  const handleDateClick = (dayNum) => {
    const clicked = new Date(year, month, dayNum);
    clicked.setHours(0, 0, 0, 0);

    if (!startDate || (startDate && endDate)) {
      onChange({ start: clicked, end: null });
    } else {
      if (clicked < startDate) {
        onChange({ start: clicked, end: null });
      } else {
        onChange({ start: startDate, end: clicked });
      }
    }
  };

  const isSelected = (dayNum) => {
    const d = new Date(year, month, dayNum);
    d.setHours(0, 0, 0, 0);
    return (
      (startDate && d.getTime() === startDate.getTime()) ||
      (endDate && d.getTime() === endDate.getTime())
    );
  };

  const isInRange = (dayNum) => {
    const d = new Date(year, month, dayNum);
    d.setHours(0, 0, 0, 0);
    return startDate && endDate && d > startDate && d < endDate;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  // Empty offset cells
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="p-2 border border-transparent" />);
  }
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const selected = isSelected(d);
    const inRange = isInRange(d);
    days.push(
      <button
        key={`day-${d}`}
        type="button"
        onClick={() => handleDateClick(d)}
        className={`p-2 font-mono text-xs border border-[#212121]/10 hover:border-[#212121] transition-all cursor-pointer font-bold select-none
          ${selected ? 'bg-[#C84B31] text-[#F1EDEA] border-[#212121] shadow-[1px_1px_0px_#212121]' : ''}
          ${inRange ? 'bg-[#C84B31]/20 text-[#212121]' : ''}
          ${!selected && !inRange ? 'bg-white text-[#212121]' : ''}
        `}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="border-2 border-[#212121] p-4 bg-[#F1EDEA] shadow-[3px_3px_0px_#212121]">
      {/* Month navigation header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="border-2 border-[#212121] bg-white px-2 py-1 text-xs font-mono font-bold uppercase shadow-[2px_2px_0px_#212121] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#212121] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_#212121]"
        >
          &lt;
        </button>
        <span className="font-mono text-xs font-bold uppercase tracking-wider">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="border-2 border-[#212121] bg-white px-2 py-1 text-xs font-mono font-bold uppercase shadow-[2px_2px_0px_#212121] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#212121] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_#212121]"
        >
          &gt;
        </button>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] font-bold text-[#212121]/50 uppercase mb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Day cells grid */}
      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  );
};

export default CalendarRangePicker;
