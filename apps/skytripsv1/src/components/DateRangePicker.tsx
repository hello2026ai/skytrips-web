'use client';

import * as React from 'react';
import { format, addDays } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from './ui/button';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { createPortal } from 'react-dom';

interface DateRangePickerProps {
  className?: string;
  initialDateRange?: {
    from: Date | null;
    to: Date | null;
  };
  onChange: (dateRange: { from: Date | null; to: Date | null }) => void;
  defaultToRoundTrip?: boolean;
  tripType?: 'round' | 'one-way';
  onTripTypeChange?: (type: 'round' | 'one-way') => void;
}

export function DateRangePicker({
  className,
  initialDateRange,
  onChange,
  defaultToRoundTrip = true,
  tripType: controlledTripType,
  onTripTypeChange,
}: DateRangePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of the day to ensure today is included

  // Create a date representing yesterday (to exclude past dates properly)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [startDate, setStartDate] = React.useState<Date | null>(
    initialDateRange?.from || null
  );

  const [endDate, setEndDate] = React.useState<Date | null>(
    initialDateRange?.to || null
  );

  // Sync state with props when initialDateRange changes
  React.useEffect(() => {
    if (initialDateRange) {
      if (initialDateRange.from !== undefined) {
        setStartDate(initialDateRange.from);
      }
      if (initialDateRange.to !== undefined) {
        setEndDate(initialDateRange.to);
      }
    }
  }, [initialDateRange]);

  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [isActivelySelecting, setIsActivelySelecting] = React.useState(false);
  
  const [internalTripType, setInternalTripType] = React.useState<'round' | 'one-way'>(
    initialDateRange?.to ? 'round' : defaultToRoundTrip ? 'round' : 'one-way'
  );

  const tripType = controlledTripType !== undefined ? controlledTripType : internalTripType;
  const setTripType = React.useCallback((type: 'round' | 'one-way') => {
    if (onTripTypeChange) {
      onTripTypeChange(type);
    } else {
      setInternalTripType(type);
    }
  }, [onTripTypeChange]);
  const [dropdownWidth, setDropdownWidth] = React.useState(0);
  const [dropdownPosition, setDropdownPosition] = React.useState({
    top: 0,
    left: 0,
  });

  // Refs for positioning
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const singleCalendarRef = React.useRef<HTMLDivElement>(null);
  const doubleCalendarRef = React.useRef<HTMLDivElement>(null);

  // Track mounted state for SSR
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Calculate proper positioning for the dropdown
  const updatePosition = React.useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const isMobile = windowWidth < 640;

    // Fixed widths for both modes to prevent layout shifts
    const oneWayWidth = 320;
    const roundTripWidth = isMobile ? 320 : 620;

    // Calculate the dropdown width based on current mode
    const modalWidth = tripType === 'round' ? roundTripWidth : oneWayWidth;

    // Calculate dropdown position based on container
    let left = rect.left + window.scrollX;
    const right = left + modalWidth;

    // Adjust if it goes off screen
    if (right > windowWidth) {
      left = Math.max(10, windowWidth - modalWidth - 10);
    }

    // Update position state
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 5,
      left,
    });

    // Update width state
    setDropdownWidth(Math.min(modalWidth, windowWidth - 20));
  }, [tripType]);

  // Update position when dropdown is shown or trip type changes
  React.useEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, tripType, updatePosition]);

  // Track previous trip type to detect changes
  const prevTripTypeRef = React.useRef(tripType);

  // Auto-open calendar when switching to round trip from one-way
  React.useEffect(() => {
    if (prevTripTypeRef.current === 'one-way' && tripType === 'round' && !open) {
      setOpen(true);
      setIsActivelySelecting(false);
      setTimeout(updatePosition, 0);
    }
    prevTripTypeRef.current = tripType;
  }, [tripType, open, updatePosition]);

  // Handle window events
  React.useEffect(() => {
    if (!open) return;

    const handleResize = () => {
      requestAnimationFrame(updatePosition);
    };

    const handleScroll = () => {
      requestAnimationFrame(updatePosition);
    };

    // Handle click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeCalendar();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, updatePosition]);

  // Handle range change (for round trip)
  const handleRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setIsActivelySelecting(true);

    // Only on mobile: If selecting the second date and we're in a new month,
    // don't auto-select the same day number, but allow manual selection
    if (window.innerWidth < 640 && start && !end && !dates[1]) {
      // Keep endDate null to avoid auto-selecting in next month
      setEndDate(null);
    } else {
      // When user manually selects the second date, use it
      setEndDate(end);
    }

    if (start) {
      onChange({ from: start, to: end });
    }
  };

  // Handle single date change (for one-way)
  const handleSingleDateChange = (date: Date | null) => {
    setStartDate(date);
    setEndDate(null);
    setIsActivelySelecting(true);
    onChange({ from: date, to: null });
  };

  // Handle trip type change
  const handleTripTypeChange = (type: 'round' | 'one-way') => {
    if (type === tripType) return;

    setTripType(type);

    if (type === 'one-way') {
      // Switch to one-way: remove end date
      setEndDate(null);
      onChange({ from: startDate, to: null });
    } else {
      // Switch to round trip: keep only start date, don't auto-select end date
      // Let user select the end date manually
      setEndDate(null);
      onChange({ from: startDate, to: null });
    }
  };

  // Open the calendar
  const openCalendar = () => {
    setOpen(true);
    setIsActivelySelecting(false); // Reset when reopening calendar
    setTimeout(updatePosition, 0);
  };

  // Close the calendar
  const closeCalendar = () => {
    setOpen(false);
  };

  // Clear all selected dates
  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
    setIsActivelySelecting(false);
    onChange({ from: null, to: null });
  };

  return (
    <div className={cn('relative ', className)}>
      {/* Date display field */}
      <div
        className="w-full cursor-pointer "
        ref={containerRef}
        onClick={openCalendar}
      >
        <div className="border border-gray-300 rounded-md overflow-hidden min-h-[4.8125rem] flex">
          <div className={cn(
            'grid w-full',
            tripType === 'round' ? 'grid-cols-2' : 'grid-cols-1'
          )}>
            {/* Departure date field */}
            <div
              className={cn(
                'px-2 md:px-4 py-2 flex flex-col justify-center',
                tripType === 'round' && 'border-r border-gray-300 h-full'
              )}
            >
              <div className="label-l1 text-neutral-dark">Departure Date</div>
              <div
                className={cn(
                  'flex items-center',
                  startDate
                    ? 'title-t4 text-background-on'
                    : 'label-l1 text-neutral-dark'
                )}
              >
                {startDate ? (
                  <div className="truncate whitespace-nowrap overflow-hidden">
                    {format(startDate, 'EEE, d MMM yyyy')}
                  </div>
                ) : (
                  <>
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary flex-shrink-0" />
                    <span className="truncate">Select Date</span>
                  </>
                )}
              </div>
            </div>

            {/* Return date field - Only shown for round trips */}
            {tripType === 'round' && (
              <div
                className={cn(
                  'px-2 md:px-4 py-2 flex flex-col justify-center'
                )}
              >
                <div className="label-l1 text-neutral-dark">Return Date</div>
                <div
                  className={cn(
                    'flex items-center',
                    endDate
                      ? 'title-t4 text-background-on'
                      : 'label-l1 text-neutral-dark'
                  )}
                >
                  {endDate ? (
                    <div className="truncate whitespace-nowrap overflow-hidden">
                      {format(endDate, 'EEE, d MMM yyyy')}
                    </div>
                  ) : (
                    <>
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary flex-shrink-0" />
                      <span className="truncate">Select Date</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar dropdown */}
      {open &&
        mounted &&
        (createPortal(
          <div
            ref={dropdownRef}
            className="datepicker-dropdown bg-white border border-gray-200 rounded-md shadow-lg p-0 overflow-hidden"
            style={{
              position: 'absolute',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownWidth}px`,
              maxWidth: '100vw',
              zIndex: 9999,
              transition: 'width 0.2s ease-out',
            }}
          >
            {/* Trip type selector - Only show if not controlled externally */}
            {controlledTripType === undefined && (
              <div className="p-3 border-b">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tripType"
                      checked={tripType === 'round'}
                      onChange={() => handleTripTypeChange('round')}
                      className="w-4 h-4 accent-[#5143d9]"
                    />
                    <span className="label-l1 text-background-on">
                      Round Trip
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tripType"
                      checked={tripType === 'one-way'}
                      onChange={() => handleTripTypeChange('one-way')}
                      className="w-4 h-4 accent-[#5143d9]"
                    />
                    <span className="label-l1 text-background-on">One Way</span>
                  </label>
                </div>
              </div>
            )}

            {/* Calendar container */}
            <div className="relative">
              {/* Round Trip Calendar */}
              <div
                ref={doubleCalendarRef}
                className={cn(
                  'transition-opacity duration-200',
                  tripType === 'round'
                    ? 'opacity-100 visible'
                    : 'opacity-0 invisible absolute top-0 left-0'
                )}
              >
                <div className="p-3">
                  <DatePicker
                    selected={startDate}
                    onChange={handleRangeChange}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    inline
                    monthsShown={window.innerWidth < 640 ? 1 : 2}
                    minDate={today}
                    filterDate={(date) => {
                      // Disable dates before today
                      if (date < today) return false;

                      // If start date is selected and we're actively selecting (not just reopening),
                      // disable dates before the start date when selecting end date
                      if (isActivelySelecting && startDate && !endDate) {
                        return date >= startDate;
                      }

                      return true;
                    }}
                    calendarClassName="custom-calendar round-trip-calendar"
                    highlightDates={window.innerWidth < 640 ? [] : undefined}
                    dayClassName={(date) => {
                      // Check for dates before today (not including today) - mark as disabled
                      const isPastDate = date < today;

                      if (isPastDate) {
                        return 'past-date no-highlight disabled-date';
                      }

                      // If start date is selected and actively selecting, mark dates before start as disabled
                      if (
                        isActivelySelecting &&
                        startDate &&
                        !endDate &&
                        date < startDate
                      ) {
                        return 'past-date no-highlight disabled-date';
                      }

                      // Check for exact match with start date
                      if (
                        startDate &&
                        date.getDate() === startDate.getDate() &&
                        date.getMonth() === startDate.getMonth() &&
                        date.getFullYear() === startDate.getFullYear()
                      ) {
                        return 'custom-day-selected start-date always-highlight';
                      }

                      // Check for exact match with end date
                      if (
                        endDate &&
                        date.getDate() === endDate.getDate() &&
                        date.getMonth() === endDate.getMonth() &&
                        date.getFullYear() === endDate.getFullYear()
                      ) {
                        return 'custom-day-selected end-date';
                      }

                      // Check if date is inside the range - this takes precedence over other checks
                      if (
                        startDate &&
                        endDate &&
                        date > startDate &&
                        date < endDate
                      ) {
                        return 'react-datepicker__day--in-range';
                      }

                      // Then check if the date is outside the range for all other dates
                      if (startDate && endDate) {
                        const isOutsideRange =
                          date < startDate || date > endDate;

                        // If outside range, apply no-highlight
                        if (isOutsideRange) {
                          // If actively selecting and date is before start, mark as disabled
                          if (isActivelySelecting && date < startDate) {
                            return 'past-date no-highlight disabled-date';
                          }
                          return 'no-highlight';
                        }
                      }

                      // Prevent same day number from being highlighted in future months
                      // ONLY if it's not in a selected range
                      const currentDate = new Date();
                      if (
                        date.getDate() === currentDate.getDate() &&
                        (date.getMonth() > currentDate.getMonth() ||
                          date.getFullYear() > currentDate.getFullYear())
                      ) {
                        return 'no-highlight';
                      }

                      // For mobile devices, prevent highlighting same day number in different months
                      if (window.innerWidth < 640 && startDate && !endDate) {
                        if (
                          date.getDate() === startDate.getDate() &&
                          (date.getMonth() !== startDate.getMonth() ||
                            date.getFullYear() !== startDate.getFullYear())
                        ) {
                          return 'no-highlight';
                        }
                      }

                      // Single date selection case
                      if (!endDate && startDate) {
                        // Apply no-highlight to any date with same day number but different month/year
                        if (
                          date.getDate() === startDate.getDate() &&
                          (date.getMonth() !== startDate.getMonth() ||
                            date.getFullYear() !== startDate.getFullYear())
                        ) {
                          return 'no-highlight';
                        }
                      }

                      return '';
                    }}
                    renderCustomHeader={({
                      monthDate,
                      customHeaderCount,
                      decreaseMonth,
                      increaseMonth,
                    }) => (
                      <div className="flex items-center justify-between px-2 ">
                        {customHeaderCount === 0 && (
                          <button
                            aria-label="Previous Month"
                            className="p-2 rounded-full hover:bg-blue-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            onClick={decreaseMonth}
                            type="button"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                        )}
                        {customHeaderCount === 1 &&
                          window.innerWidth >= 640 && (
                            <div className="w-5"></div>
                          )}
                        <h2 className="title-t4 text-background-on">
                          {format(monthDate, 'MMMM yyyy')}
                        </h2>
                        {customHeaderCount === 0 &&
                          window.innerWidth >= 640 && (
                            <div className="w-5"></div>
                          )}
                        {(customHeaderCount === 1 ||
                          window.innerWidth < 640) && (
                          <button
                            aria-label="Next Month"
                            className="p-2 rounded-full hover:bg-blue-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            onClick={increaseMonth}
                            type="button"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* One Way Calendar */}
              <div
                ref={singleCalendarRef}
                className={cn(
                  'transition-opacity duration-200',
                  tripType === 'one-way'
                    ? 'opacity-100 visible'
                    : 'opacity-0 invisible absolute top-0 left-0'
                )}
              >
                <div className="p-3">
                  <DatePicker
                    selected={startDate}
                    onChange={handleSingleDateChange}
                    inline
                    monthsShown={1}
                    minDate={today}
                    filterDate={(date) => {
                      // Disable dates before today
                      if (date < today) return false;

                      // If start date is selected and we're actively selecting,
                      // disable dates before the start date
                      if (isActivelySelecting && startDate) {
                        return date >= startDate;
                      }

                      return true;
                    }}
                    showMonthDropdown={false}
                    showYearDropdown={false}
                    calendarClassName="custom-calendar single-month-calendar oneway-calendar"
                    highlightDates={[]}
                    dayClassName={(date) => {
                      // Check for dates before today (not including today) - mark as disabled
                      const isPastDate = date < today;

                      if (isPastDate) {
                        return 'past-date no-highlight disabled-date';
                      }

                      // If start date is selected and actively selecting, mark dates before start as disabled
                      if (
                        isActivelySelecting &&
                        startDate &&
                        date < startDate
                      ) {
                        return 'past-date no-highlight disabled-date';
                      }

                      // Check for exact match with start or end date
                      if (
                        startDate &&
                        date.getDate() === startDate.getDate() &&
                        date.getMonth() === startDate.getMonth() &&
                        date.getFullYear() === startDate.getFullYear()
                      ) {
                        return 'custom-day-selected start-date always-highlight';
                      }

                      // Check if date is inside the range - this takes precedence
                      if (
                        startDate &&
                        endDate &&
                        date > startDate &&
                        date < endDate
                      ) {
                        return 'react-datepicker__day--in-range';
                      }

                      // Prevent same day number from being highlighted in future months
                      // ONLY if it's not in a selected range
                      const currentDate = new Date();
                      if (
                        date.getDate() === currentDate.getDate() &&
                        (date.getMonth() > currentDate.getMonth() ||
                          date.getFullYear() > currentDate.getFullYear())
                      ) {
                        return 'no-highlight';
                      }

                      // Apply no-highlight to ALL dates with same day number but different month/year
                      if (
                        startDate &&
                        date.getDate() === startDate.getDate() &&
                        (date.getMonth() !== startDate.getMonth() ||
                          date.getFullYear() !== startDate.getFullYear())
                      ) {
                        return 'no-highlight';
                      }

                      return '';
                    }}
                    renderDayContents={(day, date) => {
                      const isExactMatch =
                        startDate &&
                        date.getDate() === startDate.getDate() &&
                        date.getMonth() === startDate.getMonth() &&
                        date.getFullYear() === startDate.getFullYear();

                      if (isExactMatch) {
                        return <div className="custom-selected-day">{day}</div>;
                      }

                      return day;
                    }}
                    renderCustomHeader={({
                      monthDate,
                      decreaseMonth,
                      increaseMonth,
                    }) => (
                      <div className="flex items-center justify-between px-2 ">
                        <button
                          aria-label="Previous Month"
                          className="p-1 rounded-full hover:bg-blue-50"
                          onClick={decreaseMonth}
                          type="button"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <h2 className="title-t4 text-background-on">
                          {format(monthDate, 'MMMM yyyy')}
                        </h2>
                        <button
                          aria-label="Next Month"
                          className="p-1 rounded-full hover:bg-blue-50"
                          onClick={increaseMonth}
                          type="button"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end p-3 border-t gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearDates}
                className="pb-0.5  label-l2 text-container-on"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={closeCalendar}
                className="bg-primary hover:bg-primary-variant label-l2 pb-0.5  text-primary-on "
                disabled={!startDate || (tripType === 'round' && !endDate)}
              >
                Apply
              </Button>
            </div>
          </div>,
          document.body
        ) as React.ReactPortal)}

      {/* Styles for the date picker */}
      <style jsx global>{`
        /* Fix for the same day number highlighting in future months */
        .react-datepicker__day--keyboard-selected.no-highlight,
        .react-datepicker__day--today.no-highlight,
        .react-datepicker__day.no-highlight {
          background-color: transparent !important;
          color: inherit !important;
          border-radius: 0 !important;
          border: none !important;
          font-weight: normal !important;
        }

        /* Ensure in-range dates are always highlighted properly, even if they match current date */
        .react-datepicker__day--in-range {
          background-color: #5143d9 !important;
          color: #ffffff !important;
          border-radius: 0 !important;
          z-index: 1 !important;
        }

        .datepicker-dropdown {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .custom-calendar {
          border: none !important;
          width: 100%;
          font-family: inherit;
        }

        .react-datepicker {
          border: none !important;
          background: transparent;
          display: flex;
          justify-content: center;
          width: 100%;
        }

        /* Calendar styles for Round Trip */
        .round-trip-calendar {
          min-width: 280px;
        }

        .round-trip-calendar .react-datepicker__month-container {
          float: none;
          width: 280px;
          margin: 0 4px;
        }

        /* Hide dates from other months in both calendars */
        .react-datepicker__day--outside-month {
          visibility: hidden;
          color: transparent;
          pointer-events: none;
        }

        /* Calendar styles for One Way */
        .single-month-calendar {
          min-width: 280px;
        }

        .single-month-calendar .react-datepicker__month-container {
          width: 280px;
          margin: 0 auto !important;
          float: none !important;
        }

        .single-month-calendar .react-datepicker__month {
          padding: 0.4rem 0;
        }

        .react-datepicker__header {
          background-color: white;
          border-bottom: none;
          padding-top: 0.5rem;
        }

        .react-datepicker__day-names {
          display: flex;
          justify-content: space-around;
          margin-top: 0.5rem;
        }

        .react-datepicker__day-name {
          width: 36px;
          color: #0c0c0c;
          font-size: 0.875rem;
          margin: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .react-datepicker__month {
          margin: 0;
          padding-top: 0.25rem;
        }

        .react-datepicker__week {
          display: flex;
          justify-content: space-around;
        }

        .react-datepicker__day {
          width: 36px;
          height: 36px;
          line-height: 36px;
          margin: 0;
          font-size: 0.875rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 0 !important; /* Reset first */
        }

        /* Add slight margin to prevent range boxes from touching */
        .react-datepicker__day--in-range {
          margin: 1px;
        }

        .react-datepicker__day:hover:not(
            .react-datepicker__day--outside-month
          ) {
          background-color: #ebf5ff;
          border-radius: 9999px !important;
          color: #0c0c0c;
        }

        .react-datepicker__day--selected,
        .react-datepicker__day--in-selecting-range,
        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end {
          background-color: #ebf5ff;
          color: #0c0c0c;
          font-weight: normal;
          border-radius: 9999px !important;
        }

        /* Improved styles for in-range days */
        .react-datepicker__day--in-range {
          background-color: #5143d9 !important;
          color: #ffffff !important;
          border-radius: 0 !important;
        }

        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end,
        .react-datepicker__day--selecting-range-start,
        .react-datepicker__day--selecting-range-end {
          border-radius: 9999px !important;
          z-index: 2 !important;
          position: relative !important;
          overflow: hidden !important;
        }

        .react-datepicker__day--keyboard-selected {
          background-color: #5143d9;
          color: #ffffff;
        }

        /* Improved styling for dates that are being selected in a range */
        .react-datepicker__day--in-selecting-range {
          background-color: #5143d9 !important;
          color: white !important;
        }

        /* Make sure the original selected date is highlighted during selection */
        .react-datepicker__day--selecting-range-start {
          background-color: #5143d9 !important;
          color: white !important;
          border-radius: 9999px !important;
        }

        /* Ensure endpoint styles take precedence */
        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end,
        .react-datepicker__day--selecting-range-start {
          background-color: #5143d9 !important;
          color: white !important;
          border-radius: 9999px !important;
          z-index: 2 !important;
          position: relative !important;
        }

        /* Additional styling for specific days to ensure circular shape */
        .react-datepicker__day--selected {
          border-radius: 9999px !important;
        }

        /* Make sure the start-date always has proper border-radius */
        .start-date {
          border-radius: 9999px !important;
        }

        /* Just to be absolutely certain the start date is highlighted, including today */
        .react-datepicker__day.start-date,
        .react-datepicker__day--selected.start-date,
        .react-datepicker__day--today.start-date {
          background-color: #5143d9 !important;
          color: #ffffff !important;
          border-radius: 9999px !important;
        }

        /* Ensure our end date is highlighted too, including if it's today */
        .react-datepicker__day.end-date,
        .react-datepicker__day--selected.end-date,
        .react-datepicker__day--today.end-date {
          background-color: #5143d9 !important;
          color: white !important;
          border-radius: 9999px !important;
        }

        /* Make sure today's date is properly highlighted when it's in a range */
        .react-datepicker__day--today.react-datepicker__day--in-range,
        .react-datepicker__day--today.react-datepicker__day--in-selecting-range {
          background-color: #5143d9 !important;
          color: white !important;
        }

        /* Always highlight this specific day regardless of selection state */
        .always-highlight {
          background-color: #5143d9 !important;
          color: #ffffff !important;
          border-radius: 9999px !important;
          z-index: 3 !important; /* Highest z-index to ensure visibility */
          position: relative !important;
        }

        /* Ensure proper styling during the selection process */
        .react-datepicker__day--in-selecting-range:not(
            .react-datepicker__day--in-range
          ):not(.react-datepicker__day--range-start):not(
            .react-datepicker__day--range-end
          ) {
          background-color: #5143d9 !important;
          color: #ffffff !important;
        }

        /* Properly style disabled (past) dates */
        .react-datepicker__day--disabled,
        .disabled-date {
          color: #d1d5db !important;
          cursor: not-allowed !important;
          background-color: #f9fafb !important;
          pointer-events: none !important;
          opacity: 0.5 !important;
        }

        /* Ensure disabled dates don't get highlighted even if they match the day pattern */
        .react-datepicker__day--disabled.custom-day-selected,
        .react-datepicker__day--disabled.start-date,
        .react-datepicker__day--disabled.end-date,
        .react-datepicker__day--disabled.react-datepicker__day--in-range,
        .react-datepicker__day--disabled.react-datepicker__day--in-selecting-range,
        .disabled-date.custom-day-selected,
        .disabled-date.start-date,
        .disabled-date.end-date {
          background-color: #f9fafb !important;
          color: #d1d5db !important;
          border-radius: 0 !important;
          pointer-events: none !important;
        }

        /* Overrides for the range endpoints */
        .range-endpoint {
          background-color: #5143d9 !important;
          color: white !important;
          border-radius: 9999px !important;
        }

        /* Override precedence issues by being more specific */
        .react-datepicker__day.range-endpoint {
          background-color: #5143d9 !important;
          color: white !important;
          border-radius: 9999px !important;
        }

        /* Make the start/end even more specific to override other styles */
        .react-datepicker__day--range-start.range-endpoint,
        .react-datepicker__day--range-end.range-endpoint,
        .react-datepicker__day--selected.range-endpoint {
          background-color: #5143d9 !important;
          color: white !important;
        }

        /* Mobile-specific fixes to prevent automatic highlighting */
        @media (max-width: 640px) {
          .react-datepicker__month-container {
            width: 100% !important;
            margin: 0 !important;
          }

          .react-datepicker {
            width: 100% !important;
          }

          .react-datepicker__day--keyboard-selected {
            background-color: transparent !important;
            color: inherit !important;
            border-radius: 0 !important;
          }

          /* Prevent automatic highlighting when switching months */
          .react-datepicker__day:not(.react-datepicker__day--selected):not(
              .start-date
            ):not(.end-date):not(.always-highlight):not(
              .react-datepicker__day--in-range
            ) {
            background-color: transparent !important;
            color: inherit !important;
          }

          /* Extra specificity for month switching on mobile */
          .react-datepicker__month:not(:first-child)
            .react-datepicker__day:not(.react-datepicker__day--in-range):not(
              .start-date
            ):not(.end-date):not(.always-highlight) {
            background-color: transparent !important;
            color: inherit !important;
          }

          /* Make sure we maintain our actual selections */
          .react-datepicker__day.custom-day-selected,
          .react-datepicker__day.always-highlight,
          .react-datepicker__day.start-date,
          .react-datepicker__day.end-date {
            background-color: #5143d9 !important;
            color: white !important;
            border-radius: 9999px !important;
          }

          /* Enhanced range day highlighting for mobile */
          .react-datepicker__day--in-range,
          .react-datepicker__day--in-selecting-range,
          .react-datepicker__month .react-datepicker__day--in-range {
            background-color: #5143d9 !important;
            color: #ffffff !important;
            opacity: 1 !important;
            border-radius: 0 !important;
            z-index: 1 !important;
          }

          /* Ensure range endpoints have higher z-index */
          .react-datepicker__day--range-start,
          .react-datepicker__day--range-end {
            position: relative !important;
            z-index: 2 !important;
            background-color: #5143d9 !important;
            color: white !important;
            border-radius: 9999px !important;
          }
        }

        /* One Way Calendar custom styling */
        .oneway-calendar
          .react-datepicker__day--selected:not(.custom-day-selected):not(
            .start-date
          ):not(.always-highlight) {
          background-color: transparent !important;
          color: inherit !important;
          border-radius: 0 !important;
        }

        .oneway-calendar
          .react-datepicker__day--keyboard-selected:not(
            .custom-day-selected
          ):not(.start-date):not(.always-highlight) {
          background-color: transparent !important;
          color: inherit !important;
        }

        /* Ensure disabled dates in one-way calendar are properly styled */
        .oneway-calendar .react-datepicker__day--disabled,
        .oneway-calendar .disabled-date,
        .oneway-calendar .past-date {
          color: #d1d5db !important;
          opacity: 0.5 !important;
          background-color: #f9fafb !important;
          pointer-events: none !important;
          cursor: not-allowed !important;
        }

        .custom-selected-day {
          background-color: #5143d9;
          color: white;
          border-radius: 9999px;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Add this class to override any highlighting for days with same number in different months */
        .no-highlight {
          background-color: transparent !important;
          color: inherit !important;
          border-radius: 0 !important;
        }

        /* Make sure this overrides all built-in styles */
        .react-datepicker__day--selected.no-highlight,
        .react-datepicker__day--in-selecting-range.no-highlight,
        .react-datepicker__day--range-start.no-highlight,
        .react-datepicker__day--range-end.no-highlight,
        .react-datepicker__day--in-range.no-highlight {
          background-color: transparent !important;
          color: inherit !important;
          border-radius: 0 !important;
        }

        /* New styles for better highlighting of range endpoints */
        .range-endpoint {
          background-color: #5143d9 !important;
          color: white !important;
          border-radius: 9999px !important;
        }

        /* Override precedence issues by being more specific */
        .react-datepicker__day.range-endpoint {
          background-color: #5143d9 !important;
          color: white !important;
          border-radius: 9999px !important;
        }

        /* Make the start/end even more specific to override other styles */
        .react-datepicker__day--range-start.range-endpoint,
        .react-datepicker__day--range-end.range-endpoint,
        .react-datepicker__day--selected.range-endpoint {
          background-color: #5143d9 !important;
          color: white !important;
        }

        /* Past dates - always faded but matching original style */
        .past-date,
        .react-datepicker__day.past-date {
          color: #d1d5db !important;
          opacity: 0.5 !important;
          background-color: #f9fafb !important;
          pointer-events: none !important;
          cursor: not-allowed !important;
        }

        /* Ensure past dates have proper visual disabled state */
        .past-date:hover,
        .react-datepicker__day.past-date:hover {
          background-color: #f9fafb !important;
          color: #d1d5db !important;
          cursor: not-allowed !important;
        }

        /* Make sure the 'no-highlight' class always takes precedence */
        .no-highlight,
        .react-datepicker__day--in-selecting-range.no-highlight,
        .react-datepicker__day--in-range.no-highlight {
          background-color: transparent !important;
          color: inherit !important;
          border-radius: 0 !important;
        }

        /* Make sure selected days remain selected during range selection */
        .react-datepicker__day.always-highlight,
        .react-datepicker__day--in-selecting-range.always-highlight,
        .react-datepicker__day--selected.always-highlight {
          background-color: #5143d9 !important;
          color: #ffffff !important;
          border-radius: 9999px !important;
          z-index: 3 !important;
          position: relative !important;
        }

        /* Remove special styling for today - completely neutralize it */
        .react-datepicker__day--today {
          border: none !important;
          background-color: transparent !important;
          color: inherit !important;
          font-weight: normal !important;
          border-radius: 0 !important;
        }

        /* Custom styles for selected days - ensure high specificity */
        .custom-day-selected,
        .react-datepicker__day.custom-day-selected,
        .react-datepicker__day--selected.custom-day-selected,
        .react-datepicker__day--range-start.custom-day-selected,
        .react-datepicker__day--range-end.custom-day-selected,
        .react-datepicker__day--today.custom-day-selected {
          background-color: #5143d9 !important;
          color: #ffffff !important;
          border-radius: 9999px !important;
          font-weight: 600 !important;
        }

        /* Additional styling for specific days to ensure circular shape */
        .react-datepicker__day--selected {
          background-color: #5143d9 !important;
          color: #ffffff !important;
          border-radius: 9999px !important;
          z-index: 2 !important;
          position: relative !important;
        }

        /* Just to be absolutely certain the start date is highlighted, including today */
        .react-datepicker__day.start-date,
        .react-datepicker__day--selected.start-date,
        .react-datepicker__day--today.start-date {
          background-color: #5143d9 !important;
          color: #ffffff !important;
          border-radius: 9999px !important;
        }

        /* Fix hover styles during range selection to ensure circular shape */
        .react-datepicker__day--in-selecting-range:hover,
        .react-datepicker__day--in-range:hover,
        .react-datepicker__day:hover {
          border-radius: 9999px !important;
        }

        /* Also ensure hover on range selection maintains circular shape */
        .react-datepicker__day--selecting-range-start:hover,
        .react-datepicker__day--range-start:hover,
        .react-datepicker__day--range-end:hover {
          border-radius: 9999px !important;
        }

        /* Make dates circular during keyboard navigation and other states */
        .react-datepicker__day--keyboard-selected {
          border-radius: 9999px !important;
        }

        /* Fix for hovering date during range selection (the endpoint) */
        .react-datepicker__day--selecting-range-end {
          border-radius: 9999px !important;
        }

        /* Additional specific case for the hovering endpoint */
        .react-datepicker__day--in-selecting-range:last-child {
          border-radius: 9999px !important;
        }

        /* Universal fix to ensure all date states have proper circular shape */
        .react-datepicker__day {
          border-radius: 0 !important; /* Reset first */
        }

        /* Then apply circular shape to all interactive states */
        .react-datepicker__day:hover,
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected,
        .react-datepicker__day--in-range,
        .react-datepicker__day--in-selecting-range,
        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end,
        .react-datepicker__day--selecting-range-start,
        .react-datepicker__day--selecting-range-end,
        .react-datepicker__day.start-date,
        .react-datepicker__day.end-date,
        .react-datepicker__day.custom-day-selected,
        .react-datepicker__day.always-highlight {
          border-radius: 9999px !important;
        }

        /* Global override for first and last date in a range */
        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end,
        .react-datepicker__day--selecting-range-start,
        .react-datepicker__day--selecting-range-end {
          border-radius: 9999px !important;
          z-index: 2 !important;
          position: relative !important;
          overflow: hidden !important;
        }

        /* Target the specific issue with day during range selection - override any rectangular shape */
        .react-datepicker__month
          .react-datepicker__day.react-datepicker__day--in-selecting-range:not(
            .react-datepicker__day--in-range
          ) {
          border-radius: 9999px !important;
          z-index: 1 !important;
        }

        /* Ensure the currently hovered date is fully circular */
        .react-datepicker__day--selecting-range-end,
        .react-datepicker__day:hover {
          border-radius: 9999px !important;
          overflow: hidden !important;
        }

        /* Ultra-specific selector for the final date in a range selection (the most problematic case) */
        .react-datepicker__day.react-datepicker__day--in-selecting-range:last-of-type,
        td:last-child
          .react-datepicker__day.react-datepicker__day--in-selecting-range,
        .react-datepicker__week:last-child
          .react-datepicker__day.react-datepicker__day--in-selecting-range {
          border-radius: 9999px !important;
          overflow: hidden !important;
        }

        /* Fix for selecting the same day in both months */
        .react-datepicker__month:nth-child(2)
          .react-datepicker__day--selecting-range-end,
        .react-datepicker__month:nth-child(2)
          .react-datepicker__day--selecting-range-start {
          border-radius: 9999px !important;
          overflow: hidden !important;
        }
      `}</style>
    </div>
  );
}
