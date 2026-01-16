'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { AirportSearch } from './AirportSearch';
import { DateRangePicker } from './DateRangePicker';
import { PassengerSelector } from './PassengerSelector';
import { RecentSearches } from './RecentSearches';
import {
  Airport,
  PassengerCount,
  SearchFormData,
  SearchParams,
} from '../../types';

interface SearchWidgetProps {
  initialValues?: SearchFormData;
  onSubmit: (params: SearchParams) => void;
  compact?: boolean;
  defaultToRoundTrip?: boolean;
  showQuickSearches?: boolean;
}

// Define schema outside component for consistent type checking
const schema = yup.object().shape({
  fromAirport: yup
    .object()
    .shape({
      code: yup.string().required('Departure airport is required'),
      name: yup.string().required(),
      city: yup.string().required('City is required'),
      country: yup.string().required(),
    })
    .required('Please select departure airport')
    .nullable(),
  toAirport: yup
    .object()
    .shape({
      code: yup.string().required('Destination airport is required'),
      name: yup.string().required(),
      city: yup.string().required('City is required'),
      country: yup.string().required(),
    })
    .required('Please select destination airport')
    .nullable(),
  dateRange: yup
    .object()
    .shape({
      from: yup.date().nullable().required('Departure date is required'),
      to: yup.date().nullable(),
    })
    .required('Please select travel dates')
    .test(
      'valid-date-range',
      'Return date must be after departure date',
      function (dateRange) {
        const { from, to } = dateRange || {};
        const { tripType } = this.options.context || {};

        // Skip validation for one-way trips or if either date is missing
        if (tripType === 'one_way' || !from || !to) return true;

        // For round trips, validate that return is after departure
        return to > from;
      }
    ),
  passengerCount: yup
    .object()
    .shape({
      adults: yup.number().min(1, 'At least 1 adult is required').required(),
      children: yup.number().min(0).required(),
      infants: yup.number().min(0).required(),
    })
    .required('Please select passengers'),
  cabinClass: yup.string().required('Please select cabin class'),
  hasNepaleseCitizenship: yup
    .boolean()
    .required('Please select Nepalese citizenship'),
});

export function SearchWidget({
  initialValues,
  onSubmit: submitParams,
  compact = false,
  defaultToRoundTrip = true,
  showQuickSearches = false,
}: SearchWidgetProps) {
  const [submitting, setSubmitting] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    // Initialize with the currency from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCurrency') || 'AUD';
    }
    return 'AUD';
  });
  const [hasNepaleseCitizenship, setHasNepaleseCitizenship] = useState(
    initialValues?.hasNepaleseCitizenship || false
  );
  const [tripType, setTripType] = useState<'one_way' | 'round_trip' | 'multi_city'>(
    initialValues?.dateRange?.to
      ? 'round_trip'
      : defaultToRoundTrip
      ? 'round_trip'
      : 'one_way'
  );
  const [formErrors, setFormErrors] = useState<{ returnDate?: string }>({});

  // Refs for scrolling
  const fromAirportRef = useRef<HTMLDivElement>(null);
  const toAirportRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const passengerSelectorRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<SearchFormData>({
    resolver: yupResolver(schema as any),
    context: { tripType }, // Pass the tripType as context to the resolver
    defaultValues: {
      fromAirport: initialValues?.fromAirport,
      toAirport: initialValues?.toAirport,
      dateRange: initialValues?.dateRange || {
        from: null,
        to: null,
      },
      passengerCount: initialValues?.passengerCount || {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: initialValues?.cabinClass || 'ECONOMY',
      hasNepaleseCitizenship: initialValues?.hasNepaleseCitizenship || false,
    },
  });

  const formValues = watch();

  console.log({ errors });

  // Update form values when initialValues prop changes (e.g., when navigating between route pages)
  useEffect(() => {
    if (initialValues) {
      if (initialValues.fromAirport) {
        setValue('fromAirport', initialValues.fromAirport, {
          shouldValidate: false,
        });
      }
      if (initialValues.toAirport) {
        setValue('toAirport', initialValues.toAirport, {
          shouldValidate: false,
        });
      }
      if (initialValues.dateRange) {
        setValue('dateRange', initialValues.dateRange, {
          shouldValidate: false,
        });
      }
      if (initialValues.passengerCount) {
        setValue('passengerCount', initialValues.passengerCount, {
          shouldValidate: false,
        });
      }
      if (initialValues.cabinClass) {
        setValue('cabinClass', initialValues.cabinClass, {
          shouldValidate: false,
        });
      }
      if (initialValues.hasNepaleseCitizenship !== undefined) {
        setValue(
          'hasNepaleseCitizenship',
          initialValues.hasNepaleseCitizenship,
          {
            shouldValidate: false,
          }
        );
      }
    }
  }, [initialValues, setValue]);

  // Load saved airports from localStorage on component mount
  useEffect(() => {
    try {
      const savedAirports = localStorage.getItem('skytrips_airports');
      if (
        savedAirports &&
        (!initialValues?.fromAirport || !initialValues?.toAirport)
      ) {
        const airports = JSON.parse(savedAirports);
        if (airports.fromAirport && !initialValues?.fromAirport) {
          setValue('fromAirport', airports.fromAirport, {
            shouldValidate: false,
          });
        }
        if (airports.toAirport && !initialValues?.toAirport) {
          setValue('toAirport', airports.toAirport, { shouldValidate: false });
        }
      }
    } catch (error) {
      console.error('Error loading saved airports:', error);
    }
  }, [initialValues, setValue]);

  // Add useEffect to load currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Add effect to sync with currency changes
  useEffect(() => {
    const handleCurrencyChange = (event: CustomEvent) => {
      const newCurrency = event.detail.currency;
      setSelectedCurrency(newCurrency);
    };

    window.addEventListener(
      'currencyChange',
      handleCurrencyChange as EventListener
    );
    return () => {
      window.removeEventListener(
        'currencyChange',
        handleCurrencyChange as EventListener
      );
    };
  }, []);

  const handleFromAirportChange = (airport: Airport) => {
    // Check if the selected airport is the same as the toAirport
    const toAirport = formValues.toAirport;
    if (
      toAirport &&
      toAirport.code &&
      airport.code &&
      toAirport.code === airport.code
    ) {
      toast.error(
        `${airport.city} cannot be used for both departure and destination`
      );
      return; // Don't set the value if it's the same airport
    }

    // Force update with proper validation for Android compatibility
    setValue('fromAirport', airport, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // Force a small re-render to ensure Android displays the value
    setTimeout(() => {
      setValue('fromAirport', airport, { shouldValidate: false });
    }, 10);
  };

  const handleToAirportChange = (airport: Airport) => {
    // Check if the selected airport is the same as the fromAirport
    const fromAirport = formValues.fromAirport;
    if (
      fromAirport &&
      fromAirport.code &&
      airport.code &&
      fromAirport.code === airport.code
    ) {
      toast.error(
        `${airport.city} cannot be used for both departure and destination`
      );
      return; // Don't set the value if it's the same airport
    }

    // Force update with proper validation for Android compatibility
    setValue('toAirport', airport, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // Force a small re-render to ensure Android displays the value
    setTimeout(() => {
      setValue('toAirport', airport, { shouldValidate: false });
    }, 10);
  };

  const handleTripTypeSelect = (type: 'one_way' | 'round_trip' | 'multi_city') => {
    setTripType(type);
    
    // Update date picker logic
    if (type === 'one_way') {
      // Clear return date
      const currentRange = formValues.dateRange;
      if (currentRange.to) {
        setValue('dateRange', { ...currentRange, to: null }, { shouldValidate: true });
      }
      setFormErrors({});
    } else if (type === 'multi_city') {
      // For now, multi-city behaves like one-way in terms of the main date picker
      // or we could show a toast that it's coming soon
      toast.info('Multi-city search is coming soon!');
      // Revert to previous or just keep as is (UI will show selected)
      // But for form submission we need to handle it.
      // Let's just switch to one-way logic for the date picker for now
      const currentRange = formValues.dateRange;
      if (currentRange.to) {
        setValue('dateRange', { ...currentRange, to: null }, { shouldValidate: true });
      }
    }
  };

  const handleDateRangeChange = (range: {
    from: Date | null;
    to: Date | null;
  }) => {
    console.log('Date range change:', range);

    // No longer auto-setting return date - let user explicitly choose

    // First update the dateRange values
    setValue(
      'dateRange',
      {
        from: range.from,
        to: range.to,
      },
      { shouldValidate: false } // Don't validate yet
    );

    // Then update trip type based on whether there's a return date
    // Only update if we are not in multi-city mode (or handle multi-city logic)
    if (tripType !== 'multi_city') {
      const newTripType = range.to ? 'round_trip' : 'one_way';
      console.log('Setting trip type to:', newTripType);
      setTripType(newTripType);
      
      // Clear any custom error when switching to one-way
      if (newTripType === 'one_way') {
        setFormErrors({});
      }
    }

    // Now trigger validation
    setValue(
      'dateRange',
      {
        from: range.from,
        to: range.to,
      },
      { shouldValidate: true }
    );

    // Validate date selections and show toast errors
    if ((tripType === 'round_trip' || (tripType !== 'multi_city' && range.to)) && range.from && range.to) {
      if (range.to < range.from) {
        toast.error('Return date must be after departure date');
        setFormErrors({
          returnDate: 'Return date must be after departure date',
        });
      } else {
        setFormErrors({});
      }
    }
  };

  console.log({ tripType });

  const handlePassengerChange = (count: PassengerCount) => {
    setValue('passengerCount', count, { shouldValidate: true });
  };

  const handleCabinClassChange = (cabin: string) => {
    setValue('cabinClass', cabin, { shouldValidate: true });
  };

  const handleCitizenshipChange = (value: boolean) => {
    setHasNepaleseCitizenship(value);
    setValue('hasNepaleseCitizenship', value);
  };

  const handleSwapAirports = () => {
    // Create deep copies to avoid reference issues
    const fromAirport = formValues.fromAirport
      ? JSON.parse(JSON.stringify(formValues.fromAirport))
      : null;
    const toAirport = formValues.toAirport
      ? JSON.parse(JSON.stringify(formValues.toAirport))
      : null;

    // Helper function to check if an airport is valid (has non-empty values)
    const isValidAirport = (airport: Airport | null) =>
      airport &&
      airport.code &&
      airport.code.trim() !== '' &&
      airport.city &&
      airport.city.trim() !== '';

    const hasValidFromAirport = isValidAirport(fromAirport);
    const hasValidToAirport = isValidAirport(toAirport);

    // Check if both valid airports are selected
    if (hasValidFromAirport && hasValidToAirport) {
      // Set the values and force validation to update properly
      setValue('fromAirport', toAirport, { shouldValidate: false });
      setValue('toAirport', fromAirport, { shouldValidate: true });
    } else {
      // One or both airports are not selected
      toast.error(
        hasValidFromAirport
          ? 'Please select a destination airport to swap'
          : hasValidToAirport
          ? 'Please select a departure airport to swap'
          : 'Please select both departure and destination airports to swap'
      );
    }
  };

  const handleFormSubmit = async (data: SearchFormData) => {
    try {
      // Get the current currency from localStorage
      const currentCurrency = localStorage.getItem('selectedCurrency') || 'AUD';

      // Skip return date validation for one-way trips
      if (tripType === 'one_way' || tripType === 'multi_city') {
        setSubmitting(true);

        const searchParams: SearchParams = {
          originLocationCode: data.fromAirport?.code,
          destinationLocationCode: data.toAirport?.code,
          departureDate: data.dateRange.from
            ? format(data.dateRange.from, 'yyyy-MM-dd')
            : '',
          returnDate: '', // One-way trip has no return date
          adults: data.passengerCount.adults,
          children: data.passengerCount.children,
          infants: data.passengerCount.infants,
          travelClass: data.cabinClass,
          currencyCode: currentCurrency, // Use current currency from localStorage
          maxResults: 250,
          tripType: 'one_way', // Treat multi-city as one-way for now or handle appropriately
          originDestinations: [
            {
              id: 1,
              departureDateTimeRange: {
                date: data.dateRange.from
                  ? format(data.dateRange.from, 'yyyy-MM-dd')
                  : '',
              },
              originLocationCode: data.fromAirport?.code,
              destinationLocationCode: data.toAirport?.code,
            },
          ],
        };

        console.log('One-way/Multi-city search params:', searchParams);
        saveToRecentSearches(data);
        submitParams(searchParams);
      } else {
        // Normal flow for round trips
        setSubmitting(true);

        // Debug log to see what data we have for round trips
        console.log('Round trip data:', {
          fromAirport: data.fromAirport,
          toAirport: data.toAirport,
          dateRange: data.dateRange,
          departureDate: data.dateRange.from
            ? format(data.dateRange.from, 'yyyy-MM-dd')
            : 'missing',
          returnDate: data.dateRange.to
            ? format(data.dateRange.to, 'yyyy-MM-dd')
            : 'missing',
        });

        // Ensure we have a return date for round trips
        if (!data.dateRange.to) {
          setFormErrors({
            returnDate: 'Return date is required for round trips',
          });
          toast.error('Return date is required for round trips');
          setSubmitting(false);
          return;
        }

        const searchParams: SearchParams = {
          originLocationCode: data.fromAirport?.code,
          destinationLocationCode: data.toAirport?.code,
          departureDate: data.dateRange.from
            ? format(data.dateRange.from, 'yyyy-MM-dd')
            : '',
          returnDate: data.dateRange.to
            ? format(data.dateRange.to, 'yyyy-MM-dd')
            : '',
          adults: data.passengerCount.adults,
          children: data.passengerCount.children,
          infants: data.passengerCount.infants,
          travelClass: data.cabinClass,
          currencyCode: currentCurrency, // Use current currency from localStorage
          maxResults: 250,
          tripType: 'round_trip',
          originDestinations: [
            {
              id: 1,
              departureDateTimeRange: {
                date: data.dateRange.from
                  ? format(data.dateRange.from, 'yyyy-MM-dd')
                  : '',
              },
              originLocationCode: data.fromAirport?.code,
              destinationLocationCode: data.toAirport?.code,
            },
            {
              id: 2,
              departureDateTimeRange: {
                date: data.dateRange.to
                  ? format(data.dateRange.to, 'yyyy-MM-dd')
                  : '',
              },
              originLocationCode: data.toAirport?.code,
              destinationLocationCode: data.fromAirport?.code,
            },
          ],
        };

        console.log('Round trip search params:', searchParams);
        saveToRecentSearches(data);
        submitParams(searchParams);
      }
    } catch (error) {
      console.error('Error searching flights:', error);
      toast.error(
        'An error occurred while searching for flights. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Modify the form submission wrapper to handle validation conditionally
  const handleFormSubmission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log('Form submission, trip type:', tripType);

    // First check for airport validation
    if (
      !formValues.fromAirport ||
      !formValues.fromAirport.code ||
      formValues.fromAirport.code.trim() === ''
    ) {
      toast.error('Please select a departure airport');
      return;
    }

    if (
      !formValues.toAirport ||
      !formValues.toAirport.code ||
      formValues.toAirport.code.trim() === ''
    ) {
      toast.error('Please select a destination airport');
      return;
    }

    // Check if departure and destination airports are the same
    if (
      formValues.fromAirport &&
      formValues.toAirport &&
      formValues.fromAirport.code === formValues.toAirport.code
    ) {
      toast.error(
        `${formValues.fromAirport.city} cannot be used for both departure and destination`
      );
      return;
    }

    // Then check date validation
    if (!formValues.dateRange.from) {
      setFormErrors({ returnDate: 'Departure date is required' });
      toast.error('Please select a departure date');
      return;
    }

    // For round trips, add return date validation
    if (tripType === 'round_trip') {
      if (!formValues.dateRange.to) {
        setFormErrors({
          returnDate: 'Return date is required for round trips',
        });
        toast.error('Please select a return date');
        return;
      }

      if (
        formValues.dateRange.from &&
        formValues.dateRange.to &&
        formValues.dateRange.to < formValues.dateRange.from
      ) {
        setFormErrors({
          returnDate: 'Return date must be after departure date',
        });
        toast.error('Return date must be after departure date');
        return;
      }
    }

    // Clear any custom errors if validation passes
    setFormErrors({});

    // If all our custom validations pass, proceed with form validation and submission
    handleSubmit(
      (data) => {
        console.log('Form data passed validation:', data);
        handleFormSubmit(data);
      },
      (errors) => {
        // Handle any other validation errors not caught by our custom validation
        console.error('Validation errors:', errors);

        // Show first error if any remain
        const firstError = Object.entries(errors)[0];
        if (firstError) {
          const [field, error] = firstError;
          const errorMessage =
            typeof error === 'object' && error.message
              ? error.message
              : `Please check the ${field} field`;
          toast.error(errorMessage);
        }
      }
    )(event);
  };

  // Set default return date if none and tripType is round_trip
  useEffect(() => {
    const dateRange = watch('dateRange');
    if (tripType === 'round_trip' && dateRange?.from && !dateRange?.to) {
      // Default to 7 days after departure date
      const returnDate = new Date(dateRange.from);
      returnDate.setDate(returnDate.getDate() + 7);
      setValue(
        'dateRange',
        {
          from: dateRange.from,
          to: returnDate,
        },
        { shouldValidate: true }
      );
    }
  }, [tripType, watch, setValue]);

  // Ensure tripType stays in sync with dateRange.to - REMOVED to fix Round Trip selection issue
  // The previous useEffect here was forcing tripType back to 'one_way' if no return date was selected,
  // preventing the user from switching to Round Trip mode.

  // Prepare airport data for data attribute
  const airportDataString = JSON.stringify({
    fromAirport: formValues.fromAirport,
    toAirport: formValues.toAirport,
  });

  // Handle scroll to make dropdown visible (only when needed)
  const handleScroll = (element: HTMLElement) => {
    if (element) {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

      // Only scroll if element is not visible and user is not already scrolling
      if (!isVisible) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  // Set up event listeners for focusing and clicking on input fields
  useEffect(() => {
    const fromDiv = fromAirportRef.current;
    const toDiv = toAirportRef.current;
    const dateDiv = datePickerRef.current;
    const passengerDiv = passengerSelectorRef.current;

    // Generic handler to scroll when children of these divs receive focus (not on every click)
    const handleInteraction = (e: Event) => {
      // Only scroll on focus events, not on clicks to avoid interfering with normal scrolling
      if (e.type === 'focusin') {
        // Add a small delay to ensure it's an intentional focus, not from scrolling
        setTimeout(() => {
          handleScroll(e.currentTarget as HTMLElement);
        }, 200);
      }
    };

    // Add event listeners to all container divs (only focusin, not click)
    if (fromDiv) {
      fromDiv.addEventListener('focusin', handleInteraction);
    }

    if (toDiv) {
      toDiv.addEventListener('focusin', handleInteraction);
    }

    if (dateDiv) {
      dateDiv.addEventListener('focusin', handleInteraction);
    }

    if (passengerDiv) {
      passengerDiv.addEventListener('focusin', handleInteraction);
    }

    // Clean up event listeners
    return () => {
      if (fromDiv) {
        fromDiv.removeEventListener('focusin', handleInteraction);
      }

      if (toDiv) {
        toDiv.removeEventListener('focusin', handleInteraction);
      }

      if (dateDiv) {
        dateDiv.removeEventListener('focusin', handleInteraction);
      }

      if (passengerDiv) {
        passengerDiv.removeEventListener('focusin', handleInteraction);
      }
    };
  }, []);

  // Add useEffect to prevent zoom on mobile
  useEffect(() => {
    // Find existing viewport meta
    let viewportMeta = document.querySelector('meta[name="viewport"]');

    // If viewport meta doesn't exist, create one
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }

    // Store original content
    const originalContent =
      viewportMeta.getAttribute('content') ||
      'width=device-width, initial-scale=1';

    // Set content to prevent zooming
    viewportMeta.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
    );

    return () => {
      // Reset to original on unmount
      viewportMeta?.setAttribute('content', originalContent);
    };
  }, []);

  const clearRecentSearches = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('recent_searches');
    // Force a re-render by toggling submitting state
    setSubmitting((prev) => !prev);
  };

  const saveToRecentSearches = (data: SearchFormData) => {
    if (typeof window === 'undefined') return;

    const newSearch = {
      id: Date.now().toString(),
      fromAirport: {
        code: data.fromAirport?.code || '',
        city: data.fromAirport?.city || '',
        name: data.fromAirport?.name || '',
        country: data.fromAirport?.country || '',
      },
      toAirport: {
        code: data.toAirport?.code || '',
        city: data.toAirport?.city || '',
        name: data.toAirport?.name || '',
        country: data.toAirport?.country || '',
      },
      date: data.dateRange.from
        ? format(data.dateRange.from, 'yyyy-MM-dd')
        : '',
      returnDate: data.dateRange.to
        ? format(data.dateRange.to, 'yyyy-MM-dd')
        : '',
      passengers:
        data.passengerCount.adults +
        data.passengerCount.children +
        data.passengerCount.infants,
      tripType: data.dateRange.to ? 'round_trip' : 'one_way',
      cabinClass: data.cabinClass,
    };

    const existingSearches = localStorage.getItem('recent_searches');
    const searches = existingSearches ? JSON.parse(existingSearches) : [];

    // Add new search to the beginning and limit to 6 items
    const updatedSearches = [newSearch, ...searches.slice(0, 5)];
    localStorage.setItem('recent_searches', JSON.stringify(updatedSearches));
  };

  const handleRecentSearch = (params: SearchParams) => {
    if (params.originLocationCode && params.destinationLocationCode) {
      setValue(
        'fromAirport',
        params.fromAirport || {
          code: params.originLocationCode,
          city: params.originLocationCode,
          name: params.originLocationCode,
          country: 'Unknown',
        }
      );
      setValue(
        'toAirport',
        params.toAirport || {
          code: params.destinationLocationCode,
          city: params.destinationLocationCode,
          name: params.destinationLocationCode,
          country: 'Unknown',
        }
      );

      setValue('dateRange', {
        from: params.departureDate ? new Date(params.departureDate) : null,
        to: params.returnDate ? new Date(params.returnDate) : null,
      });
      setValue('passengerCount', {
        adults: params.adults || 1,
        children: params.children || 0,
        infants: params.infants || 0,
      });
      setValue('cabinClass', params.travelClass || 'ECONOMY');
      setTripType(params.tripType === 'round_trip' ? 'round_trip' : 'one_way');
      // Submit the search
      submitParams(params);
    }
  };

  return (
    <>
      <form
        onSubmit={handleFormSubmission}
        data-airport-data={airportDataString}
        className="w-full"
      >
        <div
          className={`mx-auto bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
            compact ? 'max-w-5xl' : 'max-w-7xl'
          }`}
        >
          {/* Trip Type Selector */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 px-4 sm:px-6 pt-5 pb-3 sm:pb-1 border-b border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer group min-h-[48px]">
              <input
                type="radio"
                name="tripTypeSelector"
                checked={tripType === 'one_way'}
                onChange={() => handleTripTypeSelect('one_way')}
                className="w-5 h-5 accent-primary cursor-pointer focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
              <span className={`text-base sm:text-sm font-medium transition-colors ${tripType === 'one_way' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                One-way
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group min-h-[48px]">
              <input
                type="radio"
                name="tripTypeSelector"
                checked={tripType === 'round_trip'}
                onChange={() => handleTripTypeSelect('round_trip')}
                className="w-5 h-5 accent-primary cursor-pointer focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
              <span className={`text-base sm:text-sm font-medium transition-colors ${tripType === 'round_trip' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                Round-trip
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group min-h-[48px]">
              <input
                type="radio"
                name="tripTypeSelector"
                checked={tripType === 'multi_city'}
                onChange={() => handleTripTypeSelect('multi_city')}
                className="w-5 h-5 accent-primary cursor-pointer focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
              <span className={`text-base sm:text-sm font-medium transition-colors ${tripType === 'multi_city' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                Multi-city
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 p-2 sm:p-4">
            {/* From/To Section - Mobile: Full, LG: 5/12 columns */}
            <div className="col-span-1 lg:col-span-5 p-2">
              <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-0 relative">
                  {/* From Airport */}
                  <div
                    className="relative min-h-[72px]"
                    ref={fromAirportRef}
                  >
                    <AirportSearch
                      key={`from-${formValues.fromAirport?.code || 'empty'}`}
                      label="From"
                      placeholder="Leaving from?"
                      onChange={handleFromAirportChange}
                      insideBorder={true}
                      value={formValues.fromAirport}
                      excludeAirportCode={formValues.toAirport?.code}
                    />
                  </div>

                  {/* Swap Button - Desktop/Tablet */}
                  <div className="hidden sm:flex items-center justify-center bg-white z-10 w-[60px] relative">
                    <div className="absolute inset-y-2 left-0 w-px bg-gray-200"></div>
                    <div className="absolute inset-y-2 right-0 w-px bg-gray-200"></div>
                    <button
                      type="button"
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 border border-gray-200 shadow-sm transition-transform hover:rotate-180 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                      onClick={handleSwapAirports}
                      aria-label="Swap airports"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.5 9L4.5 6L7.5 3"
                          stroke="#737373"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M19.5 6H4.5"
                          stroke="#737373"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16.5 15L19.5 18L16.5 21"
                          stroke="#737373"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4.5 18H19.5"
                          stroke="#737373"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Mobile divider and swap button */}
                  <div className="sm:hidden flex items-center justify-center relative py-0 h-0 z-20">
                    <div className="absolute left-4 right-4 border-t border-gray-200"></div>
                    <button
                      type="button"
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 border border-gray-200 shadow-sm absolute top-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-primary"
                      onClick={handleSwapAirports}
                      aria-label="Swap airports"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="transform rotate-90"
                      >
                         <path
                          d="M7.5 9L4.5 6L7.5 3"
                          stroke="#737373"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M19.5 6H4.5"
                          stroke="#737373"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16.5 15L19.5 18L16.5 21"
                          stroke="#737373"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4.5 18H19.5"
                          stroke="#737373"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* To Airport */}
                  <div
                    className="relative min-h-[72px]"
                    ref={toAirportRef}
                  >
                    <AirportSearch
                      key={`to-${formValues.toAirport?.code || 'empty'}`}
                      label="To"
                      placeholder="Going to?"
                      onChange={handleToAirportChange}
                      insideBorder={true}
                      value={formValues.toAirport}
                      excludeAirportCode={formValues.fromAirport?.code}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date Range Picker - Mobile: Full, LG: 4/12 columns */}
            <div
              className="col-span-1 lg:col-span-4 p-2"
              ref={datePickerRef}
            >
              <div className="h-full">
                <DateRangePicker
                  initialDateRange={{
                    from: formValues.dateRange.from || null,
                    to: formValues.dateRange.to || null,
                  }}
                  onChange={handleDateRangeChange}
                  defaultToRoundTrip={defaultToRoundTrip}
                  tripType={tripType === 'round_trip' ? 'round' : 'one-way'}
                  onTripTypeChange={(type) => {
                     if (type === 'round') handleTripTypeSelect('round_trip');
                     else handleTripTypeSelect('one_way');
                  }}
                />
              </div>
            </div>

            {/* Passengers Section - Mobile: Full, LG: 3/12 columns */}
            <div className="col-span-1 lg:col-span-3 p-2" ref={passengerSelectorRef}>
              <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm h-full min-h-[72px]">
                <PassengerSelector
                  initialCount={formValues.passengerCount}
                  onChange={handlePassengerChange}
                  cabinClass={formValues.cabinClass}
                  onCabinClassChange={handleCabinClassChange}
                  insideBorder={true}
                  hasNepaleseCitizenship={formValues.hasNepaleseCitizenship}
                  onNepaleseCitizenshipChange={handleCitizenshipChange}
                />
              </div>
            </div>
          </div>

          {/* Check Prices Button and Recent Searches */}
          <div className="px-4 pb-4 sm:px-6 sm:pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
             <div className="flex-1 order-2 md:order-1 overflow-hidden">
              {showQuickSearches && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient-right">
                  <RecentSearches
                    onSearchClick={handleRecentSearch}
                    onClearAll={clearRecentSearches}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end order-1 md:order-2 w-full md:w-auto">
              <Button
                type="submit"
                className="w-full md:w-auto bg-primary hover:bg-primary-variant text-primary-on px-8 py-6 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="animate-spin mr-2 h-5 w-5" />
                    Searching...
                  </>
                ) : (
                  'Check Prices'
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );

}
