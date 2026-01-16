'use client';

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';

export interface CustomDatePickerProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  fullWidth?: boolean;
  minDate?: string;
  maxDate?: string;
  yearRange?: number; // Number of years to show before and after current year
}

const CustomDatePicker = forwardRef<HTMLInputElement, CustomDatePickerProps>(
  (
    {
      className,
      label,
      error,
      errorMessage,
      helperText,
      startAdornment,
      endAdornment,
      fullWidth = false,
      required,
      disabled,
      minDate,
      maxDate,
      yearRange = 140, // Changed from 120 to 140 years
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
      if (!value) return null;

      const dateStr = value.toString();
      // If it's in YYYY-MM-DD format, parse it carefully to avoid timezone issues
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day); // month is 0-indexed
      }

      // For other formats, try to parse normally
      return new Date(dateStr + 'T00:00:00'); // Add time to force local timezone
    });
    const [currentMonth, setCurrentMonth] = useState<Date>(
      selectedDate || new Date()
    );
    const [showYearSelector, setShowYearSelector] = useState(false);
    const [showMonthSelector, setShowMonthSelector] = useState(false);

    const calendarRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Forward the ref
    React.useImperativeHandle(ref, () => inputRef.current!);

    // Update selectedDate when value prop changes
    useEffect(() => {
      if (!value) {
        setSelectedDate(null);
        return;
      }

      const dateStr = value.toString();
      let newDate: Date | null = null;

      // If it's in YYYY-MM-DD format, parse it carefully to avoid timezone issues
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        newDate = new Date(year, month - 1, day); // month is 0-indexed
      } else {
        // For other formats, try to parse normally
        newDate = new Date(dateStr + 'T00:00:00'); // Add time to force local timezone
      }

      // Only update if the date actually changed
      if (
        newDate &&
        (!selectedDate || newDate.getTime() !== selectedDate.getTime())
      ) {
        setSelectedDate(newDate);
        setCurrentMonth(newDate);
      }
    }, [value]);

    // Calendar icon SVG
    const CalendarIcon = () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-neutral-dark"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    );

    // Format date to display in a more user-friendly way
    const formatDisplayDate = (date: Date | null): string => {
      if (!date) return '';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    // Handler for date selection
    const handleDateSelect = (date: Date) => {
      setSelectedDate(date);
      setShowCalendar(false);
      setFocused(false);

      // Create a synthetic event to pass to onChange
      if (onChange && inputRef.current) {
        // Format date without timezone conversion issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`; // YYYY-MM-DD

        // Set the value directly on the input
        inputRef.current.value = formattedDate;

        // Create and dispatch the change event
        const event = new Event('change', { bubbles: true });
        Object.defineProperty(event, 'target', { value: inputRef.current });
        onChange(event as unknown as React.ChangeEvent<HTMLInputElement>);
      }
    };

    // Create days for the calendar
    const getDaysInMonth = (year: number, month: number) => {
      return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
      return new Date(year, month, 1).getDay();
    };

    // Generate days for the calendar
    const generateCalendarDays = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();

      const daysInMonth = getDaysInMonth(year, month);
      const firstDayOfMonth = getFirstDayOfMonth(year, month);

      const days = [];

      // Add empty cells for days before the first day of month
      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
      }

      // Add days of the month
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
      }

      return days;
    };

    // Month navigation
    const handlePrevMonth = () => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      );
    };

    const handleNextMonth = () => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
      );
    };

    // Check if a date is the selected date
    const isSelectedDate = (date: Date) => {
      return selectedDate?.toDateString() === date.toDateString();
    };

    // Check if a date is today
    const isToday = (date: Date) => {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    };

    // Check if a date is selectable (not disabled)
    const isSelectable = (date: Date) => {
      if (minDate && new Date(minDate) > date) return false;
      if (maxDate && new Date(maxDate) < date) return false;
      return true;
    };

    // Generate years for the selector
    const generateYears = () => {
      const currentYear = new Date().getFullYear();
      const years = [];

      // Default ranges - look back by yearRange, but also include 10 years in the future
      // This ensures future years are available for expiry dates
      let minYear = currentYear - yearRange;
      let maxYear = currentYear + 10; // Include 10 years in the future by default

      if (minDate) {
        const minDateYear = new Date(minDate).getFullYear();
        // If minDate is in the future (for expiry dates), ensure we show at least
        // 10 years ahead of the minimum date
        if (minDateYear >= currentYear) {
          minYear = currentYear; // No need to show far past years for expiry dates
          maxYear = Math.max(maxYear, minDateYear + 20);
        } else {
          minYear = Math.max(minYear, minDateYear);
        }
      }

      if (maxDate) {
        maxYear = Math.min(maxYear, new Date(maxDate).getFullYear());
      }

      for (let year = minYear; year <= maxYear; year++) {
        years.push(year);
      }

      return years;
    };

    // Handle year selection
    const handleYearSelect = (year: number) => {
      setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
      setShowYearSelector(false);
    };

    // Year selector ref for scrolling
    const yearSelectorRef = useRef<HTMLDivElement>(null);

    // Scroll to current year when year selector opens
    useEffect(() => {
      if (showYearSelector && yearSelectorRef.current) {
        const currentYearElement = yearSelectorRef.current.querySelector(
          `[data-year="${currentMonth.getFullYear()}"]`
        );

        if (currentYearElement) {
          // Scroll the current year into view with some offset to center it
          currentYearElement.scrollIntoView({
            block: 'center',
            behavior: 'smooth',
          });
        }
      }
    }, [showYearSelector, currentMonth.getFullYear()]);

    // Handle month selection
    const handleMonthSelect = (month: number) => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), month, 1));
      setShowMonthSelector(false);
    };

    // Month names array
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Dropdown arrow
    const ArrowDownIcon = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    );

    // Handle click outside to close calendar
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          calendarRef.current &&
          !calendarRef.current.contains(event.target as Node) &&
          inputRef.current &&
          !inputRef.current.contains(event.target as Node)
        ) {
          setShowCalendar(false);
          setShowYearSelector(false);
          setShowMonthSelector(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Reset calendar view to current date when opening
    useEffect(() => {
      if (showCalendar) {
        // If a date is selected, show that month/year
        // Otherwise show the current month/year
        setCurrentMonth(selectedDate || new Date());
      }
    }, [showCalendar, selectedDate]);

    return (
      <div className={cn('flex flex-col', fullWidth && 'w-full')}>
        {label && (
          <label
            className={cn(
              'form-label text-background-on block mb-1',
              error ? 'text-error' : '',
              disabled && 'opacity-50'
            )}
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className={cn('relative', fullWidth && 'w-full')}>
          <div
            className={cn(
              'relative cursor-pointer',
              focused && !error && '',
              focused && error && 'ring-1 ring-error rounded-lg'
            )}
            onClick={() => {
              if (!disabled) {
                setFocused(true);
                setShowCalendar(true);
              }
            }}
          >
            {startAdornment && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark">
                {startAdornment}
              </div>
            )}

            <input
              type="text" // Changed from date to text for custom picker
              className={cn(
                'form-field',
                'pr-10',
                error && 'form-field-error',
                disabled && 'form-field-disabled',
                startAdornment && 'pl-10',
                fullWidth ? 'w-full' : 'w-auto',
                focused && !error && 'border-primary',
                'cursor-pointer',
                'pointer-events-none', // Prevent direct interaction with input
                className
              )}
              readOnly // Make it read-only since we're using our custom picker
              ref={inputRef}
              disabled={disabled}
              required={required}
              value={formatDisplayDate(selectedDate)}
              {...props}
            />

            <div
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none',
                // focused ? 'text-neutral-dark' : 'text-neutral-dark',
                error && 'text-error'
              )}
            >
              <CalendarIcon />
            </div>
          </div>

          {/* Custom Calendar Dropdown */}
          {showCalendar && !disabled && (
            <div
              ref={calendarRef}
              className="absolute z-50 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-72"
            >
              {/* Calendar Header */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-gray-100 rounded-full"
                  type="button"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <div className="flex items-center space-x-1">
                  {/* Month Selector Button */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowMonthSelector(!showMonthSelector);
                        setShowYearSelector(false);
                      }}
                      className="px-2 py-1 text-sm font-medium hover:bg-gray-100 rounded flex items-center space-x-1"
                      type="button"
                    >
                      <span>
                        {currentMonth.toLocaleDateString('en-US', {
                          month: 'long',
                        })}
                      </span>
                      <ArrowDownIcon />
                    </button>

                    {/* Month Selector Dropdown */}
                    {showMonthSelector && (
                      <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-40 max-h-56 overflow-y-auto z-10">
                        <div className="grid grid-cols-1 gap-1">
                          {monthNames.map((month, index) => (
                            <button
                              key={month}
                              onClick={() => handleMonthSelect(index)}
                              className={cn(
                                'px-3 py-2 text-sm text-left rounded hover:bg-gray-100',
                                currentMonth.getMonth() === index &&
                                  'bg-primary/10 font-medium'
                              )}
                              type="button"
                            >
                              {month}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Year Selector Button */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowYearSelector(!showYearSelector);
                        setShowMonthSelector(false);
                      }}
                      className="px-2 py-1 text-sm font-medium hover:bg-gray-100 rounded flex items-center space-x-1"
                      type="button"
                    >
                      <span>{currentMonth.getFullYear()}</span>
                      <ArrowDownIcon />
                    </button>

                    {/* Year Selector Dropdown */}
                    {showYearSelector && (
                      <div
                        ref={yearSelectorRef}
                        className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-24 max-h-56 overflow-y-auto z-10"
                      >
                        <div className="grid grid-cols-1 gap-1">
                          {generateYears().map((year) => (
                            <button
                              key={year}
                              onClick={() => handleYearSelect(year)}
                              className={cn(
                                'px-3 py-2 text-sm text-left rounded hover:bg-gray-100',
                                currentMonth.getFullYear() === year &&
                                  'bg-primary/10 font-medium'
                              )}
                              type="button"
                              data-year={year}
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-gray-100 rounded-full"
                  type="button"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div
                    key={index}
                    className="text-center text-xs font-medium text-gray-500 h-8 flex items-center justify-center"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {generateCalendarDays().map((date, index) => (
                  <div
                    key={index}
                    className="h-8 flex items-center justify-center text-sm"
                  >
                    {date && (
                      <button
                        type="button"
                        onClick={() =>
                          isSelectable(date) && handleDateSelect(date)
                        }
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          isSelectedDate(date) && 'bg-primary text-white',
                          isToday(date) &&
                            !isSelectedDate(date) &&
                            'border border-primary',
                          !isSelectable(date) &&
                            'text-gray-300 cursor-not-allowed',
                          isSelectable(date) &&
                            !isSelectedDate(date) &&
                            'hover:bg-gray-100'
                        )}
                        disabled={!isSelectable(date)}
                      >
                        {date.getDate()}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Calendar Footer */}
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCalendar(false);
                    setShowYearSelector(false);
                    setShowMonthSelector(false);
                  }}
                  className="text-sm text-primary font-medium px-4 py-2 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDateSelect(selectedDate);
                    }}
                    className="text-sm text-primary font-medium px-4 py-2 hover:bg-gray-100 rounded ml-2"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {(error && errorMessage) || helperText ? (
          <p
            className={cn(
              'text-xs mt-1',
              error ? 'text-error' : 'text-neutral-dark'
            )}
          >
            {error ? errorMessage : helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

CustomDatePicker.displayName = 'CustomDatePicker';

export { CustomDatePicker };
