'use client';

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';
// import phoneNumberCodeData from 'skytrips-web/libs/shared-utils/constants/phoneNumberCode.json';
import phoneNumberCodeData from '../../../../../libs/src/shared-utils/constants/phoneNumberCode.json';
import Image from 'next/image';

// Define country data structure for phone fields
interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  image?: string;
}

// Transform phoneNumberCodeData into our format
const countries: Country[] = Object.entries(phoneNumberCodeData)
  .map(([code, details]: [string, any]) => ({
    code,
    name: details.name || '',
    flag: details.emoji || '🏳️',
    dialCode: details.phone && details.phone.length > 0 ? details.phone[0] : '',
    image: details.image || '',
  }))
  .filter((country) => country.dialCode);

export interface CustomTextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  fullWidth?: boolean;
  // Phone mode specific props
  isPhoneNumber?: boolean;
  countryCode?: string;
  onCountryCodeChange?: (value: string) => void;
}

const CustomTextField = forwardRef<HTMLInputElement, CustomTextFieldProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      errorMessage,
      helperText,
      startAdornment,
      endAdornment,
      fullWidth = false,
      required,
      disabled,
      isPhoneNumber = false,
      countryCode = '+61',
      onCountryCodeChange,
      onChange,
      ...props
    },
    ref
  ) => {
    // Add states for phone mode
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Find selected country for phone mode
    const selectedCountry =
      countries.find((c) => c.dialCode === countryCode) || countries[0];

    // Filter countries based on search query for phone mode
    const filteredCountries = searchQuery
      ? countries.filter(
          (country) =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            country.dialCode.includes(searchQuery)
        )
      : countries;

    // Handle click outside to close dropdown for phone mode
    useEffect(() => {
      if (!isPhoneNumber) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isPhoneNumber]);

    // Focus search input when dropdown opens for phone mode
    useEffect(() => {
      if (isDropdownOpen && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isDropdownOpen]);

    // Handle country selection for phone mode
    const handleCountrySelect = (country: Country) => {
      if (onCountryCodeChange) {
        onCountryCodeChange(country.dialCode);
      }
      setIsDropdownOpen(false);
      setSearchQuery('');
    };

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
          {isPhoneNumber ? (
            // Phone number input with country code selector
            <div
              className={cn(
                'flex border rounded-[4px] pl-2',
                error ? 'border-error' : 'border-gray-300',
                disabled && 'opacity-50'
              )}
            >
              {/* Country Code Selector */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className={cn(
                    'flex items-center justify-center pr-2 py-2.5 text-sm ',
                    error ? 'border-error' : 'border-gray-300',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() =>
                    !disabled && setIsDropdownOpen(!isDropdownOpen)
                  }
                  disabled={disabled}
                >
                  {selectedCountry.image ? (
                    <Image
                      src={selectedCountry.image}
                      alt={`${selectedCountry.name} flag`}
                      width={20}
                      height={14}
                      className="mr-1"
                    />
                  ) : (
                    <span className="mr-1">{selectedCountry.flag}</span>
                  )}
                  <span>{selectedCountry.dialCode}</span>
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={isDropdownOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                    ></path>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute left-0 z-10 mt-1 w-60 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            ></path>
                          </svg>
                        </div>
                        <input
                          ref={searchInputRef}
                          type="text"
                          className="w-full py-2 pl-10 pr-3 form-label rounded-md"
                          placeholder="Country Name or Code"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Country List */}
                    <div className="mt-1">
                      {filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          className="flex items-center w-full text-left form-label text-background-on hover:bg-gray-100 px-2 py-1.5 overflow-hidden"
                          onClick={() => handleCountrySelect(country)}
                        >
                          <div className="flex-shrink-0 w-6 h-4 mr-2">
                            {country.image ? (
                              <Image
                                src={country.image}
                                alt={`${country.name} flag`}
                                width={24}
                                height={16}
                                className="object-contain"
                              />
                            ) : (
                              <span>{country.flag}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 truncate">
                            <span className="font-medium">
                              {country.dialCode}
                            </span>
                            <span className="ml-1 text-gray-700 truncate">
                              {country.name}
                            </span>
                            <span className="text-gray-500 ml-1">
                              ({country.code})
                            </span>
                          </div>
                        </button>
                      ))}
                      {filteredCountries.length === 0 && (
                        <div className="px-4 py-2 form-label text-background-on">
                          No countries found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Phone Number Input */}
              <span className="flex items-center text-neutral-dark mb-1">
                |
              </span>
              <input
                type="number"
                className={cn(
                  `flex-1 form-field text-base ${
                    error
                      ? 'border-error'
                      : '!border-0 !rounded-none !rounded-r-md focus:!ring-0 focus:!border-0'
                  }`,
                  error && 'form-field-error',
                  disabled && 'form-field-disabled',
                  className
                )}
                style={{ fontSize: '16px' }}
                ref={ref}
                disabled={disabled}
                required={required}
                placeholder={props.placeholder || 'Enter your mobile'}
                onChange={onChange}
                {...props}
              />
            </div>
          ) : (
            // Standard input
            <>
              {startAdornment && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark">
                  {startAdornment}
                </div>
              )}

              <input
                type={type}
                className={cn(
                  'form-field',
                  error && 'form-field-error',
                  disabled && 'form-field-disabled',
                  startAdornment && 'pl-10',
                  endAdornment && 'pr-10',
                  fullWidth ? 'w-full' : 'w-auto',
                  className
                )}
                ref={ref}
                disabled={disabled}
                required={required}
                placeholder={props.placeholder || label}
                onChange={onChange}
                {...props}
                value={props.value}
              />

              {endAdornment && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark">
                  {endAdornment}
                </div>
              )}
            </>
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

CustomTextField.displayName = 'CustomTextField';

export { CustomTextField };
