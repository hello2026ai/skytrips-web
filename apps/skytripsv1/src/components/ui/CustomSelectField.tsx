'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '../../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CustomSelectFieldProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  fullWidth?: boolean;
  options: SelectOption[];
  onChange?: (value: string) => void;
  placeholder?: string;
}

const CustomSelectField = forwardRef<HTMLSelectElement, CustomSelectFieldProps>(
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
      options,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    // Custom arrow icon for the select
    const ArrowIcon = () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-neutral-dark"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    );

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className={cn('flex flex-col', fullWidth && 'w-full')}>
        {label && (
          <label
            className={cn(
              'form-label text-background-on block mb-1',
              error ? 'text-error' : '',
              disabled && 'opacity-50',
              focused && !error && 'text-primary'
            )}
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className={cn('relative', fullWidth && 'w-full')}>
          {startAdornment && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark z-10">
              {startAdornment}
            </div>
          )}

          <select
            className={cn(
              'form-field appearance-none',
              error && 'form-field-error border-red-500',
              disabled && 'form-field-disabled',
              startAdornment && 'pl-10',
              'pr-10', // Always leave space for the dropdown arrow
              fullWidth ? 'w-full' : 'w-auto',
              focused && !error && 'border-primary',
              className
            )}
            ref={ref}
            disabled={disabled}
            required={required}
            value={value}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          >
            {/* Optional placeholder option */}
            {props.placeholder && (
              <option value="" disabled>
                {props.placeholder}
              </option>
            )}

            {/* Render provided options */}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow */}
          <div
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none',
              focused ? 'text-primary' : 'text-neutral-dark',
              error && 'text-error'
            )}
          >
            {endAdornment || <ArrowIcon />}
          </div>
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

CustomSelectField.displayName = 'CustomSelectField';

export { CustomSelectField };
