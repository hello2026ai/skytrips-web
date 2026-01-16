import moment from 'moment';
import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useLazyQuery } from '@apollo/client';
import { toast } from 'sonner';
import { HiOutlineInformationCircle } from 'react-icons/hi2';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { CREATE_INQUIRY } from '../../../lib/graphqlQueries/inquiry';
import axiosInstance from '../../../lib/axiosConfig';
import { NextSeo } from 'next-seo';
// Declare global dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}

import { CustomTextField } from '../../components/ui/CustomTextField';

const InquiryForm = () => {
  // Custom styles for iOS date inputs
  React.useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    // Add basic CSS rules for date inputs
    style.textContent = `
      input[type="date"] {
        appearance: none;
        -webkit-appearance: none;
        color: #000;
        font-size: inherit;
        font-family: inherit;
        position: relative;
      }
      input[type="date"]::-webkit-calendar-picker-indicator {
        cursor: pointer;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background: transparent;
        color: transparent;
        z-index: 1;
      }
    `;
    // Append to document head
    document.head.appendChild(style);

    // Clean up when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Define validation schema
  const validationSchema = yup.object().shape({
    tripType: yup.string().required('Trip type is required'),
    fromAirport: yup.object().nullable().required('From is required'),
    toAirport: yup.object().nullable().required('To is required'),
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup
      .string()
      .email('Enter valid email')
      .required('Email is required'),
    phone: yup.string().required('Phone number is required'),
    className: yup.string().required('Class is required'),
    adult: yup.number().required('Number of adult is required'),
    dateFlexibility: yup.string().required('Date flexibility is required'),
    departure: yup
      .string()
      .required('Please select a departure date')
      .transform((value) => {
        // Handle empty values consistently
        if (value === '' || value === null || value === undefined) return null;
        // Return the original value for validation
        return value;
      })
      .test(
        'is-valid-date',
        'Please select a valid departure date',
        (value) => {
          if (!value) return false;
          // Try to create a valid date object
          const date = new Date(value);
          return !isNaN(date.getTime());
        }
      )
      .test(
        'not-past-date',
        'Departure date cannot be in the past',
        (value) => {
          if (!value) return true; // Skip this validation if no date is provided
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const date = new Date(value);
          return date >= today;
        }
      ),
    return: yup
      .string()
      .nullable()
      .transform((value) => {
        // Handle empty values consistently
        if (value === '' || value === null || value === undefined) return null;
        // Return the original value for validation
        return value;
      })
      .when('tripType', {
        is: 'roundTrip',
        then: (schema) =>
          schema
            .required('Please select a return date')
            .test(
              'is-valid-date',
              'Please select a valid return date',
              (value) => {
                if (!value) return false;
                // Try to create a valid date object
                const date = new Date(value);
                return !isNaN(date.getTime());
              }
            )
            .test(
              'not-past-date',
              'Return date cannot be in the past',
              (value) => {
                if (!value) return true; // Skip this validation if no date is provided
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const date = new Date(value);
                return date >= today;
              }
            )
            .test(
              'after-departure',
              'Return date must be after departure date',
              function (value) {
                const { departure } = this.parent;
                if (!value || !departure) return true; // Skip if either date is not provided
                const departureDate = new Date(departure);
                const returnDate = new Date(value);
                return returnDate >= departureDate;
              }
            ),
      }),
    children: yup.number().optional(),
    infant: yup.number().optional(),
  });

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      tripType: 'roundTrip',
      dateFlexibility: 'false',
      fromAirport: undefined,
      toAirport: undefined,
      adult: 1,
      className: 'ECONOMY',
      children: 0,
      infant: 0,
    },
  });

  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [selectedPhoneCode, setSelectedPhoneCode] = useState('+61');
  const [formValues, setFormValues] = useState({
    fromAirport: { code: '', name: '', city: '', country: '' },
    toAirport: { code: '', name: '', city: '', country: '' },
    dateRange: {
      from: null as Date | null,
      to: null as Date | null,
    },
  });
  const [fromSearchText, setFromSearchText] = useState('');
  const [toSearchText, setToSearchText] = useState('');
  const [fromResults, setFromResults] = useState<any[]>([]);
  const [toResults, setToResults] = useState<any[]>([]);
  const [isLoadingFrom, setIsLoadingFrom] = useState(false);
  const [isLoadingTo, setIsLoadingTo] = useState(false);
  const [showFromResults, setShowFromResults] = useState(false);
  const [showToResults, setShowToResults] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Create refs for date inputs to control their behavior
  const departureInputRef = useRef<HTMLInputElement>(null);
  const returnInputRef = useRef<HTMLInputElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setShowFromResults(false);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setShowToResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchAirports = async (query: string, isFrom: boolean) => {
    if (query.length < 2) {
      isFrom ? setFromResults([]) : setToResults([]);
      isFrom ? setShowFromResults(false) : setShowToResults(false);
      return;
    }

    // Check if we already have a selected airport
    const selectedAirport = isFrom
      ? formValues.fromAirport.code
      : formValues.toAirport.code;
    if (
      selectedAirport &&
      ((isFrom &&
        query ===
          `${formValues.fromAirport.city} (${formValues.fromAirport.code})`) ||
        (!isFrom &&
          query ===
            `${formValues.toAirport.city} (${formValues.toAirport.code})`))
    ) {
      // Don't search if we already have a selection and the query matches the selection
      return;
    }

    try {
      isFrom ? setIsLoadingFrom(true) : setIsLoadingTo(true);
      const response = await axiosInstance.get(
        `/airport?symbol=${encodeURIComponent(query)}`
      );

      // Process and flatten the results
      let airports: any[] = [];
      if (response.data && response.data.data) {
        response.data.data.forEach((location: any) => {
          if (location.airports && location.airports.length > 0) {
            location.airports.forEach((airport: any) => {
              if (airport.iataCode) {
                airports.push({
                  code: airport.iataCode,
                  name: airport.name || '',
                  city: location.municipality || airport.municipality || '',
                  country: location.country || airport.isoCountry || '',
                  airportId: airport.id,
                });
              }
            });
          }
        });
      }

      // Update the appropriate state
      if (isFrom) {
        setFromResults(airports);
        setShowFromResults(true);
      } else {
        setToResults(airports);
        setShowToResults(true);
      }
    } catch (error) {
      console.error('Error searching airports:', error);
    } finally {
      isFrom ? setIsLoadingFrom(false) : setIsLoadingTo(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchAirports(fromSearchText, true);
    }, 300);
    return () => clearTimeout(timer);
  }, [fromSearchText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchAirports(toSearchText, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [toSearchText]);

  const handleFromAirportChange = (value: string) => {
    setFromSearchText(value);
    // If this is the first typed character, show the loading state
    if (value.length === 1) {
      setIsLoadingFrom(true);
      setShowFromResults(true);
    }
    // If the input doesn't match the selected airport, clear the selection
    if (
      formValues.fromAirport.code &&
      value !==
        `${formValues.fromAirport.city} (${formValues.fromAirport.code})`
    ) {
      setFormValues((prev) => ({
        ...prev,
        fromAirport: { code: '', name: '', city: '', country: '' },
      }));
    }
  };

  const handleToAirportChange = (value: string) => {
    setToSearchText(value);
    // If this is the first typed character, show the loading state
    if (value.length === 1) {
      setIsLoadingTo(true);
      setShowToResults(true);
    }
    // If the input doesn't match the selected airport, clear the selection
    if (
      formValues.toAirport.code &&
      value !== `${formValues.toAirport.city} (${formValues.toAirport.code})`
    ) {
      setFormValues((prev) => ({
        ...prev,
        toAirport: { code: '', name: '', city: '', country: '' },
      }));
    }
  };

  const selectAirport = (airport: any, type: string) => {
    if (type === 'from') {
      setFromSearchText(`${airport.city} (${airport.code})`);
      setShowFromResults(false);
      updateAirportPopularity(airport.airportId);
      setFormValues({
        ...formValues,
        fromAirport: {
          ...airport,
          type: 'from',
        },
      });
      setValue('fromAirport', airport, { shouldValidate: true });
    } else {
      setToSearchText(`${airport.city} (${airport.code})`);
      setShowToResults(false);
      updateAirportPopularity(airport.airportId);
      setFormValues({
        ...formValues,
        toAirport: {
          ...airport,
          type: 'to',
        },
      });
      setValue('toAirport', airport, { shouldValidate: true });
    }
  };

  // Function to update airport popularity
  const updateAirportPopularity = async (airportId: string) => {
    if (!airportId) return;
    try {
      await axiosInstance.patch(`/airport/${airportId}/popularity`);
    } catch (error) {
      console.error('Error updating airport popularity:', error);
    }
  };

  const clearAirport = (type: string) => {
    if (type === 'from') {
      setFromSearchText('');
      setFormValues({
        ...formValues,
        fromAirport: {
          code: '',
          name: '',
          city: '',
          country: '',
        },
      });
      setValue('fromAirport', '');
    } else {
      setToSearchText('');
      setFormValues({
        ...formValues,
        toAirport: {
          code: '',
          name: '',
          city: '',
          country: '',
        },
      });
      setValue('toAirport', '');
    }
  };

  const [createInquiry, { loading, data, error }] =
    useLazyQuery(CREATE_INQUIRY);

  // Fix selectedOption.phone error
  useEffect(() => {
    if (selectedOption && selectedOption.phone) {
      setSelectedPhoneCode(selectedOption.phone[0]);
    }
  }, [selectedOption]);

  const selectedTripType = watch('tripType');
  const departure = watch('departure');
  const returnDate = watch('return');

  // Add this effect to sync the departure/return date with formValues.dateRange
  useEffect(() => {
    if (departure) {
      try {
        setFormValues((prev) => ({
          ...prev,
          dateRange: {
            ...prev.dateRange,
            from: new Date(departure),
          },
        }));
      } catch (error) {
        console.error('Invalid departure date format:', error);
      }
    }
  }, [departure]);

  useEffect(() => {
    if (returnDate && selectedTripType === 'roundTrip') {
      try {
        setFormValues((prev) => ({
          ...prev,
          dateRange: {
            ...prev.dateRange,
            to: new Date(returnDate),
          },
        }));
      } catch (error) {
        console.error('Invalid return date format:', error);
      }
    }
  }, [returnDate, selectedTripType]);

  // Remove the complex iOS date picker code and simplify
  React.useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    // Add basic CSS rules for date inputs
    style.textContent = `
      input[type="date"] {
        appearance: none;
        -webkit-appearance: none;
        color: #000;
        font-size: inherit;
        font-family: inherit;
        position: relative;
      }
      input[type="date"]::-webkit-calendar-picker-indicator {
        cursor: pointer;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background: transparent;
        color: transparent;
        z-index: 1;
      }
    `;
    // Append to document head
    document.head.appendChild(style);

    // Clean up when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Remove the complex iOS handlers
  useEffect(() => {
    // Detect if the device is iOS - improved detection
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (isIOS) {
      // Add a class to help style date inputs on iOS
      const dateInputs = document.querySelectorAll('input[type="date"]');
      dateInputs.forEach((input) => {
        input.classList.add('ios-date-input');
      });
    }
  }, []);

  const onSubmit = async (formData: any, e?: React.BaseSyntheticEvent) => {
    // Prevent default form submission behavior
    if (e) {
      e.preventDefault();
    }

    console.log('formData submitted', formData);
    const originCity = formValues.fromAirport.code;
    const destinationCity = formValues.toAirport.code;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      const variables: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        isDateFlexible: formData.dateFlexibility === 'true' ? true : false,
        email: formData.email,
        phone: selectedPhoneCode + formData.phone,
        travelClass: formData.className,
        phoneCountryCode: selectedPhoneCode,
        timeZone,
        originLocation: formData.fromAirport?.code || originCity,
        destinationLocation: formData.toAirport?.code || destinationCity,
        departureDate: formData.departure
          ? moment(formData.departure).format('YYYY-MM-DD')
          : moment().format('YYYY-MM-DD'),
        tripType: formData.tripType === 'roundTrip' ? 'ROUND_TRIP' : 'ONE_WAY',
        adults: Number(formData.adult),
        children: Number(formData.children || 0),
        infants: Number(formData.infant || 0),
      };

      if (formData.return && formData.tripType === 'roundTrip') {
        variables.returnDate = moment(formData.return).format('YYYY-MM-DD');
      }

      await createInquiry({
        variables,
        fetchPolicy: 'network-only',
      });
    } catch (err) {
      toast.error(String(err));
    }
  };

  useEffect(() => {
    if (data) {
      // Check if response indicates a new user
      if (
        data?.createFlightInquiry?.userType === 'NEW' &&
        process.env.NEXT_PUBLIC_APP_ENV === 'production'
      ) {
        // Initialize dataLayer if it doesn't exist
        window.dataLayer = window.dataLayer || [];
        // Push inquiry event data
        window.dataLayer.push({
          event: 'inquiry_submission',
          userType: 'NEW',
          formType: 'inquiry',
          status: 'success',
        });
      }

      toast.success('Inquiry has been successfully created.');

      // Reset form data
      reset({
        tripType: 'roundTrip',
        dateFlexibility: 'false',
        fromAirport: undefined,
        toAirport: undefined,
        adult: 1,
        className: 'ECONOMY',
        children: 0,
        infant: 0,
        departure: '',
        return: '',
      });

      // Explicitly clear date input values
      if (departureInputRef.current) {
        departureInputRef.current.value = '';
      }
      if (returnInputRef.current) {
        returnInputRef.current.value = '';
      }

      // Clear custom form values
      setFromSearchText('');
      setToSearchText('');
      setFormValues({
        fromAirport: { code: '', name: '', city: '', country: '' },
        toAirport: { code: '', name: '', city: '', country: '' },
        dateRange: {
          from: null,
          to: null,
        },
      });

      // Clear results
      setFromResults([]);
      setToResults([]);
      setShowFromResults(false);
      setShowToResults(false);
    }
  }, [data, reset]);

  // Remove the iOS-specific form submission handlers and complex date picker logic
  const safeHandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  // Structured data for inquiry page
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Flight Inquiry',
    description:
      'Submit a flight inquiry to get personalized quotes and deals from SkyTrips.',
    url: 'https://skytrips.com.au/inquiry',
    mainEntity: {
      '@type': 'Service',
      name: 'Flight Inquiry Service',
      description: 'Get custom flight quotes and deals from our travel experts',
      provider: {
        '@type': 'TravelAgency',
        name: 'SkyTrips',
        url: 'https://skytrips.com.au',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+61-240720886',
          contactType: 'Customer Service',
          email: 'info@skytrips.com.au',
        },
      },
      areaServed: 'Worldwide',
    },
  };

  return (
    <>
      <NextSeo
        title="Book Cheapest International Flights – Save Big on Your Next Trip!"
        description="Book the cheapest international flights effortlessly with SkyTrips! Find unbeatable deals and save big on your next adventure."
        canonical="https://skytrips.com.au/inquiry"
        openGraph={{
          url: 'https://skytrips.com.au/inquiry',
          title:
            'Book Cheapest International Flights – Save Big on Your Next Trip!',
          description:
            'Book the cheapest international flights effortlessly with SkyTrips! Find unbeatable deals and save big on your next adventure.',
          images: [
            {
              url: 'https://skytrips.com.au/assets/og/skytrips-og.png',
              width: 1200,
              height: 630,
              alt: 'SkyTrips',
            },
          ],
          site_name: 'SkyTrips',
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Navbar />
      <div className="bg-gray-50">
        <div
          className="relative bg-cover bg-center pb-4"
          style={{
            backgroundImage:
              'url("/assets/images/bg/inquiry-background-min.webp")',
          }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-center pt-4 md:pt-6 text-2xl md:text-3xl font-bold text-primary">
              Best Deals and Rates <br />
              Fly Nepal, Save BIG!
            </h2>

            <div className="mt-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 md:p-6 mx-auto max-w-4xl border border-blue-100 relative">
              {/* Decorative elements */}
              <div className="absolute -top-2 right-10 w-24 h-24 bg-blue-300 rounded-full opacity-10 blur-2xl"></div>
              <div className="absolute bottom-10 -left-5 w-24 h-24 bg-indigo-300 rounded-full opacity-10 blur-2xl"></div>

              <div className="relative">
                <div className="flex items-center mb-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-primary">
                    Inquiry Form
                  </h3>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent mb-6"></div>

                <form onSubmit={safeHandleSubmit}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trip Type <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center space-x-6">
                        <label className="inline-flex items-center cursor-pointer group">
                          <div className="relative w-5 h-5">
                            <input
                              type="radio"
                              {...register('tripType')}
                              value="roundTrip"
                              className="sr-only"
                            />
                            <div className="absolute inset-0 border-2 border-gray-300 group-hover:border-blue-500 rounded-full transition-colors"></div>
                            {watch('tripType') === 'roundTrip' && (
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <span className="ml-2 text-gray-700 group-hover:text-blue-700 transition-colors">
                            Round Trip
                          </span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer group">
                          <div className="relative w-5 h-5">
                            <input
                              type="radio"
                              {...register('tripType')}
                              value="oneWay"
                              className="sr-only"
                            />
                            <div className="absolute inset-0 border-2 border-gray-300 group-hover:border-blue-500 rounded-full transition-colors"></div>
                            {watch('tripType') === 'oneWay' && (
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <span className="ml-2 text-gray-700 group-hover:text-blue-700 transition-colors">
                            One Way Trip
                          </span>
                        </label>
                      </div>
                      {errors.tripType && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.tripType.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1" ref={fromRef}>
                      <label className="block text-sm font-medium text-gray-700">
                        From <span className="text-red-500">*</span>
                      </label>
                      <div className="relative date-input-container">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Leaving from?"
                          className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-10 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                          value={fromSearchText}
                          onChange={(e) =>
                            handleFromAirportChange(e.target.value)
                          }
                          onFocus={() => {
                            if (fromSearchText.length > 0) {
                              setShowFromResults(true);
                              if (fromResults.length === 0) {
                                setIsLoadingFrom(true);
                              }
                            }
                          }}
                          autoComplete="off"
                        />
                        {fromSearchText && (
                          <button
                            onClick={() => clearAirport('from')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            type="button"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}

                        {/* Dropdown for search results */}
                        {showFromResults && (
                          <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                            {isLoadingFrom ? (
                              <div className="py-2 px-3 text-sm text-gray-500 flex items-center">
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
                                Searching airports...
                              </div>
                            ) : fromResults.length === 0 ? (
                              <div className="py-2 px-3 text-sm text-gray-500">
                                No airports found
                              </div>
                            ) : (
                              <div>
                                <div className="py-1 px-3 text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
                                  Found {fromResults.length} airport(s)
                                </div>
                                {fromResults.map((airport, index) => (
                                  <div
                                    key={`from-${airport.code}-${index}`}
                                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center border-b border-gray-100 last:border-0"
                                    onClick={() =>
                                      selectAirport(airport, 'from')
                                    }
                                  >
                                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3.5 w-3.5 text-blue-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                        />
                                      </svg>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-800">
                                        {airport.name || 'Airport'} (
                                        {airport.code})
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {airport.city}
                                        {airport.country
                                          ? `, ${airport.country}`
                                          : ''}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {errors.fromAirport && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.fromAirport.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1" ref={toRef}>
                      <label className="block text-sm font-medium text-gray-700">
                        To <span className="text-red-500">*</span>
                      </label>
                      <div className="relative date-input-container">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Going to?"
                          className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-10 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                          value={toSearchText}
                          onChange={(e) =>
                            handleToAirportChange(e.target.value)
                          }
                          onFocus={() => {
                            if (toSearchText.length > 0) {
                              setShowToResults(true);
                            }
                          }}
                          autoComplete="off"
                        />
                        {toSearchText && (
                          <button
                            onClick={() => clearAirport('to')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            type="button"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}

                        {/* Dropdown for search results */}
                        {showToResults && (
                          <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                            {isLoadingTo ? (
                              <div className="py-2 px-3 text-sm text-gray-500 flex items-center">
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
                                Searching airports...
                              </div>
                            ) : toResults.length === 0 ? (
                              <div className="py-2 px-3 text-sm text-gray-500">
                                No airports found
                              </div>
                            ) : (
                              <div>
                                <div className="py-1 px-3 text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
                                  Found {toResults.length} airport(s)
                                </div>
                                {toResults.map((airport, index) => (
                                  <div
                                    key={`to-${airport.code}-${index}`}
                                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center border-b border-gray-100 last:border-0"
                                    onClick={() => selectAirport(airport, 'to')}
                                  >
                                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3.5 w-3.5 text-blue-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                        />
                                      </svg>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-800">
                                        {airport.name || 'Airport'} (
                                        {airport.code})
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {airport.city}
                                        {airport.country
                                          ? `, ${airport.country}`
                                          : ''}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {errors.toAirport && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.toAirport.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Departure <span className="text-red-500">*</span>
                      </label>
                      <div className="relative date-input-container">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <input
                          type="date"
                          className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-8 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                          min={moment().format('YYYY-MM-DD')}
                          placeholder="Select departure date"
                          {...register('departure')}
                          ref={departureInputRef}
                          onChange={(e) => {
                            if (e.target.value) {
                              const dateValue = e.target.value;
                              setValue('departure', dateValue, {
                                shouldValidate: true,
                              });
                            }
                          }}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none date-arrow">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                      {errors.departure && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.departure.message}
                        </p>
                      )}
                    </div>

                    {selectedTripType === 'roundTrip' && (
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Return
                        </label>
                        <div className="relative date-input-container">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <input
                            type="date"
                            className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-8 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            min={
                              departure
                                ? moment(departure).format('YYYY-MM-DD')
                                : moment().format('YYYY-MM-DD')
                            }
                            placeholder="Select return date"
                            {...register('return')}
                            ref={returnInputRef}
                            onChange={(e) => {
                              if (e.target.value) {
                                const dateValue = e.target.value;
                                setValue('return', dateValue, {
                                  shouldValidate: true,
                                });
                              }
                            }}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none date-arrow">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                        {errors?.return && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.return.message}
                          </p>
                        )}
                      </div>
                    )}

                    {departure && (
                      <div className="lg:col-span-2">
                        <div className="flex items-center">
                          <label className="inline-flex items-center cursor-pointer group">
                            <div className="relative flex items-center">
                              <input
                                type="checkbox"
                                {...register('dateFlexibility')}
                                checked={watch('dateFlexibility') === 'true'}
                                onChange={(e) => {
                                  setValue(
                                    'dateFlexibility',
                                    e.target.checked ? 'true' : 'false',
                                    { shouldValidate: true }
                                  );
                                }}
                                className="sr-only"
                              />
                              <div className="w-5 h-5 border-2 border-gray-300 group-hover:border-blue-500 rounded transition-colors"></div>
                              <div
                                className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                                  watch('dateFlexibility') === 'true'
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                }`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3.5 w-3.5 text-blue-600"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                            <span className="ml-2 text-gray-700 group-hover:text-blue-700 transition-colors flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1 text-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Flexible Date (+3 Days)
                            </span>
                          </label>
                        </div>
                        {errors?.dateFlexibility && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.dateFlexibility.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6"></div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="First Name"
                          className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                          {...register('firstName')}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Last Name"
                          className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                          {...register('lastName')}
                        />
                      </div>
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>

                    <div className="lg:col-span-2">
                      <p className="flex items-center text-xs text-gray-600 bg-blue-50 rounded-md p-2 border border-blue-100">
                        <HiOutlineInformationCircle className="mr-2 h-4 w-4 text-blue-500 flex-shrink-0" />
                        Please enter your name according to your passport
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <input
                          type="email"
                          placeholder="Enter your email address"
                          className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                          {...register('email')}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <CustomTextField
                          id="inquiry-phone"
                          isPhoneNumber={true}
                          countryCode={selectedPhoneCode}
                          onCountryCodeChange={(code) =>
                            setSelectedPhoneCode(code)
                          }
                          placeholder="Enter your mobile number"
                          {...register('phone')}
                          value={watch('phone')}
                          onChange={(e) =>
                            setValue('phone', e.target.value, {
                              shouldValidate: true,
                            })
                          }
                          error={!!errors.phone}
                          errorMessage={errors.phone?.message}
                          required
                          fullWidth
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <label className="block text-sm font-medium text-gray-700">
                        Passenger
                      </label>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">
                          Adult <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <input
                            type="number"
                            placeholder="Adult"
                            min="1"
                            step="1"
                            className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            {...register('adult')}
                          />
                        </div>
                        {errors.adult && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.adult.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">
                          Children
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                          </div>
                          <input
                            type="number"
                            placeholder="Children"
                            min="0"
                            step="1"
                            defaultValue={0}
                            className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            {...register('children', { required: false })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">
                          Infant
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                              />
                            </svg>
                          </div>
                          <input
                            type="number"
                            placeholder="Infant"
                            min="0"
                            step="1"
                            defaultValue={0}
                            className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            {...register('infant', { required: false })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="lg:w-1/3 space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Class
                      </label>
                      <div className="relative">
                        <select
                          {...register('className')}
                          className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow appearance-none bg-none"
                        >
                          <option value="ECONOMY">Economy</option>
                          {/* <option value="PREMIUM_ECONOMY">Premium Economy</option> */}
                          <option value="BUSINESS">Business</option>
                          <option value="FIRST">First Class</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                      {errors?.className && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.className.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      className="flex items-center px-6 py-2 bg-primary hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors shadow-md"
                      type="submit"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      Submit Inquiry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default InquiryForm;
