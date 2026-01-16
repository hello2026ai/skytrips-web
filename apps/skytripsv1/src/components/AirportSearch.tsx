'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X, Loader2, Plane } from 'lucide-react';
import axiosInstance from '../../lib/axiosConfig';
import { cn } from '../../lib/utils';
import popularAirports from '../data/airports.json';

interface Airport {
  id: string;
  type: string;
  name: string;
  elevationFt: string;
  continent: string;
  isoCountry: string;
  isoRegion: string;
  municipality: string;
  gpsCode: string;
  iataCode: string;
  localCode: string;
  coordinates: string;
  popularity: number;
  publishedStatus: boolean;
}

interface Location {
  municipality: string;
  country: string;
  region: string;
  airports: Airport[];
  hasLargeAirport: boolean;
}

interface AirportSearchProps {
  placeholder: string;
  label: string;
  onChange: (value: {
    code: string;
    name: string;
    city: string;
    country: string;
  }) => void;
  insideBorder?: boolean;
  value?: {
    code: string;
    name: string;
    city: string;
    country: string;
  } | null;
  excludeAirportCode?: string;
}

export function AirportSearch({
  placeholder,
  label,
  onChange,
  insideBorder = false,
  value = null,
  excludeAirportCode,
}: AirportSearchProps) {
  const [searchValue, setSearchValue] = React.useState('');
  const [expandedItems, setExpandedItems] = React.useState<
    Record<string, boolean>
  >({});
  const [selectedAirport, setSelectedAirport] = React.useState<{
    code: string;
    name: string;
    city: string;
    country: string;
  } | null>(value);
  const [locationData, setLocationData] = React.useState<Location[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dropdownStyles, setDropdownStyles] = React.useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 350,
  });
  const [isSelecting, setIsSelecting] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Initialize search value from value prop
  React.useEffect(() => {
    if (value && value.code) {
      setSelectedAirport(value);
      setSearchValue(`${value.city} (${value.code})`);
      // Ensure input is readonly when we have a selected airport
      if (inputRef.current) {
        inputRef.current.readOnly = true;
      }
    } else if (!value) {
      setSelectedAirport(null);
      setSearchValue('');
      // Ensure input is not readonly when cleared
      if (inputRef.current) {
        inputRef.current.readOnly = false;
      }
    }
  }, [value]);

  // Helper function to detect iOS devices
  const isIOS = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }, []);

  // Helper function to detect Android devices
  const isAndroid = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android/i.test(navigator.userAgent);
  }, []);

  // Special handling for iOS keyboard issues
  const forceKeyboardOpen = React.useCallback((element: HTMLInputElement) => {
    if (!element) return;

    // Focus multiple times
    element.focus();

    // Add some delay for iOS
    setTimeout(() => {
      // Only scroll if input is not visible - avoid forced scrolling
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

      if (!isVisible) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Double-tap approach sometimes needed on iOS
      element.blur();
      element.focus();

      // For iOS, positioning the cursor at end helps trigger keyboard
      if (element.value.length > 0) {
        const value = element.value;
        element.value = '';
        element.value = value;
      }
    }, 100);
  }, []);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Don't fetch or show dropdown if we already have a selected airport
      if (selectedAirport) {
        setShowDropdown(false);
        return;
      }

      // Only fetch and show dropdown for non-empty searches without selection
      if (searchValue.trim().length >= 1) {
        setIsLoading(true); // Always show loading first
        fetchLocationData(searchValue);
        setShowDropdown(true);
      } else if (searchValue.trim().length === 0) {
        // Show popular airports when search is empty
        setLocationData(popularAirports as Location[]);
        
        // Expand all by default
        const initialExpanded: Record<string, boolean> = {};
        (popularAirports as Location[]).forEach((location) => {
          const key = `${location.municipality}-${location.country}-${location.region}`;
          initialExpanded[key] = true;
        });
        setExpandedItems(initialExpanded);
        setShowDropdown(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, selectedAirport]);

  // Handle outside click to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Don't close if we're selecting
      if (isSelecting) {
        return;
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSelecting]);

  // Handle keyboard navigation for accessibility
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // Track mounted state for SSR
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Calculate and update position for dropdown
  const updatePosition = React.useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const isMobile = windowWidth < 768;

    // Calculate preferred width
    // Set fixed 300px width for mobile, min 380px for desktop
    const width = isMobile ? 300 : Math.max(rect.width, 380);

    // Calculate if dropdown would go off screen at bottom
    const spaceBelow = windowHeight - rect.bottom;
    const heightLimit = Math.min(350, spaceBelow - 10);

    // If very limited space below, position above
    let top = rect.bottom + window.scrollY;
    let maxHeight = heightLimit > 100 ? heightLimit : 350;

    // If less than 150px below, try positioning above
    if (spaceBelow < 150 && rect.top > 200) {
      top = rect.top + window.scrollY - Math.min(350, rect.top - 10);
      maxHeight = Math.min(350, rect.top - 10);
    }

    // Adjust left position if it would overflow right edge
    let left = rect.left + window.scrollX;

    // For mobile, center the dropdown
    if (isMobile) {
      left = (windowWidth - 300) / 2 + window.scrollX;
    } else if (left + width > windowWidth) {
      left = windowWidth - width - 10;
    }

    setDropdownStyles({
      top,
      left,
      width,
      maxHeight,
    });
  }, []);

  // Update position when dropdown is shown
  React.useEffect(() => {
    if (!showDropdown || !mounted) return;

    // Initial position calculation
    updatePosition();

    // Use requestAnimationFrame for smoother updates
    const handleScroll = () => requestAnimationFrame(updatePosition);
    const handleResize = () => requestAnimationFrame(updatePosition);

    // Listen for scroll events on window and all parent elements
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    // Also listen for scroll events on all parent elements
    const parentElements: HTMLElement[] = [];
    let parent = containerRef.current?.parentElement;
    while (parent) {
      parent.addEventListener('scroll', handleScroll, { passive: true });
      parentElements.push(parent);
      parent = parent.parentElement;
    }

    // Clean up function
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);

      parentElements.forEach((parent) => {
        parent.removeEventListener('scroll', handleScroll);
      });
    };
  }, [showDropdown, updatePosition, mounted]);

  const fetchLocationData = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        `/airport?symbol=${encodeURIComponent(query)}`
      );
      console.log('API Response:', response.data);
      const data = response.data.data || [];

      // Log the full response data to help debug
      console.log('Location data count:', data.length);
      data.forEach((location: Location, idx: number) => {
        console.log(
          `Location ${idx}: ${location.municipality}, Airports: ${
            location.airports?.length || 0
          }`
        );
      });

      // We no longer filter out excluded airports here
      setLocationData(data);

      // Force all locations to be expanded by default
      const initialExpanded: Record<string, boolean> = {};
      data.forEach((location: Location) => {
        const key = `${location.municipality}-${location.country}-${location.region}`;
        initialExpanded[key] = true; // Always set to true to ensure expansion
      });

      setExpandedItems(initialExpanded);
    } catch (error) {
      console.error('Error fetching airports:', error);
      setError('Failed to fetch airports. Please try again.');
    } finally {
      // Only set loading to false after everything is processed
      setTimeout(() => {
        setIsLoading(false);
      }, 300); // Ensure loader is visible for at least 300ms for better UX
    }
  };

  const handleSelect = (airport: Airport) => {
    if (!airport || !airport.iataCode) return;

    // If this airport code matches the excluded code, don't allow selection
    if (excludeAirportCode && airport.iataCode === excludeAirportCode) {
      return;
    }

    // Set selection in progress to prevent blur interference
    setIsSelecting(true);

    const formattedAirport = {
      code: airport.iataCode,
      name: airport.name || '',
      city: airport.municipality || '',
      country: airport.isoCountry || '',
    };

    // Update popularity count for the selected airport (async, non-blocking)
    updateAirportPopularity(airport.id);

    // Update states in the right order for Android compatibility
    const displayValue = `${airport.municipality || ''} (${airport.iataCode})`;

    setSelectedAirport(formattedAirport);
    setSearchValue(displayValue);
    onChange(formattedAirport);
    setShowDropdown(false);
    setIsFocused(false);

    // Ensure input becomes readonly after selection on all devices
    if (inputRef.current) {
      inputRef.current.readOnly = true;
      inputRef.current.blur(); // Remove focus after selection
      // Force value update for Android
      inputRef.current.value = displayValue;

      // Additional Android-specific handling
      if (isAndroid) {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.value = displayValue;
            inputRef.current.readOnly = true;
          }
        }, 50);
      }
    }
  };

  // Function to update airport popularity
  const updateAirportPopularity = async (airportId: string) => {
    if (!airportId) return;

    try {
      await axiosInstance.patch(`/airport/${airportId}/popularity`);
      console.log(`Updated popularity for airport ID: ${airportId}`);
    } catch (error) {
      console.error('Error updating airport popularity:', error);
      // Don't show error to user as this is a background operation
    }
  };

  const toggleExpand = (locationKey: string) => {
    setExpandedItems((prev) => {
      // Default to true when toggling to ensure visibility
      const newState = !prev[locationKey];
      return {
        ...prev,
        [locationKey]: newState,
      };
    });

    // Allow time for DOM to update, then ensure item is scrolled into view if needed
    setTimeout(() => {
      const locationElement = document.getElementById(
        `location-${locationKey}`
      );
      if (locationElement && dropdownRef.current) {
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const locationRect = locationElement.getBoundingClientRect();

        // Check if location is not fully visible in the dropdown
        if (locationRect.bottom > dropdownRect.bottom) {
          locationElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }
    }, 100);
  };

  const getLocationKey = (location: Location) => {
    return `${location.municipality}-${location.country}-${location.region}`;
  };

  // Helper function to detect mobile devices
  const isMobile = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  }, []);

  // Enhanced for mobile
  const focusInputField = React.useCallback(() => {
    // Clear selection first on mobile when clicking the container
    // This ensures the field clears on mobile like it does on web
    const hasSelectedAirport = !!selectedAirport;
    if (hasSelectedAirport && (isMobile || isIOS)) {
      setSelectedAirport(null);
      setSearchValue('');
      onChange({ code: '', name: '', city: '', country: '' });
      setShowDropdown(true);
      setIsFocused(true);
    }

    if (inputRef.current) {
      // Make input editable if it was readonly (clear readonly state)
      if (hasSelectedAirport) {
        inputRef.current.readOnly = false;
      }

      // Simplified focus handling to avoid scroll interference
      if (hasSelectedAirport && (isMobile || isIOS)) {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.readOnly = false;
            // Simple focus without aggressive manipulation
            inputRef.current.focus();
          }
        }, 100);
      } else {
        // Standard focus behavior
        inputRef.current.focus();
      }
    }
  }, [isIOS, isMobile, selectedAirport, onChange]);

  const handleFocus = () => {
    // Don't process focus if we're in the middle of selecting
    if (isSelecting) {
      return;
    }

    if (selectedAirport) {
      // Clear selection and allow typing
      setSelectedAirport(null);
      setSearchValue('');
      onChange({ code: '', name: '', city: '', country: '' });
      
      // Show popular airports immediately
      setLocationData(popularAirports as Location[]);
      const initialExpanded: Record<string, boolean> = {};
      (popularAirports as Location[]).forEach((location) => {
        const key = `${location.municipality}-${location.country}-${location.region}`;
        initialExpanded[key] = true;
      });
      setExpandedItems(initialExpanded);
      setShowDropdown(true);

      // Make input editable immediately
      if (inputRef.current) {
        inputRef.current.readOnly = false;

        // On mobile, ensure keyboard opens after clearing
        // Use a small delay to ensure DOM updates are complete
        if (isMobile || isIOS) {
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.readOnly = false;

              if (isIOS) {
                forceKeyboardOpen(inputRef.current);
              } else {
                // Re-focus to ensure keyboard opens on Android
                inputRef.current.focus();
                inputRef.current.click();
              }
            }
          }, 50);
        }
      }
    }
    setIsFocused(true);
    if (searchValue.trim().length >= 1 && !selectedAirport) {
      setShowDropdown(true);
    } else if (!selectedAirport) {
      // Show popular airports on focus if empty
      setLocationData(popularAirports as Location[]);
      const initialExpanded: Record<string, boolean> = {};
      (popularAirports as Location[]).forEach((location) => {
        const key = `${location.municipality}-${location.country}-${location.region}`;
        initialExpanded[key] = true;
      });
      setExpandedItems(initialExpanded);
      setShowDropdown(true);
    }
  };

  const handleClear = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent bubbling to input's parent
    }

    // Clear all states
    setSearchValue('');
    setSelectedAirport(null);
    setShowDropdown(false);
    onChange({ code: '', name: '', city: '', country: '' });

    // Immediately update input properties for Android compatibility
    if (inputRef.current) {
      inputRef.current.readOnly = false;
      inputRef.current.value = '';
    }

    // Simplified focus handling to avoid scroll interference
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.readOnly = false;
        inputRef.current.value = '';
        inputRef.current.focus();
      }
    }, 50);
  };

  // Handle clicks on the input when it's readonly (has selected airport)
  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedAirport) {
      // Clear selection and allow typing
      setSelectedAirport(null);
      setSearchValue('');
      onChange({ code: '', name: '', city: '', country: '' });
      setShowDropdown(false); // Start with dropdown closed
      setIsFocused(true);

      // Make input editable immediately for all devices
      if (inputRef.current) {
        inputRef.current.readOnly = false;
        inputRef.current.value = ''; // Force clear the value

        // Simplified mobile handling
        if (isMobile || isIOS) {
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.readOnly = false;
              inputRef.current.value = '';
              inputRef.current.focus();
            }
          }, 100);
        } else {
          // Desktop - standard focus
          inputRef.current.focus();
        }
      }
    } else {
      // No selection - just focus normally
      if (inputRef.current) {
        inputRef.current.readOnly = false;
        inputRef.current.focus();
      }
    }
  };

  // Allow searching again if user modifies the text after selection
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limit input to 50 characters
    const newValue = e.target.value.slice(0, 50);
    setSearchValue(newValue);

    // Show loading state immediately when typing
    if (newValue.trim() && !showDropdown) {
      setShowDropdown(true);
      setIsLoading(true);
    }

    // Since input is readonly when selected, this shouldn't happen,
    // but keeping as a safety check
    if (
      selectedAirport &&
      newValue !== `${selectedAirport.city} (${selectedAirport.code})`
    ) {
      setSelectedAirport(null);

      // Ensure input becomes editable immediately on mobile
      if (inputRef.current) {
        inputRef.current.readOnly = false;

        // Keep focus on the input to ensure keyboard stays visible
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 50);
      }
    }
  };

  return (
    <div className="w-full relative h-full" ref={containerRef}>
      <div
        className={cn(
          'flex flex-col w-full h-full',
          'md:px-4 md:py-2 px-2 py-1',
          !insideBorder && 'border border-gray-300 rounded-md transition-all',
          isFocused && !insideBorder ? 'border-gray-400 shadow-sm' : '',
          'min-h-[4.375rem]'
        )}
        onClick={(e) => {
          // Only focus if clicking directly on the container, not during scroll
          if (e.target === e.currentTarget) {
            focusInputField();
          }
        }}
      >
        <label
          htmlFor={`airport-search-${label}`}
          className="title-t4 text-background-on"
          onClick={(e) => {
            e.stopPropagation(); // Prevent double click handling
            focusInputField();
          }}
        >
          {label}
        </label>
        <div className="relative flex items-center w-full flex-grow">
          <input
            id={`airport-search-${label}`}
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            onFocus={handleFocus}
            // onClick={handleInputClick}
            onClick={(e) => {
              if (inputRef.current) {
                inputRef.current.readOnly = false;
                inputRef.current.focus();
              }
              handleInputClick(e);
            }}
            onTouchStart={() => {
              if (inputRef.current) {
                inputRef.current.readOnly = false;
              }
            }}
            onTouchEnd={(e) => {
              // Only handle if it's a tap, not a scroll
              const touch = e.changedTouches[0];
              if (touch && inputRef.current) {
                const rect = inputRef.current.getBoundingClientRect();
                const isWithinInput =
                  touch.clientX >= rect.left &&
                  touch.clientX <= rect.right &&
                  touch.clientY >= rect.top &&
                  touch.clientY <= rect.bottom;

                if (isWithinInput) {
                  inputRef.current.readOnly = false;
                  // Only focus if it's a direct tap on input
                  setTimeout(() => {
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }, 10);
                }
              }
            }}
            onBlur={(e) => {
              // Prevent blur if we're selecting
              if (isSelecting) {
                e.preventDefault();
                return;
              }

              // Use timeout to allow click events to register first
              setTimeout(() => {
                if (!isSelecting) {
                  setIsFocused(false);
                }
              }, 200);
            }}
            placeholder={placeholder}
            readOnly={!!selectedAirport}
            maxLength={50}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            className={cn(
              'w-full outline-none bg-transparent pr-12',
              'text-base',
              'py-1',
              'label-l1',
              selectedAirport
                ? 'label-l1 text-background-on cursor-pointer'
                : 'label-l1 text-neutral-dark'
            )}
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls={`airport-search-dropdown-${label}`}
          />
          {searchValue && (
            <button
              onClick={handleClear}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-primary hover:text-blue-700 bg-transparent rounded-full transition-colors flex items-center justify-center w-12 h-12"
              type="button"
              aria-label="Clear search"
            >
              <X
                size={20}
                className="w-5 h-5"
                strokeWidth={2.5}
              />
            </button>
          )}
        </div>
      </div>

      {showDropdown &&
        mounted &&
        (createPortal(
          <div
            ref={dropdownRef}
            id={`airport-search-dropdown-${label}`}
            className="overflow-y-auto bg-container border border-gray-200 rounded-md shadow-xl scrollbar-thin"
            style={{
              position: 'absolute',
              top: `${dropdownStyles.top}px`,
              left: `${dropdownStyles.left}px`,
              width: `${dropdownStyles.width}px`,
              maxHeight: `${dropdownStyles.maxHeight || 350}px`,
              zIndex: 9999,
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db transparent',
              overscrollBehavior: 'contain',
            }}
            role="listbox"
          >
            <style jsx global>{`
              #airport-search-dropdown-${label}::-webkit-scrollbar {
                width: 6px;
                height: 6px;
              }
              #airport-search-dropdown-${label}::-webkit-scrollbar-track {
                background: transparent;
                border-radius: 10px;
              }
              #airport-search-dropdown-${label}::-webkit-scrollbar-thumb {
                background: #d1d5db;
                border-radius: 10px;
              }
              #airport-search-dropdown-${label}::-webkit-scrollbar-thumb:hover {
                background: #9ca3af;
              }
              /* Ensure bottom items are visible */
              #airport-search-dropdown-${label} > div:last-child {
                padding-bottom: 8px;
              }
              /* Mobile optimizations */
              @media (max-width: 768px) {
                #airport-search-dropdown-${label} {
                  font-size: 0.875rem;
                  width: 300px !important;
                  left: 50% !important;
                  transform: translateX(-50%) !important;
                  border-radius: 8px;
                }
                #airport-search-dropdown-${label} .title-t4 {
                  font-size: 0.875rem;
                }
                #airport-search-dropdown-${label} .label-l1,
                #airport-search-dropdown-${label} .label-l2 {
                  font-size: 0.75rem;
                }
              }
            `}</style>
            <div className="py-2">
              {isLoading && (
                <div className="flex flex-col items-center justify-center p-4 py-8">
                  {/* <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" /> */}
                  <svg
                    className="animate-spin mr-2 h-4 w-4 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="label-l1 text-neutral-dark">
                    Searching airports...
                  </span>
                </div>
              )}

              {!isLoading && error && (
                <div className="p-4 text-sm text-red-500 bg-red-50 rounded-md mx-2">
                  {error}
                </div>
              )}

              {!isLoading &&
                !error &&
                locationData.length === 0 &&
                searchValue.trim() !== '' && (
                  <div className="p-4 label-l1 text-neutral-dark bg-gray-50 rounded-md mx-2">
                    No airports found. Try a different search term.
                  </div>
                )}

              {!isLoading && !error && locationData.length > 0 && (
                <div className="label-l2 text-neutral-dark px-4 pb-2 border-b border-gray-100">
                  Found {locationData.length} location(s) with matching airports
                </div>
              )}

              {!isLoading &&
                locationData.map(
                  (location: Location, locationIndex: number) => {
                    if (!location) return null;

                    // Even if municipality is missing, still display the location
                    const locationKey =
                      getLocationKey(location) || `location-${locationIndex}`;
                    const isExpanded = expandedItems[locationKey] !== false;
                    const hasAirports =
                      location.airports && location.airports.length > 0;

                    return (
                      <div
                        key={locationKey}
                        id={`location-${locationKey}`}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <div
                          className="flex items-center px-4 py-1 cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => toggleExpand(locationKey)}
                          role="button"
                          aria-expanded={isExpanded}
                        >
                          <div className="flex items-center w-full">
                            <MapPin className="mr-3 h-4 w-4 text-primary flex-shrink-0 md:h-4 md:w-4 h-3.5 w-3.5 md:mr-3 mr-1.5" />
                            <div className="flex flex-col w-full">
                              <div className="flex  items-center justify-between w-full gap-2">
                                <span className="label-l1  text-background-on">
                                  {location.municipality || 'Unknown Location'}
                                </span>
                                <span className="label-l3 text-background-on px-3 py-0.5 bg-gray-100 rounded-full md:px-3 md:py-0.5 px-2 py-0">
                                  {location.region || location.country || ''}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Always render the airports but conditionally hide them to prevent mounting/unmounting */}
                        <div
                          className={`pl-10 pr-4 bg-gray-50 pb-1 ${
                            isExpanded ? 'block' : 'hidden'
                          }`}
                          aria-hidden={!isExpanded}
                          data-airport-count={
                            hasAirports ? location.airports.length : 0
                          }
                        >
                          {hasAirports ? (
                            location.airports.map(
                              (airport: Airport, idx: number) => {
                                // Log each airport to debug
                                console.log(
                                  `Rendering airport: ${
                                    airport?.name || 'unknown'
                                  } (${airport?.iataCode || 'no code'})`
                                );

                                // Check if this airport is excluded
                                const isExcluded =
                                  excludeAirportCode &&
                                  airport.iataCode === excludeAirportCode;

                                return airport ? (
                                  <div
                                    key={
                                      airport.id ||
                                      airport.iataCode ||
                                      `airport-${idx}`
                                    }
                                    onMouseDown={(e) => {
                                      // Use mousedown instead of click for better mobile support
                                      if (airport.iataCode && !isExcluded) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSelect(airport);
                                      }
                                    }}
                                    className={cn(
                                      'flex items-center py-2 px-3 transition-colors my-1 rounded-md min-h-[3rem]',
                                      idx === location.airports.length - 1 &&
                                        'mb-2',
                                      !airport.iataCode &&
                                        'opacity-50 cursor-not-allowed',
                                      isExcluded
                                        ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                        : 'cursor-pointer hover:bg-blue-50 active:bg-blue-100'
                                    )}
                                    role="option"
                                    aria-selected={
                                      selectedAirport?.code === airport.iataCode
                                    }
                                    title={
                                      isExcluded
                                        ? 'This airport is already selected'
                                        : ''
                                    }
                                  >
                                    <span className="mr-3 flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex-shrink-0 md:w-6 md:h-6 w-5 h-5 md:mr-3 mr-2">
                                      <Plane className="h-3.5 w-3.5 text-primary md:h-3.5 md:w-3.5 h-3 w-3" />
                                    </span>

                                    <div className="flex flex-col items-center">
                                      <span className="label-l3 text-background-on">
                                        {airport.name || 'Unnamed Airport'}
                                        {airport.iataCode && (
                                          <span className="label-l3 text-background-on">
                                            {' '}
                                            ({airport.iataCode})
                                          </span>
                                        )}
                                      </span>
                                      {isExcluded && (
                                        <span className="text-xs text-red-500">
                                          Already selected as{' '}
                                          {excludeAirportCode ===
                                          airport.iataCode
                                            ? label === 'From'
                                              ? 'destination'
                                              : 'departure'
                                            : ''}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : null;
                              }
                            )
                          ) : (
                            <div className="py-2 text-sm text-gray-500">
                              No airports available for this location
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
            </div>
          </div>,
          document.body
        ) as React.ReactNode)}
    </div>
  );
}
