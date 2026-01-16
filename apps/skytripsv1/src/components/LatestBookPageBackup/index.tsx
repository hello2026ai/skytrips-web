// import React, { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/router';
// import axiosInstance from '../../../lib/axiosConfig';
// import Payment from '../../components/Payment';
// import { toast } from 'sonner';
// import Navbar from '../../components/Navbar';
// import Footer from '../../components/Footer';
// import { CustomTextField } from '../../components/ui/CustomTextField';
// import { CustomDatePicker } from '../../components/ui/CustomDatePicker';
// import { CustomSelectField } from '../../components/ui/CustomSelectField';
// // import { CustomPhoneField } from '../../components/ui/CustomPhoneField';

// import countries from '../../../../../libs/src/shared-utils/constants/countries.json';
// import { airports } from '../../../../../libs/src/shared-utils/constants/airports';
// import FlightItinerary from '../../components/FlightItinerary';
// import BookRedirectCountdown from '../../components/BookRedirectCountdown';
// import { NextSeo } from 'next-seo';
// import { authFetch } from '../../utils/authFetch';
// import SignInModal from '../../components/auth/SignInModal';

// // Near the top of the file, after imports and before the component definition
// // Create countries array for dropdowns
// const countryOptions = countries.countries
//   .map((country) => ({
//     value: country.label,
//     label: country.label,
//   }))
//   .sort((a, b) => a.label.localeCompare(b.label));

// // Add an empty option at the beginning
// countryOptions.unshift({ value: '', label: 'Select country' });

// export default function Book() {
//   const [bookingStatus, setBookingStatus] = useState('pending');
//   const [paymentStep, setPaymentStep] = useState('details');
//   const [showPaymentForm, setShowPaymentForm] = useState(true);
//   const router = useRouter();
//   const [primaryContactIndex, setPrimaryContactIndex] = useState(-1);
//   const [needWheelchair, setNeedWheelchair] = useState(false);
//   const [showDetails, setShowDetails] = useState(false);
//   const [flightData, setFlightData] = useState<any>(null);
//   const [expandedPassenger, setExpandedPassenger] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const [bookingError, setBookingError] = useState('');
//   // Add state for redirecting when no fare is applicable
//   const [isRedirecting, setIsRedirecting] = useState(false);
//   const [redirectCountdown, setRedirectCountdown] = useState(10);
//   // Add state to store passenger form data
//   const [passengerFormData, setPassengerFormData] = useState<any[]>([]);
//   // Add state for contact details
//   const [contactInfo, setContactInfo] = useState({
//     email: '',
//     phone: '',
//     phoneCountryCode: '+61', // Default to Australia
//   });
//   // Add state for payment details
//   const [cardHolderName, setCardHolderName] = useState('');
//   const [cardNumber, setCardNumber] = useState('');
//   const [expiryDate, setExpiryDate] = useState('');
//   const [cvc, setCvc] = useState('');
//   // Add state for form validation errors
//   const [formErrors, setFormErrors] = useState<{
//     [key: string]: { [key: string]: string };
//   }>({});
//   const [showValidationErrors, setShowValidationErrors] = useState(false);
//   // Add state for booking success
//   const [bookingSuccess, setBookingSuccess] = useState(false);
//   // Add ref to track active element for focus management
//   const activeElementRef = useRef<string | null>(null);
//   const activeElementSelectionStartRef = useRef<number | null>(null);
//   const activeElementSelectionEndRef = useRef<number | null>(null);
//   // Add state for payment validation errors
//   const [paymentErrors, setPaymentErrors] = useState<{
//     cardHolderName?: string;
//     cardNumber?: string;
//     expiryDate?: string;
//     cvc?: string;
//   }>({});
//   // Add state for booking response
//   const [bookingResponse, setBookingResponse] = useState<any>({});
//   // Add state for 3D Secure authentication
//   const [isOpenThreedsSecureModal, setIsOpenThreedsSecureModal] =
//     useState(false);
//   const [browserInfo, setBrowserInfo] = useState('');
//   const [ipAddress, setIpAddress] = useState('');
//   const [timeZone, setTimeZone] = useState('');
//   // Add refs for iframe and payment token
//   const iframeModalRef = useRef(null);
//   const iframeRef = useRef<HTMLIFrameElement | null>(null);
//   const paymentTokenRef = useRef(null);
//   // Create a ref to store the booking ID for immediate access
//   const bookingIdRef = useRef<string | null>(null);
//   // Add ref for price check interval
//   const priceCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
//   // Add state to track expanded itineraries
//   const [expandedItineraries, setExpandedItineraries] = useState<number[]>([]);
//   // Add state for dictionaries
//   const [dictionariesData, setDictionariesData] = useState<any>(null);
//   // Add state for flight price data
//   const [flightPriceData, setFlightPriceData] = useState<any>(null);
//   // Add state for taxes expanded
//   const [taxesExpanded, setTaxesExpanded] = useState<boolean>(false);
//   // Add state for service fee data
//   const [serviceFeeData, setServiceFeeData] = useState<any>({
//     amount: 0.0,
//     currencyCode: 'AUD',
//   });
//   // Add state for converted service fee
//   const [convertedServiceFee, setConvertedServiceFee] = useState(0.0);
//   // Add state for referral code
//   const [referralCode, setReferralCode] = useState<string | undefined>(
//     undefined
//   );
//   // Add state for authenticated user data
//   const [userData, setUserData] = useState<any>(null);
//   const [isUserDataLoading, setIsUserDataLoading] = useState(false);
//   const [relationshipsList, setRelationshipsList] = useState<any[]>([]);
//   const [isRelationshipsLoading, setIsRelationshipsLoading] = useState(false);
//   // Add state for sign in modal
//   const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
//   // Add state for Best Value fare data
//   const [bestValueFareData, setBestValueFareData] = useState<any>(null);
//   // Add state for calculated discount
//   const [fareDiscount, setFareDiscount] = useState<{
//     amount: number;
//     type: string;
//     label: string;
//   } | null>(null);
//   // Add state for form autosave key
//   const [formAutosaveKey, setFormAutosaveKey] = useState<string>('');

//   // Add useEffect to handle referral code from localStorage
//   useEffect(() => {
//     const storedReferralCode = localStorage.getItem('referralCode');
//     if (storedReferralCode) {
//       setReferralCode(storedReferralCode);
//     }
//   }, []);

//   // Add useEffect to load Best Value fare data and calculate discount
//   useEffect(() => {
//     const loadBestValueFareData = () => {
//       try {
//         const storedBestValue = localStorage.getItem(
//           'skytrips_best_value_booking'
//         );
//         if (storedBestValue) {
//           const bestValueData = JSON.parse(storedBestValue);
//           if (
//             bestValueData?.isManualFareApplied &&
//             bestValueData?.fareDetails
//           ) {
//             setBestValueFareData(bestValueData);

//             // Calculate discount based on fare type
//             const fareDetails = bestValueData.fareDetails;
//             let discountAmount = 0;
//             let discountType = '';
//             let discountLabel = fareDetails.customLabel || 'Special Fare';

//             if (fareDetails.fareDeductionValueType === 'PERCENTAGE') {
//               // Calculate percentage discount on current flight price
//               const currentBasePrice = Number(
//                 flightData?.flight?.price?.base || 0
//               );
//               discountAmount =
//                 (currentBasePrice * fareDetails.deductionValue) / 100;
//               discountType = 'percentage';
//             } else if (fareDetails.fareDeductionValueType === 'FIXED') {
//               // Fixed amount discount
//               discountAmount = fareDetails.deductionValue || 0;
//               discountType = 'fixed';
//             }

//             if (discountAmount > 0) {
//               setFareDiscount({
//                 amount: discountAmount,
//                 type: discountType,
//                 label: discountLabel,
//               });
//             }
//           }
//         }
//       } catch (error) {
//         console.error('Error loading Best Value fare data:', error);
//       }
//     };

//     // Load fare data when flightData is available
//     if (flightData) {
//       loadBestValueFareData();
//     }
//   }, [flightData]);

//   // Separate useEffect to recalculate discount when flight price changes
//   useEffect(() => {
//     if (!flightData?.flight?.price || !bestValueFareData?.fareDetails) return;

//     const fareDetails = bestValueFareData.fareDetails;
//     let discountAmount = 0;

//     if (fareDetails.fareDeductionValueType === 'PERCENTAGE') {
//       const currentBasePrice = Number(flightData.flight.price.base || 0);
//       discountAmount = (currentBasePrice * fareDetails.deductionValue) / 100;
//     } else if (fareDetails.fareDeductionValueType === 'FIXED') {
//       discountAmount = fareDetails.deductionValue || 0;
//     }

//     if (discountAmount > 0) {
//       setFareDiscount({
//         amount: discountAmount,
//         type:
//           fareDetails.fareDeductionValueType === 'PERCENTAGE'
//             ? 'percentage'
//             : 'fixed',
//         label: fareDetails.customLabel || 'Special Fare',
//       });
//     }
//   }, [
//     flightData?.flight?.price?.base,
//     flightData?.flight?.price?.grandTotal,
//     bestValueFareData,
//   ]);

//   // Create a single reusable function to fetch user data
//   const fetchUserData = async () => {
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       setIsUserDataLoading(true);
//       try {
//         const response = await fetch(
//           `${process.env.NEXT_PUBLIC_REST_API}/auth/me`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               'Content-Type': 'application/json',
//             },
//           }
//         );

//         if (response.ok) {
//           const data = await response.json();
//           setUserData(data);
//           console.log('User data fetched:', data);
//           // Fetch relationships after getting user data
//           fetchRelationships();
//         } else if (response.status === 401) {
//           // Token is invalid, remove it
//           localStorage.removeItem('accessToken');
//           localStorage.removeItem('user');
//         }
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//       } finally {
//         setIsUserDataLoading(false);
//       }
//     }
//   };

//   // Fetch user data on component mount
//   useEffect(() => {
//     fetchUserData();
//   }, []);

//   // Refresh user data when sign in modal closes (only if user just logged in)
//   useEffect(() => {
//     if (!isSignInModalOpen) {
//       // Check if user logged in after modal closed
//       const token = localStorage.getItem('accessToken');
//       if (token && !userData) {
//         // Only refetch if token exists but userData is null (indicating fresh login)
//         fetchUserData();
//       }
//     }
//   }, [isSignInModalOpen, userData]);

//   // Function to fetch user passengers
//   const fetchRelationships = async () => {
//     try {
//       setIsRelationshipsLoading(true);

//       const response = await authFetch(
//         `${process.env.NEXT_PUBLIC_REST_API}/user-passenger`,
//         {
//           method: 'GET',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       const data = await response.json();
//       // Get passengers from data array
//       const apiPassengers = data.data || [];
//       setRelationshipsList(apiPassengers);
//     } catch (error) {
//       console.error('Failed to fetch passengers:', error);
//       setRelationshipsList([]);
//     } finally {
//       setIsRelationshipsLoading(false);
//     }
//   };

//   useEffect(() => {
//     // Try to get flight data from sessionStorage instead of URL
//     try {
//       const storedFlightData =
//         typeof window !== 'undefined'
//           ? sessionStorage.getItem('skytrips_booking_data')
//           : null;

//       // Load dictionaries from session storage
//       const storedDictionaries =
//         typeof window !== 'undefined'
//           ? sessionStorage.getItem('skytrips_dictionaries')
//           : null;

//       if (storedDictionaries) {
//         const parsedDictionaries = JSON.parse(storedDictionaries);
//         console.log(
//           'Loaded dictionaries from session storage:',
//           parsedDictionaries
//         );
//         setDictionariesData(parsedDictionaries);
//       }

//       // Check if we have data from sessionStorage
//       let flightDataSource = null;

//       if (storedFlightData) {
//         // get flight data from sessionStorage
//         flightDataSource = JSON.parse(storedFlightData);
//       }

//       // If we have valid flight data from either source, process it
//       if (flightDataSource) {
//         setFlightData(flightDataSource);
//         console.log('Flight data loaded:', flightDataSource);

//         // Make background API call to flight price and service fees
//         if (flightDataSource.flight) {
//           // Make background API call to service fee
//           axiosInstance
//             .get('/service-fee')
//             .then((response) => {
//               console.log('Service fee API response:', response.data.data);
//               if (response.data.data && response.data.data.length > 0) {
//                 // set service fee data
//                 setServiceFeeData(response.data.data[0]);
//               }
//             })
//             .catch((error) => {
//               console.error('Error calling service fee API:', error);
//             });

//           // Make background API call to flight price
//           axiosInstance
//             .post('/flight-price', flightDataSource.flight)
//             .then((response) => {
//               console.log('Flight price API response status:', response.status);
//               return response.data;
//             })
//             .then((data) => {
//               // Notify user if the flight price has changed
//               if (
//                 data.data[0].price.grandTotal !==
//                 flightDataSource.flight.price.grandTotal
//               ) {
//                 if (serviceFeeData?.amount !== 0.0) {
//                   toast.success(
//                     `Flight price has been changed from ${
//                       flightDataSource?.currencyCode || 'AUD'
//                     } ${flightDataSource.flight.price.grandTotal} to ${
//                       flightDataSource?.currencyCode || 'AUD'
//                     } ${Number(
//                       Number(data.data[0].price.grandTotal) +
//                         Number(serviceFeeData?.amount)
//                     ).toFixed(2)}`
//                   );
//                 } else {
//                   toast.success(
//                     `Flight price has been changed from ${
//                       flightDataSource?.currencyCode || 'AUD'
//                     } ${flightDataSource.flight.price.grandTotal} to ${
//                       flightDataSource?.currencyCode || 'AUD'
//                     } ${data.data[0].price.grandTotal}`
//                   );
//                 }
//               }
//               setFlightPriceData(data.data[0]); // Set flight price data

//               // set flight data with the new price and traveler pricings
//               setFlightData((prevData: any) => ({
//                 ...prevData,
//                 flight: {
//                   ...prevData.flight,
//                   price: data.data[0].price,
//                   travelerPricings: data.data[0].travelerPricings,
//                 },
//               }));

//               console.log('Flight price API response:', data);
//             })
//             .catch((error) => {
//               // Just log the error without affecting the main flow
//               console.error('Error calling flight price API:', error);

//               if (
//                 error.response &&
//                 (error.response.status === 400 ||
//                   error.response.data.message === 'No fare applicable')
//               ) {
//                 // Set redirecting state and start countdown
//                 setIsRedirecting(true);

//                 // Start a countdown interval
//                 let count = 10;
//                 setRedirectCountdown(count);

//                 const countdownInterval = setInterval(() => {
//                   count -= 1;
//                   setRedirectCountdown(count);

//                   if (count <= 0) {
//                     clearInterval(countdownInterval);
//                     router.back();
//                   }
//                 }, 1000);
//               } else {
//                 // Flight price API call failed
//                 router.push('/');
//               }
//             });
//         }

//         // Initialize passenger form data array
//         const adultCount =
//           flightDataSource?.travelers?.adults || flightDataSource?.adults || 1;
//         const childCount =
//           flightDataSource?.travelers?.children ||
//           flightDataSource?.children ||
//           0;
//         const infantCount =
//           flightDataSource?.travelers?.infants ||
//           flightDataSource?.infants ||
//           0;
//         const totalPassengers =
//           Number(adultCount) + Number(childCount) + Number(infantCount);

//         // Create empty form data for each passenger
//         const initialFormData = Array(totalPassengers)
//           .fill(0)
//           .map((_, index) => ({
//             title: 'Mr',
//             firstName: '',
//             middleName: '',
//             lastName: '',
//             gender: 'MALE',
//             dob: '',
//             passportNumber: '',
//             passportCountry: '',
//             passportExpiry: '',
//             travelingWithAdult: 0,
//           }));

//         setPassengerFormData(initialFormData);
//       } else if (!storedFlightData) {
//         // sessionStorage has no flight data - redirect to home
//         toast.error('No flight data found. Please start a new search.');
//         router.push('/');
//       }
//     } catch (error) {
//       console.error('Error processing flight data:', error);
//       toast.error('Error loading flight data. Please try again.');
//       router.push('/');
//     }
//   }, [router.isReady, router.query]);

//   // Effect to restore focus after render
//   useEffect(() => {
//     if (activeElementRef.current) {
//       const elementId = activeElementRef.current;
//       const element = document.getElementById(elementId) as
//         | HTMLInputElement
//         | HTMLSelectElement
//         | null;

//       if (element && document.activeElement !== element) {
//         element.focus();

//         // Restore cursor position for input elements
//         if (
//           element instanceof HTMLInputElement &&
//           typeof activeElementSelectionStartRef.current === 'number' &&
//           typeof activeElementSelectionEndRef.current === 'number'
//         ) {
//           element.setSelectionRange(
//             activeElementSelectionStartRef.current,
//             activeElementSelectionEndRef.current
//           );
//         }
//       }

//       // Reset after focus is restored
//       activeElementRef.current = null;
//       activeElementSelectionStartRef.current = null;
//       activeElementSelectionEndRef.current = null;
//     }
//   });

//   // Add effect for periodic price checking
//   useEffect(() => {
//     // Only set up interval if we have flight data and booking is not completed
//     if (flightData?.flight && !bookingSuccess) {
//       console.log('Setting up flight price check interval');

//       // Clear any existing interval first
//       if (priceCheckIntervalRef.current) {
//         clearInterval(priceCheckIntervalRef.current);
//       }

//       // Set up new interval for price check every 2 minutes
//       priceCheckIntervalRef.current = setInterval(() => {
//         console.log('Running scheduled flight price check');

//         axiosInstance
//           .post('/flight-price', flightData.flight)
//           .then((response) => {
//             return response.data;
//           })
//           .then((data) => {
//             // Only update and notify if price has changed
//             if (
//               data.data[0].price.grandTotal !==
//               flightData.flight.price.grandTotal
//             ) {
//               if (serviceFeeData?.amount !== 0.0) {
//                 toast.success(
//                   `Flight price has been updated from ${
//                     flightData?.currencyCode || 'AUD'
//                   } ${flightData.flight.price.grandTotal} to ${
//                     flightData?.currencyCode || 'AUD'
//                   } ${Number(
//                     Number(data.data[0].price.grandTotal) +
//                       Number(serviceFeeData?.amount)
//                   ).toFixed(2)}`
//                 );
//               } else {
//                 toast.success(
//                   `Flight price has been updated from ${
//                     flightData?.currencyCode || 'AUD'
//                   } ${flightData.flight.price.grandTotal} to ${
//                     flightData?.currencyCode || 'AUD'
//                   } ${data.data[0].price.grandTotal}`
//                 );
//               }
//               setFlightPriceData(data.data[0]); // Set flight price data

//               // set flight data with the new price and traveler pricings
//               setFlightData((prevData: any) => ({
//                 ...prevData,
//                 flight: {
//                   ...prevData.flight,
//                   price: data.data[0].price,
//                   travelerPricings: data.data[0].travelerPricings,
//                 },
//               }));
//               console.log('price api flightData', flightData);
//             }
//             console.log('Scheduled flight price check completed');
//           })
//           .catch((error) => {
//             console.error('Error in scheduled flight price check:', error);
//             if (
//               error.response &&
//               (error.response.status === 400 ||
//                 error.response.data.message === 'No fare applicable')
//             ) {
//               // Set redirecting state and start countdown
//               setIsRedirecting(true);

//               // Start a countdown interval
//               let count = 10;
//               setRedirectCountdown(count);

//               const countdownInterval = setInterval(() => {
//                 count -= 1;
//                 setRedirectCountdown(count);

//                 if (count <= 0) {
//                   clearInterval(countdownInterval);
//                   router.back();
//                 }
//               }, 1000);
//             } else {
//               // Flight price API call failed
//               router.push('/');
//             }
//           });
//       }, 120000); // 2 minutes in milliseconds
//     }

//     // Clean up the interval when component unmounts or booking completes
//     return () => {
//       if (priceCheckIntervalRef.current) {
//         clearInterval(priceCheckIntervalRef.current);
//         priceCheckIntervalRef.current = null;
//         console.log('Cleared flight price check interval');
//       }
//     };
//   }, [flightData?.flight, bookingSuccess]);

//   // Get origin destinations
//   const originDestinations = flightData?.originDestinations || [];

//   // Get passenger counts
//   const adultCount = flightData?.travelers?.adults || flightData?.adults || 1;
//   const childCount =
//     flightData?.travelers?.children || flightData?.children || 0;
//   const infantCount =
//     flightData?.travelers?.infants || flightData?.infants || 0;

//   // Create passenger array with appropriate types in order: adults, children, infants
//   const passengers = [
//     ...Array(Number(adultCount)).fill('Adult'),
//     ...Array(Number(childCount)).fill('Child'),
//     ...Array(Number(infantCount)).fill('Infant'),
//   ];

//   // Function to toggle passenger details expansion
//   const togglePassengerExpanded = (index: number) => {
//     setExpandedPassenger(expandedPassenger === index ? -1 : index);
//   };

//   // Function to set primary contact
//   const setPrimaryContact = (index: number) => {
//     const newPrimaryContactIndex = primaryContactIndex === index ? -1 : index;
//     setPrimaryContactIndex(newPrimaryContactIndex);

//     // Auto-fill contact info if passenger is being set as primary contact and has data
//     if (newPrimaryContactIndex === index && newPrimaryContactIndex >= 0) {
//       const passenger = passengerFormData[index];

//       // Check if passenger has data (either from user profile or relationships)
//       if (passenger && (passenger.firstName || passenger.lastName)) {
//         // Try to auto-fill from user data first
//         if (
//           userData &&
//           passenger.firstName === userData.firstName &&
//           passenger.lastName === userData.lastName
//         ) {
//           setContactInfo({
//             email: userData.email || '',
//             phone: userData.phone || '',
//             phoneCountryCode: userData.phoneCountryCode || '+61',
//           });
//           toast.success('Contact details auto-filled from your profile');
//         }
//         // Try to find matching relationship data
//         else if (relationshipsList.length > 0) {
//           const matchingPassenger = relationshipsList.find(
//             (p) =>
//               p.firstName === passenger.firstName &&
//               p.lastName === passenger.lastName
//           );

//           if (matchingPassenger) {
//             setContactInfo({
//               email: matchingPassenger.email || '',
//               phone: matchingPassenger.contactNumber || '',
//               phoneCountryCode: matchingPassenger.phoneCountryCode || '+61',
//             });
//             toast.success(
//               `Contact details auto-filled for ${matchingPassenger.firstName}`
//             );
//           }
//         }
//       }
//     }
//   };

//   // Function to format duration time
//   const formatDuration = (duration: string) => {
//     if (!duration) return 'Duration';
//     return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
//   };

//   // Function to get transit time between segments
//   const getTransitTime = (segment: any) => {
//     const transitTime = segment?.transitTime;
//     return transitTime ? formatDuration(transitTime) : '';
//   };

//   // Function to save active element before state update
//   const saveActiveElement = (elementId: string) => {
//     activeElementRef.current = elementId;

//     const element = document.getElementById(elementId) as HTMLInputElement;
//     if (element && element instanceof HTMLInputElement) {
//       activeElementSelectionStartRef.current = element.selectionStart;
//       activeElementSelectionEndRef.current = element.selectionEnd;
//     }
//   };

//   // Function to auto-fill passenger data with user data
//   const autoFillWithUserData = (passengerIndex: number) => {
//     if (!userData) return;

//     const updatedFormData = [...passengerFormData];
//     updatedFormData[passengerIndex] = {
//       ...updatedFormData[passengerIndex],
//       title: userData.gender === 'FEMALE' ? 'Ms' : 'Mr', // Default title based on gender
//       firstName: userData.firstName || '',
//       middleName: '', // Not available in API response
//       lastName: userData.lastName || '',
//       gender: userData.gender || 'MALE',
//       dob: userData.dateOfBirth || '',
//       passportNumber: userData.passport?.passportNumber || '',
//       passportCountry: userData.passport?.passportIssueCountry || '',
//       passportExpiry: userData.passport?.passportExpiryDate || '',
//     };
//     setPassengerFormData(updatedFormData);

//     // Also auto-fill contact info if this passenger becomes primary contact
//     if (primaryContactIndex === passengerIndex) {
//       setContactInfo({
//         email: userData.email || '',
//         phone: userData.phone || '',
//         phoneCountryCode: userData.phoneCountryCode || '+61',
//       });
//     }

//     // Clear any existing errors for this passenger since we're auto-filling
//     setFormErrors((prevErrors) => {
//       const newErrors = { ...prevErrors };
//       delete newErrors[passengerIndex];
//       return newErrors;
//     });

//     toast.success('Passenger details auto-filled from your profile');
//   };

//   // Function to auto-fill passenger data with saved passenger data
//   const autoFillWithRelationshipData = (
//     passengerIndex: number,
//     passengerId: string
//   ) => {
//     if (!relationshipsList.length) return;

//     const passengerData = relationshipsList.find((p) => p.id === passengerId);

//     if (!passengerData) {
//       toast.error(`Passenger not found`);
//       return;
//     }

//     // Get the passenger type for this index
//     const passengerType = passengers[passengerIndex];

//     // Validate age compatibility if DOB is available
//     if (passengerData.dateOfBirth) {
//       const birthDate = new Date(passengerData.dateOfBirth);
//       const today = new Date();
//       let age = today.getFullYear() - birthDate.getFullYear();
//       const monthDiff = today.getMonth() - birthDate.getMonth();

//       // Adjust age if birth month hasn't occurred this year yet
//       if (
//         monthDiff < 0 ||
//         (monthDiff === 0 && today.getDate() < birthDate.getDate())
//       ) {
//         age--;
//       }

//       // Check age compatibility with passenger type
//       if (passengerType === 'Infant' && age > 2) {
//         toast.error(
//           `${passengerData.firstName} is ${age} years old and cannot be added as an Infant (must be under 2)`
//         );
//         return;
//       } else if (passengerType === 'Child' && (age < 2 || age > 12)) {
//         toast.error(
//           `${passengerData.firstName} is ${age} years old and cannot be added as a Child (must be 2-12 years)`
//         );
//         return;
//       } else if (passengerType === 'Adult' && age < 12) {
//         toast.error(
//           `${passengerData.firstName} is ${age} years old and cannot be added as an Adult (must be 12+ years)`
//         );
//         return;
//       }
//     }

//     const updatedFormData = [...passengerFormData];
//     updatedFormData[passengerIndex] = {
//       ...updatedFormData[passengerIndex],
//       title: passengerData.gender === 'FEMALE' ? 'Ms' : 'Mr', // Default title based on gender
//       firstName: passengerData.firstName || '',
//       middleName: '', // Not available in passenger data
//       lastName: passengerData.lastName || '',
//       gender: passengerData.gender || 'MALE',
//       dob: passengerData.dateOfBirth || '',
//       passportNumber: passengerData.passport?.passportNumber || '',
//       passportCountry: passengerData.passport?.passportIssueCountry || '',
//       passportExpiry: passengerData.passport?.passportExpiryDate || '',
//     };
//     setPassengerFormData(updatedFormData);

//     // Also auto-fill contact info if this passenger becomes primary contact
//     if (primaryContactIndex === passengerIndex) {
//       setContactInfo({
//         email: passengerData.email || '',
//         phone: passengerData.contactNumber || '',
//         phoneCountryCode: passengerData.phoneCountryCode || '+61',
//       });
//     }

//     // Clear any existing errors for this passenger since we're auto-filling
//     setFormErrors((prevErrors) => {
//       const newErrors = { ...prevErrors };
//       delete newErrors[passengerIndex];
//       return newErrors;
//     });

//     toast.success(
//       `Passenger details auto-filled for ${passengerData.firstName}`
//     );
//   };

//   // Function to handle passenger type selection (yourself/someone else)
//   const handlePassengerTypeSelection = (
//     passengerIndex: number,
//     selection: string
//   ) => {
//     if (selection === 'yourself' && userData) {
//       autoFillWithUserData(passengerIndex);
//     } else if (selection === 'someone-else') {
//       // Clear the form for someone else
//       const updatedFormData = [...passengerFormData];
//       updatedFormData[passengerIndex] = {
//         title: 'Mr',
//         firstName: '',
//         middleName: '',
//         lastName: '',
//         gender: 'MALE',
//         dob: '',
//         passportNumber: '',
//         passportCountry: '',
//         passportExpiry: '',
//         travelingWithAdult: 0,
//       };
//       setPassengerFormData(updatedFormData);
//     }
//   };

//   // Function to validate field
//   const validateField = (
//     value: string,
//     fieldType: string,
//     fieldName: string,
//     passengerType?: string
//   ): string => {
//     if (!value || value.trim() === '') {
//       return `${fieldName} is required`;
//     }

//     switch (fieldType) {
//       case 'email':
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(value)) {
//           return `Please enter a valid email address`;
//         }
//         break;
//       case 'phone':
//         const phoneRegex = /^\d{8,12}$/;
//         if (!phoneRegex.test(value)) {
//           return `Please enter a valid phone number (8-12 digits)`;
//         }
//         break;
//       case 'name':
//         if (value.length < 2) {
//           return `${fieldName} must be at least 2 characters`;
//         }
//         break;
//       case 'dob':
//         const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
//         if (!dobRegex.test(value)) {
//           return `Date must be in YYYY-MM-DD format`;
//         }
//         const dobDate = new Date(value);
//         if (isNaN(dobDate.getTime())) {
//           return `Please enter a valid date`;
//         }
//         if (dobDate > new Date()) {
//           return `Date of birth cannot be in the future`;
//         }

//         // Age validation based on passenger type
//         if (passengerType) {
//           const today = new Date();
//           const birthDate = new Date(value);
//           let age = today.getFullYear() - birthDate.getFullYear();
//           const monthDiff = today.getMonth() - birthDate.getMonth();

//           // Adjust age if birth month hasn't occurred this year yet
//           if (
//             monthDiff < 0 ||
//             (monthDiff === 0 && today.getDate() < birthDate.getDate())
//           ) {
//             age--;
//           }

//           if (passengerType === 'Infant' && age > 2) {
//             return `Infant must be under 2 years of age`;
//           } else if (passengerType === 'Child' && (age < 2 || age > 12)) {
//             return `Child must be above 2 and below 12 years of age`;
//           } else if (passengerType === 'Adult' && age < 12) {
//             return `Adult must be 12 years or older`;
//           }
//         }
//         break;
//       case 'passportNumber':
//         if (value.length < 6) {
//           return `Passport number must be at least 6 characters`;
//         }
//         break;
//       case 'passportExpiry':
//         const expiryRegex = /^\d{4}-\d{2}-\d{2}$/;
//         if (!expiryRegex.test(value)) {
//           return `Date must be in YYYY-MM-DD format`;
//         }
//         const expiryDate = new Date(value);
//         if (isNaN(expiryDate.getTime())) {
//           return `Please enter a valid date`;
//         }
//         if (expiryDate <= new Date()) {
//           return `Passport expiry date must be in the future`;
//         }
//         break;
//       case 'country':
//         if (value === '') {
//           return `Please select a country`;
//         }
//         break;
//     }

//     return '';
//   };

//   // Function to handle passenger form field changes with validation
//   const handlePassengerFormChange = (
//     index: number,
//     field: string,
//     value: string,
//     elementId: string
//   ) => {
//     // Save the active element information
//     saveActiveElement(elementId);

//     // Update passenger form data
//     const updatedFormData = [...passengerFormData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       [field]: value,
//     };
//     setPassengerFormData(updatedFormData);

//     // Validate field
//     let fieldType = field;
//     let fieldName = field.charAt(0).toUpperCase() + field.slice(1);

//     // Get display names for fields
//     if (field === 'firstName') {
//       fieldName = 'First Name';
//       fieldType = 'name';
//     } else if (field === 'lastName') {
//       fieldName = 'Last Name';
//       fieldType = 'name';
//     } else if (field === 'middleName') {
//       fieldName = 'Middle Name';
//       fieldType = 'name';
//     } else if (field === 'passportNumber') {
//       fieldName = 'Passport Number';
//     } else if (field === 'passportCountry') {
//       fieldName = 'Passport Country';
//       fieldType = 'country';
//     } else if (field === 'passportExpiry') {
//       fieldName = 'Passport Expiry Date';
//     } else if (field === 'dob') {
//       fieldName = 'Date of Birth';
//     }

//     // Get passenger type for age validation
//     const passengerType =
//       index < Number(adultCount)
//         ? 'Adult'
//         : index < Number(adultCount) + Number(childCount)
//         ? 'Child'
//         : 'Infant';

//     // Pass passenger type when validating date of birth
//     const errorMessage =
//       field === 'dob'
//         ? validateField(value, fieldType, fieldName, passengerType)
//         : validateField(value, fieldType, fieldName);

//     // Update errors state
//     setFormErrors((prevErrors) => {
//       const passengerErrors = prevErrors[index] || {};
//       return {
//         ...prevErrors,
//         [index]: {
//           ...passengerErrors,
//           [field]: errorMessage,
//         },
//       };
//     });
//   };

//   // Function to handle contact info changes with validation
//   const handleContactInfoChange = (
//     field: string,
//     value: string,
//     elementId: string
//   ) => {
//     // Make a copy of the current contact info
//     const updatedContactInfo = { ...contactInfo };

//     // Update the field value
//     if (field === 'phoneNumber') {
//       updatedContactInfo.phone = value;
//     } else if (field === 'countryCode') {
//       updatedContactInfo.phoneCountryCode = value;
//     } else if (field === 'email') {
//       updatedContactInfo.email = value;
//     } else {
//       // Type assertion to ensure field is a valid key
//       (updatedContactInfo as any)[field] = value;
//     }

//     // Save the active element id
//     saveActiveElement(elementId);

//     // Update the state
//     setContactInfo(updatedContactInfo);

//     // Clear validation errors for this field when user starts typing
//     if (field === 'email' || field === 'phone' || field === 'phoneNumber') {
//       setFormErrors((prevErrors) => {
//         // If contactInfo doesn't exist in errors, return unchanged
//         if (!prevErrors.contactInfo) return prevErrors;

//         const updatedContactErrors = { ...prevErrors.contactInfo };
//         if (field === 'email') {
//           delete updatedContactErrors.email;
//         } else if (field === 'phone' || field === 'phoneNumber') {
//           delete updatedContactErrors.phone;
//         }

//         return {
//           ...prevErrors,
//           contactInfo: updatedContactErrors,
//         };
//       });
//     }
//   };

//   // Function to validate all passenger forms before booking
//   const validateAllForms = (): boolean => {
//     setShowValidationErrors(true);
//     let isValid = true;
//     const newErrors: { [key: string]: { [key: string]: string } } = {};

//     // Validate passenger forms
//     passengerFormData.forEach((passenger, index) => {
//       const passengerType = passengers[index];
//       const passengerErrors: { [key: string]: string } = {};

//       // Validate name fields
//       const fieldDisplayNames: { [key: string]: string } = {
//         firstName: 'First Name',
//         lastName: 'Last Name',
//         dob: 'Date of Birth',
//         passportNumber: 'Passport Number',
//         passportCountry: 'Passport Country',
//         passportExpiry: 'Passport Expiry Date',
//       };

//       // Validate name fields
//       ['firstName', 'lastName'].forEach((field) => {
//         const error = validateField(
//           passenger[field] || '',
//           'name',
//           fieldDisplayNames[field]
//         );
//         if (error) {
//           passengerErrors[field] = error;
//           isValid = false;
//         }
//       });

//       // Validate DOB with passenger type
//       const dobError = validateField(
//         passenger.dob || '',
//         'dob',
//         fieldDisplayNames.dob,
//         passengerType
//       );
//       if (dobError) {
//         passengerErrors.dob = dobError;
//         isValid = false;
//       }

//       // If not an infant, validate passport info
//       if (passengerType !== 'Infant') {
//         ['passportNumber', 'passportCountry', 'passportExpiry'].forEach(
//           (field) => {
//             const fieldType = field === 'passportCountry' ? 'country' : field;
//             const error = validateField(
//               passenger[field] || '',
//               fieldType,
//               fieldDisplayNames[field]
//             );
//             if (error) {
//               passengerErrors[field] = error;
//               isValid = false;
//             }
//           }
//         );
//       }

//       newErrors[index] = passengerErrors;
//     });

//     // Validate contact info if there's a primary contact
//     if (primaryContactIndex >= 0) {
//       const contactErrors: { [key: string]: string } = {};

//       const emailError = validateField(
//         contactInfo.email || '',
//         'email',
//         'Email'
//       );
//       if (emailError) {
//         contactErrors.email = emailError;
//         isValid = false;
//       }

//       const phoneError = validateField(
//         contactInfo.phone || '',
//         'phone',
//         'Phone Number'
//       );
//       if (phoneError) {
//         contactErrors.phone = phoneError;
//         isValid = false;
//       }

//       newErrors.contactInfo = contactErrors;
//     } else {
//       // Validate separate contact section
//       const contactErrors: { [key: string]: string } = {};
//       const contactEmailElem = document.getElementById(
//         'contact-email'
//       ) as HTMLInputElement;
//       const contactPhoneElem = document.getElementById(
//         'contact-phone'
//       ) as HTMLInputElement;

//       if (contactEmailElem) {
//         const emailError = validateField(
//           contactEmailElem.value || '',
//           'email',
//           'Email'
//         );
//         if (emailError) {
//           contactErrors.email = emailError;
//           isValid = false;
//         }
//       }

//       if (contactPhoneElem) {
//         const phoneError = validateField(
//           contactPhoneElem.value || '',
//           'phone',
//           'Phone Number'
//         );
//         if (phoneError) {
//           contactErrors.phone = phoneError;
//           isValid = false;
//         }
//       }

//       newErrors.contactInfo = contactErrors;
//     }

//     setFormErrors(newErrors);
//     return isValid;
//   };

//   // Function to handle booking
//   const handleBooking = async () => {
//     // First, set showValidationErrors to true to display any validation errors immediately
//     setShowValidationErrors(true);

//     // Validate passenger forms
//     const passengersValid = validateAllForms();

//     // Directly validate payment fields
//     const paymentValidationErrors: {
//       cardHolderName?: string;
//       cardNumber?: string;
//       expiryDate?: string;
//       cvc?: string;
//     } = {};
//     let paymentIsValid = true;

//     // Validate all payment fields
//     if (!cardHolderName || cardHolderName.length < 3) {
//       paymentValidationErrors.cardHolderName = !cardHolderName
//         ? "Cardholder's name is required"
//         : 'Please enter a valid name';
//       paymentIsValid = false;
//     }

//     if (!cardNumber || !/^\d{16}$/.test(cardNumber)) {
//       paymentValidationErrors.cardNumber = !cardNumber
//         ? 'Card number is required'
//         : 'Card number must be 16 digits';
//       paymentIsValid = false;
//     }

//     if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
//       paymentValidationErrors.expiryDate = !expiryDate
//         ? 'Expiry date is required'
//         : 'Expiry date must be in MM/YY format';
//       paymentIsValid = false;
//     } else {
//       const [month, year] = expiryDate.split('/');
//       const expiryMonth = parseInt(month, 10);
//       const expiryYear = parseInt(year, 10) + 2000;

//       const now = new Date();
//       const currentMonth = now.getMonth() + 1;
//       const currentYear = now.getFullYear();

//       if (expiryMonth < 1 || expiryMonth > 12) {
//         paymentValidationErrors.expiryDate = 'Invalid month';
//         paymentIsValid = false;
//       } else if (
//         expiryYear < currentYear ||
//         (expiryYear === currentYear && expiryMonth < currentMonth)
//       ) {
//         paymentValidationErrors.expiryDate = 'Card has expired';
//         paymentIsValid = false;
//       }
//     }

//     if (!cvc || !/^\d{3}$/.test(cvc)) {
//       paymentValidationErrors.cvc = !cvc
//         ? 'CVC is required'
//         : 'CVC must be 3 digits';
//       paymentIsValid = false;
//     }

//     // Update payment errors state
//     setPaymentErrors(paymentValidationErrors);

//     // If either validation failed, show error message and return
//     if (!passengersValid) {
//       // Expand the first passenger with errors
//       const firstPassengerWithErrors = Object.keys(formErrors)
//         .filter(
//           (key) =>
//             key !== 'contactInfo' && Object.keys(formErrors[key]).length > 0
//         )
//         .map((key) => parseInt(key))
//         .sort((a, b) => a - b)[0];

//       if (firstPassengerWithErrors !== undefined) {
//         setExpandedPassenger(firstPassengerWithErrors);
//       }

//       setBookingError(
//         'Please correct the passenger details before proceeding.'
//       );
//       toast.error('Please correct the passenger details before proceeding.', {
//         id: 'validation-error',
//       });
//       return;
//     }

//     if (!paymentIsValid) {
//       setBookingError(
//         'Please correct the payment information before proceeding.'
//       );
//       toast.error('Please correct the payment information before proceeding.', {
//         id: 'payment-validation-error',
//       });
//       return;
//     }

//     // If all validations passed, proceed with booking
//     setIsLoading(true);
//     setBookingError('');
//     toast.loading('Processing your booking, please wait...', {
//       id: 'booking-process',
//     });

//     try {
//       // Get user contact information
//       let userInput = {
//         email: '',
//         phone: '',
//         phoneCountryCode: '',
//       };

//       // Check if there's a primary contact passenger or need to use separate contact section
//       if (primaryContactIndex >= 0) {
//         // Use the stored contact info state
//         userInput = {
//           email: contactInfo.email || '',
//           phone: contactInfo.phone || '',
//           phoneCountryCode: contactInfo.phoneCountryCode || '+61', // Ensure default value
//         };
//       } else {
//         // Get from separate contact details section input fields
//         const contactEmailElem = document.getElementById(
//           'contact-email'
//         ) as HTMLInputElement;
//         const contactPhoneElem = document.getElementById(
//           'contact-phone'
//         ) as HTMLInputElement;

//         if (contactEmailElem) userInput.email = contactEmailElem.value;
//         if (contactPhoneElem) userInput.phone = contactPhoneElem.value;

//         // Use contactInfo as a fallback for phoneCountryCode
//         userInput.phoneCountryCode = contactInfo.phoneCountryCode || '+61';
//       }

//       // Final validation check for phoneCountryCode
//       if (!userInput.phoneCountryCode) {
//         userInput.phoneCountryCode = '+61'; // Default to Australia if still not set
//       }

//       // Extract passenger information
//       const passengerInputs: any[] = [];

//       // Process all passengers using stored form data
//       const passengerTypeMap = {
//         Adult: 'ADULT',
//         Child: 'CHILD',
//         Infant: 'HELD_INFANT',
//       };
//       for (let i = 0; i < passengers.length; i++) {
//         const passengerType: string = passengers[i];
//         const passenger = passengerFormData[i];

//         console.log('passenger', passenger);
//         console.log('passengerType', passengerType);

//         // Create passenger object
//         const mappedType =
//           passengerTypeMap[passengerType as keyof typeof passengerTypeMap] ||
//           passengerType;
//         const passengerInput = {
//           travelerId: (i + 1).toString(),
//           passengerType: mappedType,
//           title: passenger.title,
//           firstName: passenger.firstName,
//           middleName: passenger.middleName,
//           lastName: passenger.lastName,
//           dob: passenger.dob,
//           gender: passenger.gender,
//           documentType: 'PASSPORT',
//           passportCountry: passenger.passportCountry,
//           passportNumber: passenger.passportNumber,
//           passportExpiryDate: passenger.passportExpiry,
//           country: passenger.passportCountry,
//           countryCallingCode: userInput.phoneCountryCode.replace('+', ''),
//           phone: userInput.phone,
//           phoneDeviceType: 'MOBILE',
//         };

//         passengerInputs.push(passengerInput);
//       }

//       // Get additional fields from localStorage and browser
//       let additionalFields: {
//         origin?: string;
//         destination?: string;
//         clientOrigin?: string;
//       } = {};

//       // Get origin and destination from localStorage
//       try {
//         const airportsData = localStorage.getItem('skytrips_airports');
//         if (airportsData) {
//           const parsedAirports = JSON.parse(airportsData);

//           // Extract origin from fromAirport
//           if (parsedAirports.fromAirport?.code) {
//             additionalFields.origin = parsedAirports.fromAirport.code;
//           }

//           // Extract destination from toAirport
//           if (parsedAirports.toAirport?.code) {
//             additionalFields.destination = parsedAirports.toAirport.code;
//           }
//         }
//       } catch (error) {
//         console.error(
//           'Error parsing skytrips_airports from localStorage:',
//           error
//         );
//       }

//       // Get clientOrigin from browser URL
//       if (typeof window !== 'undefined' && window.location.origin) {
//         additionalFields.clientOrigin = window.location.origin;
//       }

//       // Get Best Value data from localStorage
//       let bestValueData = null;
//       try {
//         const storedBestValue = localStorage.getItem(
//           'skytrips_best_value_booking'
//         );
//         if (storedBestValue) {
//           bestValueData = JSON.parse(storedBestValue);
//         }
//       } catch (error) {
//         console.error(
//           'Error reading Best Value data from localStorage:',
//           error
//         );
//       }

//       // Prepare booking payload based on the sample
//       const bookingPayload = {
//         priceParam: flightPriceData || {},
//         userInput: userInput,
//         passengerInput: passengerInputs.length > 0 ? passengerInputs : [],
//         travelClass:
//           flightData?.flight?.travelerPricings?.[0]?.fareDetailsBySegment?.[0]
//             ?.cabin || 'ECONOMY',
//         tripType:
//           flightData?.flight?.itineraries?.length > 1
//             ? 'ROUND_TRIP'
//             : 'ONE_WAY',
//         bookingTicketRefundableStatus: 'NON_REFUNDABLE',
//         paymentDetails: {
//           cardHolderName,
//           cardNumber,
//           expiryDate,
//           cvc,
//         },
//         ...(referralCode && { referralCode }), // Only include referralCode if it exists
//         ...additionalFields, // Include origin, destination, and clientOrigin only if they exist
//         // Add Best Value fare data if available
//         ...(bestValueData?.isManualFareApplied &&
//           bestValueData?.appliedManualFareIds && {
//             isManualFareApplied: bestValueData.isManualFareApplied,
//             appliedManualFareIds: bestValueData.appliedManualFareIds,
//           }),
//       };

//       console.log('additionalFields', additionalFields);

//       const response = await axiosInstance.post(
//         '/flight-booking',
//         JSON.stringify(bookingPayload)
//       );

//       if (response.status !== 201) {
//         toast.error(response.data.message);
//         throw new Error(`Booking failed with status: ${response.status}`);
//       }

//       const bookingResult = response.data;
//       console.log('Booking successful:', bookingResult);
//       toast.success('Flight has been reserved successfully!', {
//         id: 'booking-process',
//       });

//       // Store booking ID in ref for immediate access and state for component updates
//       const bookingId = bookingResult.data?.id;
//       bookingIdRef.current = bookingId;
//       setBookingResponse(bookingResult.data);

//       // Process payment after booking is created
//       await handlePaymentSubmit(bookingId);

//       if (response.data.success) {
//         // Clear saved form data after successful booking
//         if (formAutosaveKey) {
//           localStorage.removeItem(formAutosaveKey);
//         }
//       }
//     } catch (error) {
//       console.error('Error making booking:', error);
//       setBookingError('Failed to complete booking. Please try again.');
//       toast.error('Failed to complete booking. Please try again.', {
//         id: 'booking-process',
//       });
//       setIsLoading(false);
//     }
//   };

//   const handlePaymentSubmit = async (bookingId?: string) => {
//     try {
//       setIsLoading(true);

//       // Check if card details are empty
//       if (!cardHolderName || !cardNumber || !expiryDate || !cvc) {
//         setBookingError(
//           'Payment information is incomplete. Please enter all card details.'
//         );
//         toast.error(
//           'Payment information is incomplete. Please enter all card details.',
//           {
//             id: 'payment-validation',
//           }
//         );
//         return;
//       }

//       // Use bookingId from parameter, ref, or state, in that order of preference
//       const bookingReference =
//         bookingId || bookingIdRef.current || bookingResponse?.id;

//       // Validate booking reference
//       if (!bookingReference) {
//         console.error('Missing booking reference ID');
//         setBookingError('Booking reference is missing. Please try again.');
//         toast.error('Booking reference is missing. Please try again.', {
//           id: 'booking-reference-error',
//         });
//         return;
//       }

//       // Prepare payment payload
//       const paymentPayload = {
//         bookingReference: bookingReference,
//         card: {
//           number: cardNumber.replace(/\s/g, ''), // Remove any spaces
//           expMonth: expiryDate.split('/')[0],
//           expYear: expiryDate.split('/')[1],
//           cvc: cvc,
//           addressCity: 'San Francisco',
//           addressState: 'CA',
//         },
//       };

//       // Make payment request
//       const response = await axiosInstance.post(
//         '/flight-payment/v2/bpoint',
//         paymentPayload,
//         {
//           headers: {
//             'ama-client-ref': bookingReference,
//           },
//         }
//       );

//       if (response.status === 201) {
//         // Show success message
//         setBookingSuccess(true);
//         toast.success('Payment successful!');

//         // Update booking status in UI
//         setBookingStatus('confirmed');

//         // Store booking reference for future use
//         if (typeof window !== 'undefined') {
//           sessionStorage.setItem(
//             'skytrips_booking_reference',
//             bookingReference
//           );
//         }

//         // Clear sensitive data
//         setCardNumber('');
//         setExpiryDate('');
//         setCvc('');
//         setCardHolderName('');

//         // Update UI state
//         setPaymentStep('confirmation');
//         setShowPaymentForm(false);

//         // Redirect to confirmation page
//         router.push(`/confirmation?bookingId=${bookingReference}`);
//       } else {
//         throw new Error(response.data?.message || 'Payment failed');
//       }
//     } catch (error: any) {
//       console.error('Payment error:', error);
//       const errorMessage =
//         error.response?.data?.message ||
//         error.message ||
//         'Payment processing failed. Please try again.';
//       setBookingError(errorMessage);
//       toast.error(errorMessage, {
//         id: 'payment-process',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // const updateCardToken = async (
//   //   cardToken: string,
//   //   browserInfoValue?: string,
//   //   ipAddressValue?: string,
//   //   timeZoneValue?: string,
//   //   bookingId?: string
//   // ) => {
//   //   if (!cardToken) {
//   //     setBookingError('Payment token creation failed');
//   //     toast.error('Payment token creation failed', {
//   //       id: 'token-error',
//   //     });
//   //     setIsLoading(false);
//   //     return;
//   //   }

//   //   try {
//   //     const updateTokenPayload = {
//   //       updateTokenInput: {
//   //         browser: browserInfoValue || browserInfo,
//   //         ipAddress: ipAddressValue || ipAddress,
//   //         timeZone: timeZoneValue || timeZone,
//   //       },
//   //     };

//   //     console.log('Updating token with info:', updateTokenPayload);
//   //     // toast.info('Updating payment information...', {
//   //     //   id: 'token-update'
//   //     // });

//   //     const response = await axiosInstance.patch(
//   //       `/flight-payment/token/${cardToken}`,
//   //       JSON.stringify(updateTokenPayload)
//   //     );

//   //     console.log('Update token response:', response);

//   //     if (response?.data?.authentication?.redirectHtml) {
//   //       // Show 3D Secure iframe modal if not already shown
//   //       if (!isOpenThreedsSecureModal) {
//   //         // toast.info('3D Secure authentication required', {
//   //         //   id: '3d-secure-notice'
//   //         // });
//   //         setIsOpenThreedsSecureModal(true);

//   //         // Small delay to ensure modal is rendered
//   //         setTimeout(() => {
//   //           if (iframeRef.current) {
//   //             const redirectHtmlAfterUpdate =
//   //               response?.data.authentication?.redirectHtml;
//   //             const iframeDoc =
//   //               iframeRef.current.contentDocument ||
//   //               (iframeRef.current as any).contentWindow?.document;

//   //             if (iframeDoc) {
//   //               iframeDoc.open();
//   //               iframeDoc.write(redirectHtmlAfterUpdate);
//   //               iframeDoc.close();
//   //             }
//   //           }
//   //         }, 100);
//   //       } else {
//   //         // If modal is already open, update its content
//   //         if (iframeRef.current) {
//   //           const redirectHtmlAfterUpdate =
//   //             response?.data.authentication?.redirectHtml;
//   //           const iframeDoc =
//   //             iframeRef.current.contentDocument ||
//   //             (iframeRef.current as any).contentWindow?.document;

//   //           if (iframeDoc) {
//   //             iframeDoc.open();
//   //             iframeDoc.write(redirectHtmlAfterUpdate);
//   //             iframeDoc.close();
//   //           }
//   //         }
//   //       }

//   //       // Store token for later use
//   //       if (paymentTokenRef.current) {
//   //         (paymentTokenRef.current as any).value = cardToken;
//   //       }
//   //     } else {
//   //       // No 3D Secure needed, finalize payment
//   //       // toast.info('Finalizing payment...', {
//   //       //   id: 'payment-finalize'
//   //       // });
//   //       await finalizePayment(cardToken, bookingId);
//   //     }
//   //   } catch (error) {
//   //     console.error('Error updating payment token:', error);
//   //     setBookingError('Payment verification failed. Please try again.');
//   //     toast.error('Payment verification failed. Please try again.', {
//   //       id: 'payment-update-error',
//   //     });
//   //     setIsLoading(false);
//   //   }
//   // };

//   const finalizePayment = async (paymentToken: string, bookingId?: string) => {
//     if (!paymentToken) {
//       setBookingError('Payment token is missing');
//       toast.error('Payment token is missing', {
//         id: 'token-missing',
//       });
//       setIsLoading(false);
//       return;
//     }

//     // Use bookingId parameter, ref value, or response state, in that order
//     const finalBookingId =
//       bookingId || bookingIdRef.current || bookingResponse?.id;

//     if (!finalBookingId) {
//       console.error('Booking ID is missing for payment finalization');
//       setBookingError('Booking reference is missing. Please try again.');
//       toast.error('Booking reference is missing. Please try again.', {
//         id: 'booking-ref-missing',
//       });
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const paymentPayload = {
//         createCardPaymentInput: {
//           bookingReference: finalBookingId,
//           token: paymentToken,
//         },
//       };

//       toast.loading('Finalizing payment...', {
//         id: 'payment-finalize',
//       });

//       // Call payment completion endpoint
//       const paymentResponse = await axiosInstance.post(
//         '/flight-payment',
//         JSON.stringify(paymentPayload)
//       );

//       if (paymentResponse.status === 201 || paymentResponse.status === 200) {
//         // Set booking success
//         setBookingSuccess(true);
//         toast.success('Payment successful! Your booking is confirmed.', {
//           id: 'payment-finalize',
//         });
//       } else {
//         throw new Error(
//           'Payment failed with status: ' + paymentResponse.status
//         );
//       }
//     } catch (error) {
//       console.error('Error finalizing payment:', error);
//       setBookingError('Payment failed. Please try again.');
//       toast.error('Payment failed. Please try again.', {
//         id: 'payment-finalize',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Add listener for 3D Secure authentication completion
//   // useEffect(() => {
//   //   const handleMessage = (event: MessageEvent) => {
//   //     try {
//   //       console.log('Received message in book page:', event);

//   //       // Check if message is from Simplify domain
//   //       if (event.origin.includes('simplify.com')) {
//   //         console.log('Message from Simplify 3D Secure:', event.data);

//   //         try {
//   //           // Check for the secure3d.authenticated format
//   //           const messageData =
//   //             typeof event.data === 'string'
//   //               ? JSON.parse(event.data)
//   //               : event.data;

//   //           if (messageData?.secure3d?.authenticated === true) {
//   //             console.log(
//   //               '3D Secure authentication successful via message event'
//   //             );
//   //             toast.success('3D Secure authentication successful', {
//   //               id: 'auth-event-success',
//   //             });

//   //             // Get token and booking ID
//   //             const token = paymentTokenRef.current
//   //               ? (paymentTokenRef.current as any).value
//   //               : null;
//   //             const bookingId = bookingIdRef.current || bookingResponse?.id;

//   //             if (token) {
//   //               // Close modal and finalize payment
//   //               setIsOpenThreedsSecureModal(false);
//   //               finalizePayment(token, bookingId);
//   //             }
//   //           }
//   //         } catch (parseError) {
//   //           console.error('Error parsing message data:', parseError);
//   //           toast.error('Error processing authentication response', {
//   //             id: 'parse-error',
//   //           });
//   //         }
//   //       }
//   //     } catch (error) {
//   //       console.error('Error processing message:', error);
//   //       toast.error('Error processing authentication message', {
//   //         id: 'message-error',
//   //       });
//   //     }
//   //   };

//   //   window.addEventListener('message', handleMessage);
//   //   return () => {
//   //     window.removeEventListener('message', handleMessage);
//   //   };
//   // }, [bookingResponse]);

//   // Function to check iframe content for authentication success
//   const handleIframeLoad = () => {
//     try {
//       console.log('3D Secure iframe loaded/reloaded');
//       // toast.info('3D Secure verification loaded', {
//       //   id: '3d-secure-load'
//       // });

//       const outerIframe = iframeRef.current;
//       if (!outerIframe) return;

//       // Try to access the iframe's content
//       try {
//         // Access the document of the outer iframe
//         const outerDoc =
//           outerIframe.contentDocument || outerIframe.contentWindow?.document;

//         if (outerDoc) {
//           // Check for any inner iframes that might be present
//           const innerIframe = outerDoc.querySelector('iframe');
//           if (innerIframe) {
//             // Improve the styling of inner iframe if present
//             innerIframe.style.width = '100%';
//             innerIframe.style.minHeight = '300px';
//             innerIframe.style.border = 'none';
//           }

//           // Add a message event listener directly to the iframe's content window
//           // This is more reliable for cross-origin communication
//           if (outerIframe.contentWindow) {
//             outerIframe.contentWindow.addEventListener(
//               'message',
//               (event: MessageEvent) => {
//                 try {
//                   console.log('Message received directly in iframe:', event);

//                   if (event.origin.includes('simplify.com')) {
//                     const messageData =
//                       typeof event.data === 'string'
//                         ? JSON.parse(event.data)
//                         : event.data;

//                     if (messageData?.secure3d?.authenticated === true) {
//                       console.log(
//                         '3D Secure authentication successful via iframe message'
//                       );
//                       toast.success(
//                         '3D Secure authentication completed successfully',
//                         {
//                           id: '3d-secure-success',
//                         }
//                       );

//                       // Get token and booking ID
//                       const token = paymentTokenRef.current
//                         ? (paymentTokenRef.current as any).value
//                         : null;
//                       const bookingId =
//                         bookingIdRef.current || bookingResponse?.id;

//                       if (token && isOpenThreedsSecureModal) {
//                         console.log('Success phrase found, finalizing payment');
//                         setIsOpenThreedsSecureModal(false);
//                         finalizePayment(token, bookingId);
//                         return;
//                       }
//                     }
//                   }
//                 } catch (error) {
//                   console.error('Error handling iframe message:', error);
//                 }
//               }
//             );
//           }

//           // Check for completion text as a fallback
//           const bodyText = outerDoc.body.textContent || '';

//           // Check if body text contains any of the success phrases
//           const successPhrases = [
//             'completing payment',
//             'authentication successful',
//             'payment authorized',
//             'payment completed',
//             'transaction approved',
//             'verification successful',
//             'payment being processed',
//             'card has been verified',
//             'authentication complete',
//             'return to merchant',
//             'redirecting to merchant',
//             'thank you for your payment',
//             'redirecting',
//           ];

//           // Check if any success phrase is in the body text
//           const hasSuccessPhrase = successPhrases.some((phrase) =>
//             bodyText.toLowerCase().includes(phrase.toLowerCase())
//           );

//           // If success phrase found, finalize payment
//           if (hasSuccessPhrase) {
//             console.log('Detected success phrase in 3D Secure iframe');
//             toast.success('Payment verification successful', {
//               id: 'payment-verification',
//             });

//             // Get token and booking ID
//             const token = paymentTokenRef.current
//               ? (paymentTokenRef.current as any).value
//               : null;
//             const bookingId = bookingIdRef.current || bookingResponse?.id;

//             if (token && isOpenThreedsSecureModal) {
//               console.log('Success phrase found, finalizing payment');
//               setIsOpenThreedsSecureModal(false);
//               finalizePayment(token, bookingId);
//               return;
//             }
//           }

//           // If OTP verification is detected
//           if (
//             bodyText.includes('verification code') ||
//             bodyText.includes('one-time password') ||
//             bodyText.includes('otp')
//           ) {
//             toast.info('Please complete the verification to continue', {
//               id: 'otp-verification',
//             });
//           }

//           // If processing is detected but no success phrase, set fallback timer
//           if (
//             !hasSuccessPhrase &&
//             (bodyText.toLowerCase().includes('processing') ||
//               bodyText.toLowerCase().includes('verifying'))
//           ) {
//             console.log('Payment processing detected, setting fallback timer');
//             // toast.info('Completing payment verification...', {
//             //   id: 'payment-verification-progress'
//             // });

//             // Set a fallback timer
//             setTimeout(() => {
//               const token = paymentTokenRef.current
//                 ? (paymentTokenRef.current as any).value
//                 : null;
//               const bookingId = bookingIdRef.current || bookingResponse?.id;

//               if (token && isOpenThreedsSecureModal) {
//                 console.log(
//                   'Fallback timer completing 3D Secure authentication'
//                 );
//                 // toast.success('3D Secure verification completed', {
//                 //   id: 'payment-verification-complete'
//                 // });
//                 setIsOpenThreedsSecureModal(false);
//                 finalizePayment(token, bookingId);
//               }
//             }, 3000);
//           }
//         }
//       } catch (accessError) {
//         console.log(
//           'Cannot access iframe content due to cross-origin restrictions:',
//           accessError
//         );
//       }
//     } catch (error) {
//       console.error('Error in iframe load handler:', error);
//       toast.error('Error loading 3D Secure verification', {
//         id: 'iframe-error',
//       });
//     }
//   };

//   // Function to handle contact details form changes when no primary contact
//   const handleContactDetailsChange = (
//     field: string,
//     value: string,
//     elementId: string
//   ) => {
//     // Make a copy of the current contact details
//     const updatedContactDetails = { ...contactInfo };

//     // Update the field value
//     if (field === 'phoneNumber') {
//       updatedContactDetails.phone = value;
//     } else if (field === 'countryCode') {
//       updatedContactDetails.phoneCountryCode = value;
//     } else if (field === 'email') {
//       updatedContactDetails.email = value;
//     } else {
//       // Type assertion to ensure field is a valid key
//       (updatedContactDetails as any)[field] = value;
//     }

//     // Save the active element id
//     saveActiveElement(elementId);

//     // Update the state
//     setContactInfo(updatedContactDetails);

//     // Clear validation errors for this field when user starts typing
//     if (field === 'email' || field === 'phone' || field === 'phoneNumber') {
//       setFormErrors((prevErrors) => {
//         // If contactInfo doesn't exist in errors, return unchanged
//         if (!prevErrors.contactInfo) return prevErrors;

//         const updatedContactErrors = { ...prevErrors.contactInfo };
//         if (field === 'email') {
//           delete updatedContactErrors.email;
//         } else if (field === 'phone' || field === 'phoneNumber') {
//           delete updatedContactErrors.phone;
//         }

//         return {
//           ...prevErrors,
//           contactInfo: updatedContactErrors,
//         };
//       });
//     }
//   };

//   // Function to format date for display in the date picker input
//   const formatDateForInput = (dateString: string): string => {
//     if (!dateString) return '';

//     // If already in YYYY-MM-DD format, return as is
//     if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
//       return dateString;
//     }

//     // Try to parse and format the date
//     try {
//       // Handle different date formats more reliably
//       let date: Date;

//       // If the date string contains 'T' (ISO format), split at T to avoid timezone issues
//       if (dateString.includes('T')) {
//         const datePart = dateString.split('T')[0];
//         if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
//           return datePart; // Already in correct format
//         }
//       }

//       // For dates like "1999-01-01" or "2030-02-02", parse directly
//       if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
//         return dateString;
//       }

//       // For other formats, use Date constructor but handle timezone carefully
//       date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues

//       if (isNaN(date.getTime())) {
//         // Fallback: try without time
//         date = new Date(dateString);
//         if (isNaN(date.getTime())) return '';
//       }

//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');

//       return `${year}-${month}-${day}`;
//     } catch (e) {
//       return '';
//     }
//   };

//   // Function to get max date for date of birth (today)
//   const getMaxDateForDOB = (): string => {
//     const today = new Date();
//     // Use local date to avoid timezone issues
//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, '0');
//     const day = String(today.getDate()).padStart(2, '0');

//     return `${year}-${month}-${day}`;
//   };

//   // Function to get min date for passport expiry (tomorrow)
//   const getMinDateForPassportExpiry = (): string => {
//     const today = new Date();
//     // Add one day to get tomorrow
//     const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

//     const year = tomorrow.getFullYear();
//     const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
//     const day = String(tomorrow.getDate()).padStart(2, '0');

//     return `${year}-${month}-${day}`;
//   };

//   // Toggle itinerary expansion
//   const toggleFlightDetails = () => {
//     setExpandedItineraries((prev) => {
//       if (prev.length > 0) {
//         return []; // Hide all
//       } else {
//         // Show all itineraries
//         return (
//           flightData?.flight?.itineraries?.map((_: any, i: number) => i) || []
//         );
//       }
//     });
//   };

//   // Passenger form component to avoid duplication
//   const PassengerForm = ({
//     passengerType,
//     index,
//   }: {
//     passengerType: string;
//     index: number;
//   }) => {
//     const isExpanded = expandedPassenger === index;
//     const isPrimaryContact = primaryContactIndex === index;
//     const canBePrimaryContact = passengerType === 'Adult'; // Only adults can be primary contacts
//     const passenger = passengerFormData[index] || {};
//     const passengerErrors = formErrors[index] || {};
//     const contactErrors = formErrors.contactInfo || {};

//     // Helper function to determine field error UI
//     const getFieldErrorClass = (
//       field: string,
//       formType: 'passenger' | 'contact' = 'passenger'
//     ) => {
//       if (!showValidationErrors) return '';

//       const errors = formType === 'passenger' ? passengerErrors : contactErrors;
//       return errors[field] ? 'border-red-500' : 'border-green-500';
//     };

//     console.log('flightData', flightData);

//     return (
//       <div
//         className={`py-3 px-5 ${
//           index < passengerFormData.length - 1 ? 'border-b border-gray-200' : ''
//         }`}
//       >
//         <div
//           className="flex justify-between items-center  cursor-pointer"
//           onClick={() => togglePassengerExpanded(index)}
//         >
//           <h3 className="title-t4 text-background-on">Passenger {index + 1}</h3>
//           <div className="flex items-center label-l2 text-primary">
//             <span>{passengerType}</span>
//             <svg
//               className={`w-4 h-4 ml-1 transition-transform ${
//                 isExpanded ? 'rotate-180' : ''
//               }`}
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M19 9l-7 7-7-7"
//               ></path>
//             </svg>
//           </div>
//         </div>

//         {isExpanded && (
//           <div className="mb-5 mt-5 border-t pt-5">
//             <div className="flex flex-row align-center justify-between -mx-2 mb-4">
//               {/* Passenger Type Selector - only show for adults and if user is authenticated */}
//               {canBePrimaryContact && (
//                 <div className="flex items-center mb-4">
//                   <input
//                     type="checkbox"
//                     id={`primaryContact-${index}`}
//                     className="mr-2"
//                     checked={isPrimaryContact}
//                     onChange={() => setPrimaryContact(index)}
//                   />
//                   <label
//                     htmlFor={`primaryContact-${index}`}
//                     className="label-l2 text-background-on"
//                   >
//                     This passenger is the primary booking contact
//                   </label>
//                 </div>
//               )}
//               {/* Combined passenger selection dropdown - show for ALL passenger types when user is authenticated */}
//               {userData && (
//                 <div className="mb-4 ml-auto">
//                   <CustomSelectField
//                     // label={`Select passenger (${passengerType})`}
//                     options={[
//                       { value: '', label: 'Select a passenger' },
//                       // Add "Yourself" option only for Adults with firstName
//                       ...(canBePrimaryContact && userData.firstName
//                         ? [
//                             {
//                               value: 'yourself',
//                               label: `Yourself (${userData.firstName} ${userData.lastName})`,
//                             },
//                           ]
//                         : []),
//                       // Add saved passengers
//                       ...relationshipsList.map((passenger) => {
//                         // Calculate age if DOB is available
//                         let ageText = '';
//                         if (passenger.dateOfBirth) {
//                           const birthDate = new Date(passenger.dateOfBirth);
//                           const today = new Date();
//                           let age =
//                             today.getFullYear() - birthDate.getFullYear();
//                           const monthDiff =
//                             today.getMonth() - birthDate.getMonth();

//                           if (
//                             monthDiff < 0 ||
//                             (monthDiff === 0 &&
//                               today.getDate() < birthDate.getDate())
//                           ) {
//                             age--;
//                           }
//                           ageText = `, ${age} years`;
//                         }

//                         return {
//                           value: passenger.id,
//                           label: `${passenger.firstName} ${passenger.lastName}${ageText}`,
//                         };
//                       }),
//                       // Show loading/empty state messages
//                       ...(relationshipsList.length === 0 &&
//                       !isRelationshipsLoading
//                         ? [
//                             {
//                               value: '',
//                               label: 'No saved passengers found',
//                               disabled: true,
//                             },
//                           ]
//                         : []),
//                       ...(isRelationshipsLoading
//                         ? [
//                             {
//                               value: '',
//                               label: 'Loading passengers...',
//                               disabled: true,
//                             },
//                           ]
//                         : []),
//                     ]}
//                     value=""
//                     onChange={(value) => {
//                       if (value === 'yourself') {
//                         autoFillWithUserData(index);
//                       } else if (value && relationshipsList.length > 0) {
//                         autoFillWithRelationshipData(index, value);
//                       }
//                     }}
//                     fullWidth
//                     disabled={isRelationshipsLoading}
//                   />
//                   {/* Age guidance for different passenger types */}
//                   {/* <div className="label-l3 text-neutral-dark mt-1">
//                     {passengerType === 'Infant' && (
//                       <span>💡 Infants must be under 2 years old</span>
//                     )}
//                     {passengerType === 'Child' && (
//                       <span>💡 Children must be between 2-12 years old</span>
//                     )}
//                     {passengerType === 'Adult' && (
//                       <span>💡 Adults must be 12 years or older</span>
//                     )}
//                   </div> */}
//                 </div>
//               )}
//             </div>

//             <div className="flex flex-wrap -mx-2 mb-4">
//               <div className="w-full md:w-[90px] px-2 mb-4 ">
//                 <CustomSelectField
//                   label="Title"
//                   options={[
//                     { value: 'Mr', label: 'Mr.' },
//                     { value: 'Mrs', label: 'Mrs.' },
//                     { value: 'Ms', label: 'Ms.' },
//                   ]}
//                   value={passenger.title || 'Mr'}
//                   onChange={(value) =>
//                     handlePassengerFormChange(
//                       index,
//                       'title',
//                       value,
//                       `passenger-${index}-title`
//                     )
//                   }
//                   fullWidth
//                 />
//               </div>

//               <div className="w-full md:flex-1 px-2 mb-4">
//                 <CustomTextField
//                   label="First Name"
//                   id={`passenger-${index}-firstName`}
//                   value={passenger.firstName || ''}
//                   onChange={(e) =>
//                     handlePassengerFormChange(
//                       index,
//                       'firstName',
//                       e.target.value,
//                       e.target.id
//                     )
//                   }
//                   required
//                   fullWidth
//                   error={showValidationErrors && !!passengerErrors.firstName}
//                   errorMessage={passengerErrors.firstName}
//                 />
//               </div>

//               <div className="w-full md:flex-1 px-2 mb-4">
//                 <CustomTextField
//                   label="Middle name"
//                   id={`passenger-${index}-middleName`}
//                   value={passenger.middleName || ''}
//                   onChange={(e) =>
//                     handlePassengerFormChange(
//                       index,
//                       'middleName',
//                       e.target.value,
//                       e.target.id
//                     )
//                   }
//                   fullWidth
//                 />
//               </div>

//               <div className="w-full md:flex-1 px-2 mb-4">
//                 <CustomTextField
//                   label="Last Name"
//                   id={`passenger-${index}-lastName`}
//                   value={passenger.lastName || ''}
//                   onChange={(e) =>
//                     handlePassengerFormChange(
//                       index,
//                       'lastName',
//                       e.target.value,
//                       e.target.id
//                     )
//                   }
//                   required
//                   fullWidth
//                   error={showValidationErrors && !!passengerErrors.lastName}
//                   errorMessage={passengerErrors.lastName}
//                 />
//               </div>
//             </div>

//             <div className="flex flex-wrap -mx-2 mb-4">
//               <div className="w-full md:w-1/2 px-2 mb-4">
//                 <CustomSelectField
//                   label="Gender"
//                   options={[
//                     { value: 'MALE', label: 'Male' },
//                     { value: 'FEMALE', label: 'Female' },
//                     { value: 'UNSPECIFIED', label: 'Other' },
//                   ]}
//                   value={passenger.gender || 'MALE'}
//                   onChange={(value) =>
//                     handlePassengerFormChange(
//                       index,
//                       'gender',
//                       value,
//                       `passenger-${index}-gender`
//                     )
//                   }
//                   fullWidth
//                 />
//               </div>

//               <div className="w-full md:w-1/2 px-2 mb-4">
//                 <CustomDatePicker
//                   label="Date of Birth"
//                   id={`passenger-${index}-dob`}
//                   value={formatDateForInput(passenger.dob || '')}
//                   onChange={(e) =>
//                     handlePassengerFormChange(
//                       index,
//                       'dob',
//                       e.target.value,
//                       e.target.id
//                     )
//                   }
//                   maxDate={getMaxDateForDOB()}
//                   required
//                   fullWidth
//                   error={showValidationErrors && !!passengerErrors.dob}
//                   errorMessage={passengerErrors.dob}
//                 />
//               </div>
//             </div>

//             {/* Show contact information if this passenger is the primary contact */}
//             {isPrimaryContact && (
//               <div className="flex flex-wrap -mx-2 mb-4">
//                 <div className="w-full md:w-1/2 px-2 mb-4">
//                   <CustomTextField
//                     label="Email"
//                     id="primary-email"
//                     type="email"
//                     value={contactInfo.email}
//                     onChange={(e) =>
//                       handleContactInfoChange(
//                         'email',
//                         e.target.value,
//                         e.target.id
//                       )
//                     }
//                     required
//                     fullWidth
//                     error={showValidationErrors && !!contactErrors.email}
//                     errorMessage={contactErrors.email}
//                   />
//                 </div>

//                 <div className="w-full md:w-1/2 px-2 mb-4">
//                   <CustomTextField
//                     label="Contact Number"
//                     id="primary-phone"
//                     isPhoneNumber={true}
//                     countryCode={contactInfo.phoneCountryCode || '+61'}
//                     onCountryCodeChange={(code) =>
//                       handleContactInfoChange(
//                         'phoneCountryCode',
//                         code,
//                         'primary-phoneCountry'
//                       )
//                     }
//                     value={contactInfo.phone}
//                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
//                       const value = e.target.value;
//                       handleContactInfoChange('phone', value, 'primary-phone');
//                     }}
//                     required
//                     fullWidth
//                     error={showValidationErrors && !!contactErrors.phone}
//                     errorMessage={contactErrors.phone}
//                   />
//                 </div>
//               </div>
//             )}

//             {passengerType !== 'Infant' && (
//               <div className="flex flex-wrap -mx-2 mb-4">
//                 <div className="w-full md:w-1/3 px-2 mb-4">
//                   <CustomTextField
//                     label="Passport Number"
//                     id={`passenger-${index}-passportNumber`}
//                     value={passenger.passportNumber || ''}
//                     onChange={(e) =>
//                       handlePassengerFormChange(
//                         index,
//                         'passportNumber',
//                         e.target.value,
//                         e.target.id
//                       )
//                     }
//                     placeholder="Ex: PA47854102"
//                     required
//                     fullWidth
//                     error={
//                       showValidationErrors && !!passengerErrors.passportNumber
//                     }
//                     errorMessage={passengerErrors.passportNumber}
//                   />
//                 </div>

//                 <div className="w-full md:w-1/3 px-2 mb-4">
//                   <CustomSelectField
//                     label="Issued Country"
//                     required
//                     options={countryOptions}
//                     value={passenger.passportCountry || ''}
//                     onChange={(value) =>
//                       handlePassengerFormChange(
//                         index,
//                         'passportCountry',
//                         value,
//                         `passenger-${index}-passportCountry`
//                       )
//                     }
//                     fullWidth
//                     error={
//                       showValidationErrors && !!passengerErrors.passportCountry
//                     }
//                     errorMessage={passengerErrors.passportCountry}
//                   />
//                 </div>

//                 <div className="w-full md:w-1/3 px-2 mb-4">
//                   <CustomDatePicker
//                     label="Passport Expiry Date"
//                     id={`passenger-${index}-passportExpiry`}
//                     value={formatDateForInput(passenger.passportExpiry || '')}
//                     onChange={(e) =>
//                       handlePassengerFormChange(
//                         index,
//                         'passportExpiry',
//                         e.target.value,
//                         e.target.id
//                       )
//                     }
//                     minDate={getMinDateForPassportExpiry()}
//                     required
//                     fullWidth
//                     error={
//                       showValidationErrors && !!passengerErrors.passportExpiry
//                     }
//                     errorMessage={passengerErrors.passportExpiry}
//                   />
//                 </div>
//               </div>
//             )}

//             {passengerType === 'Infant' && (
//               <div className="flex flex-wrap -mx-2 mb-4">
//                 <div className="w-full px-2 mb-4">
//                   <label className="block text-sm text-gray-600 mb-1">
//                     Traveling with Adult
//                   </label>
//                   <select
//                     id={`passenger-${index}-travelingWithAdult`}
//                     className="w-full p-2.5 border border-gray-300 rounded text-sm focus:border-blue-900 focus:outline-none"
//                     value={passenger.travelingWithAdult || 0}
//                     onChange={(e) =>
//                       handlePassengerFormChange(
//                         index,
//                         'travelingWithAdult',
//                         e.target.value,
//                         e.target.id
//                       )
//                     }
//                   >
//                     {Array(Number(adultCount))
//                       .fill(0)
//                       .map((_, i) => (
//                         <option key={`adult-${i}`} value={i}>
//                           Adult {i + 1}
//                         </option>
//                       ))}
//                   </select>
//                 </div>
//               </div>
//             )}

//             {/* <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 id={`wheelchair-${index}`}
//                 className="mr-2"
//                 checked={needWheelchair}
//                 onChange={() => setNeedWheelchair(!needWheelchair)}
//               />
//               <label htmlFor={`wheelchair-${index}`} className="text-sm">
//                 I require Wheelchair(Optional)
//               </label>
//             </div> */}
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Handle card holder name change
//   const handleCardHolderNameChange = (value: string) => {
//     setCardHolderName(value);

//     // Only validate if showValidationErrors is true (after first submit attempt)
//     if (showValidationErrors) {
//       if (!value) {
//         setPaymentErrors((prev) => ({
//           ...prev,
//           cardHolderName: "Cardholder's name is required",
//         }));
//       } else if (value.length < 3) {
//         setPaymentErrors((prev) => ({
//           ...prev,
//           cardHolderName: 'Please enter a valid name',
//         }));
//       } else {
//         setPaymentErrors((prev) => ({ ...prev, cardHolderName: undefined }));
//       }
//     }
//   };

//   // Handle card number change
//   const handleCardNumberChange = (value: string) => {
//     // Only allow digits
//     const onlyDigits = value.replace(/\D/g, '');
//     setCardNumber(onlyDigits);

//     // Only validate if showValidationErrors is true
//     if (showValidationErrors) {
//       if (!onlyDigits) {
//         setPaymentErrors((prev) => ({
//           ...prev,
//           cardNumber: 'Card number is required',
//         }));
//       } else if (onlyDigits.length !== 16) {
//         setPaymentErrors((prev) => ({
//           ...prev,
//           cardNumber: 'Card number must be 16 digits',
//         }));
//       } else {
//         setPaymentErrors((prev) => ({ ...prev, cardNumber: undefined }));
//       }
//     }
//   };

//   // Handle expiry date change
//   const handleExpiryDateChange = (value: string) => {
//     // Format input as MM/YY
//     let formatted = value.replace(/\D/g, '');

//     if (formatted.length > 2) {
//       formatted = `${formatted.slice(0, 2)}/${formatted.slice(2, 4)}`;
//     }

//     setExpiryDate(formatted);

//     // Only validate if showValidationErrors is true
//     if (showValidationErrors) {
//       if (!formatted) {
//         setPaymentErrors((prev) => ({
//           ...prev,
//           expiryDate: 'Expiry date is required',
//         }));
//       } else if (!/^\d{2}\/\d{2}$/.test(formatted)) {
//         setPaymentErrors((prev) => ({
//           ...prev,
//           expiryDate: 'Complete expiry date (MM/YY)',
//         }));
//       } else {
//         const [month, year] = formatted.split('/');
//         const expiryMonth = parseInt(month, 10);
//         const expiryYear = parseInt(year, 10) + 2000;

//         const now = new Date();
//         const currentMonth = now.getMonth() + 1;
//         const currentYear = now.getFullYear();

//         if (expiryMonth < 1 || expiryMonth > 12) {
//           setPaymentErrors((prev) => ({
//             ...prev,
//             expiryDate: 'Invalid month',
//           }));
//         } else if (
//           expiryYear < currentYear ||
//           (expiryYear === currentYear && expiryMonth < currentMonth)
//         ) {
//           setPaymentErrors((prev) => ({
//             ...prev,
//             expiryDate: 'Card has expired',
//           }));
//         } else {
//           setPaymentErrors((prev) => ({ ...prev, expiryDate: undefined }));
//         }
//       }
//     }
//   };

//   // Handle CVC change
//   const handleCvcChange = (value: string) => {
//     // Only allow digits
//     const onlyDigits = value.replace(/\D/g, '');
//     setCvc(onlyDigits);

//     // Only validate if showValidationErrors is true
//     if (showValidationErrors) {
//       if (!onlyDigits) {
//         setPaymentErrors((prev) => ({ ...prev, cvc: 'CVC is required' }));
//       } else if (onlyDigits.length < 3) {
//         setPaymentErrors((prev) => ({ ...prev, cvc: 'CVC must be 3 digits' }));
//       } else {
//         setPaymentErrors((prev) => ({ ...prev, cvc: undefined }));
//       }
//     }
//   };

//   useEffect(() => {
//     // Function to add form submit listeners to iframe content
//     const addFormSubmitListeners = () => {
//       if (iframeRef.current) {
//         try {
//           const iframe = iframeRef.current;
//           const iframeDoc =
//             iframe.contentDocument || iframe.contentWindow?.document;

//           if (iframeDoc) {
//             // Find all forms in the iframe
//             const forms = iframeDoc.forms;

//             // Add submit listeners to all forms
//             for (let i = 0; i < forms.length; i++) {
//               const form = forms[i];
//               form.addEventListener('submit', (e) => {
//                 console.log('3D Secure form submission detected', form.action);

//                 // Check if this is the form for OTP verification
//                 if (
//                   form.action &&
//                   form.action.includes('simplify.com/commerce/emvSecure3d')
//                 ) {
//                   console.log('3D Secure OTP verification form submitted');

//                   // Set a timer to finalize payment after form submission
//                   // This allows time for the form to be processed
//                   setTimeout(() => {
//                     const token = paymentTokenRef.current
//                       ? (paymentTokenRef.current as any).value
//                       : null;
//                     const bookingId =
//                       bookingIdRef.current || bookingResponse?.id;

//                     if (token && isOpenThreedsSecureModal) {
//                       console.log(
//                         'Finalizing payment after OTP form submission'
//                       );
//                       setIsOpenThreedsSecureModal(false);
//                       finalizePayment(token, bookingId);
//                     }
//                   }, 5000);
//                 }
//               });
//             }

//             console.log(
//               `Added submit listeners to ${forms.length} forms in 3D Secure iframe`
//             );
//           }
//         } catch (error) {
//           console.log(
//             'Cannot access iframe forms due to cross-origin restrictions:',
//             error
//           );
//         }
//       }
//     };

//     // Add listeners whenever the modal is open
//     if (isOpenThreedsSecureModal) {
//       // Small delay to ensure the iframe content is loaded
//       const timer = setTimeout(() => {
//         addFormSubmitListeners();
//       }, 1000);

//       return () => {
//         clearTimeout(timer);
//       };
//     }
//   }, [isOpenThreedsSecureModal, bookingResponse]);

//   useEffect(() => {
//     // Add listener for form submissions inside the iframe
//     const detectFormSubmissions = () => {
//       if (isOpenThreedsSecureModal && iframeRef.current) {
//         try {
//           const iframe = iframeRef.current;
//           const iframeDoc =
//             iframe.contentDocument || iframe.contentWindow?.document;

//           if (iframeDoc) {
//             // Look for forms, especially those with emvSecure3d in the action
//             const forms = iframeDoc.forms;

//             for (let i = 0; i < forms.length; i++) {
//               const form = forms[i];

//               // Add submit event listener to the form
//               form.addEventListener('submit', () => {
//                 console.log('Detected form submission in 3D Secure iframe');

//                 if (form.action && form.action.includes('emvSecure3d')) {
//                   console.log(
//                     '3D Secure form submitted with action:',
//                     form.action
//                   );

//                   // Set a timer to check for authentication completion after the form is submitted
//                   setTimeout(() => {
//                     const token = paymentTokenRef.current
//                       ? (paymentTokenRef.current as any).value
//                       : null;
//                     const bookingId =
//                       bookingIdRef.current || bookingResponse?.id;

//                     if (token && isOpenThreedsSecureModal) {
//                       console.log(
//                         'Completing payment after 3D Secure form submission'
//                       );
//                       setIsOpenThreedsSecureModal(false);
//                       finalizePayment(token, bookingId);
//                     }
//                   }, 5000); // 5 second timeout to allow for processing
//                 }
//               });
//             }
//           }
//         } catch (error) {
//           console.log(
//             'Cannot access iframe forms due to cross-origin restrictions:',
//             error
//           );
//         }
//       }
//     };

//     if (isOpenThreedsSecureModal) {
//       // Wait for the iframe to be fully loaded before detecting forms
//       const timer = setTimeout(detectFormSubmissions, 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [isOpenThreedsSecureModal, bookingResponse]);

//   // Near the top of the component, add a useEffect
//   useEffect(() => {
//     if (bookingSuccess) {
//       // Store booking response data in sessionStorage for the confirmation page
//       if (bookingResponse) {
//         sessionStorage.setItem(
//           'skytrips_booking_confirmation',
//           JSON.stringify(bookingResponse)
//         );
//       }
//       router.push('/confirmation');
//     }
//   }, [bookingSuccess, router, bookingResponse]);

//   // Add a useEffect to log the data whenever expandedItineraries or dictionaries change
//   useEffect(() => {
//     if (expandedItineraries.length > 0 && flightData && flightData.flight) {
//       console.log('FlightItinerary data:', {
//         itineraries: flightData.flight.itineraries,
//         flight: flightData.flight,
//         dictionaries: dictionariesData,
//         flightDictionaries: flightData.dictionaries,
//       });
//     }
//   }, [expandedItineraries, dictionariesData, flightData]);

//   // Add a function to convert service fee using passed data
//   const convertServiceFeeWithData = async ({
//     fromCurrency,
//     toCurrency,
//     amount,
//   }: {
//     fromCurrency: string;
//     toCurrency: string;
//     amount: number;
//   }) => {
//     try {
//       const response = await axiosInstance.post('/currency-converter/convert', {
//         fromCurrency,
//         toCurrency,
//         amount,
//       });
//       if (response && response.data && response.data.convertedAmount) {
//         setConvertedServiceFee(response.data.convertedAmount);
//       } else {
//         setConvertedServiceFee(amount); // fallback
//       }
//     } catch (error) {
//       console.error('Error converting service fee:', error);
//       setConvertedServiceFee(amount); // fallback
//     }
//   };

//   // Call the function when serviceFeeData or flightData changes and both are available
//   useEffect(() => {
//     if (
//       serviceFeeData &&
//       flightData &&
//       serviceFeeData.amount &&
//       serviceFeeData.currencyCode &&
//       flightData.currencyCode
//     ) {
//       if (serviceFeeData.currencyCode !== flightData.currencyCode) {
//         console.log(
//           'Converting service fee from',
//           serviceFeeData.currencyCode,
//           'to',
//           flightData.currencyCode
//         );
//         convertServiceFeeWithData({
//           fromCurrency: serviceFeeData.currencyCode,
//           toCurrency: flightData.currencyCode,
//           amount: Number(serviceFeeData.amount),
//         });
//       } else {
//         setConvertedServiceFee(Number(serviceFeeData.amount));
//       }
//     }
//   }, [serviceFeeData, flightData]);

//   console.log('convertedServiceFee', convertedServiceFee);

//   // Add effect to generate unique form autosave key based on flight data
//   useEffect(() => {
//     if (flightData?.flight) {
//       // Create a unique key based on flight details
//       // Always use the same key for form autosave
//       const key = 'skytrips_form_autosave_1';
//       setFormAutosaveKey(key);

//       // Try to restore saved form data
//       const savedFormData = localStorage.getItem(key);
//       if (savedFormData) {
//         try {
//           const parsedData = JSON.parse(savedFormData);

//           // Get current passenger count
//           const adultCount =
//             flightData?.travelers?.adults || flightData?.adults || 1;
//           const childCount =
//             flightData?.travelers?.children || flightData?.children || 0;
//           const infantCount =
//             flightData?.travelers?.infants || flightData?.infants || 0;
//           const totalPassengers =
//             Number(adultCount) + Number(childCount) + Number(infantCount);

//           // Only take the number of passengers we need from saved data
//           const limitedPassengerData = parsedData.passengerData.slice(
//             0,
//             totalPassengers
//           );

//           setPassengerFormData(limitedPassengerData);
//           setContactInfo(parsedData.contactInfo);
//           setPrimaryContactIndex(
//             parsedData.primaryContactIndex >= totalPassengers
//               ? -1
//               : parsedData.primaryContactIndex
//           );
//         } catch (error) {
//           console.error('Error parsing saved form data:', error);
//         }
//       }
//     }
//   }, [flightData?.flight]);

//   // Add effect to save form data when it changes
//   useEffect(() => {
//     if (
//       formAutosaveKey &&
//       (passengerFormData.length > 0 || contactInfo.email || contactInfo.phone)
//     ) {
//       const dataToSave = {
//         passengerData: passengerFormData,
//         contactInfo: contactInfo,
//         primaryContactIndex: primaryContactIndex,
//         timestamp: Date.now(),
//       };
//       localStorage.setItem(formAutosaveKey, JSON.stringify(dataToSave));
//     }
//   }, [formAutosaveKey, passengerFormData, contactInfo, primaryContactIndex]); // Add primaryContactIndex to dependencies

//   // Add cleanup on component unmount if booking was successful
//   useEffect(() => {
//     return () => {
//       if (bookingSuccess && formAutosaveKey) {
//         localStorage.removeItem(formAutosaveKey);
//       }
//     };
//   }, [bookingSuccess, formAutosaveKey]);

//   return (
//     <>
//       <NextSeo
//         title="SkyTrips | Book Cheap Flights to Nepal"
//         description="Book affordable flights to Nepal with SkyTrips. Compare fares, find the best deals, and enjoy secure booking options. Fly to Kathmandu today!"
//         canonical="https://skytrips.com.au/"
//         openGraph={{
//           url: 'https://skytrips.com.au/',
//           title: 'SkyTrips | Book Cheap Flights to Nepal',
//           description:
//             'Book affordable flights to Nepal with SkyTrips. Compare fares, find the best deals, and enjoy secure booking options. Fly to Kathmandu today!',
//           images: [
//             {
//               url: 'https://skytrips.com.au/assets/og/skytrips-og.png',
//               width: 1200,
//               height: 630,
//               alt: 'SkyTrips',
//             },
//           ],
//           site_name: 'SkyTrips',
//         }}
//       />
//       <Navbar />
//       <div className="container mx-auto mt-5">
//         {!bookingSuccess && (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//             {/* Left Column - Flight Details */}
//             <div className="lg:col-span-2 ">
//               {/* Single collapsible flight summary section */}
//               {flightData?.flight?.itineraries &&
//                 flightData.flight.itineraries.length > 0 && (
//                   <div className="mb-3 md:mb-5">
//                     {/* Flight summary header - always visible */}
//                     <div className="flex justify-between items-center mb-5 bg-white rounded-md px-4 py-2">
//                       <div>
//                         <h2 className="h5 text-background-on pb-1">
//                           {(() => {
//                             // Get first departure from first itinerary's first segment
//                             const firstDeparture =
//                               flightData.flight.itineraries[0]?.segments[0]
//                                 ?.departure?.iataCode || 'Origin';

//                             // Get last arrival from first itinerary's last segment
//                             const firstItinerary =
//                               flightData.flight.itineraries[0];
//                             const lastSegment =
//                               firstItinerary?.segments[
//                                 firstItinerary.segments.length - 1
//                               ];
//                             const lastArrival =
//                               lastSegment?.arrival?.iataCode || 'Destination';

//                             // Use bidirectional arrow for round trips, unidirectional for one-way
//                             const isRoundTrip =
//                               flightData.flight.itineraries.length > 1;
//                             const arrow = isRoundTrip ? ' ↔ ' : ' → ';

//                             // Look up city names from IATA codes
//                             const findCity = (iataCode: string) => {
//                               const airport = airports.find(
//                                 (a) => a.IATA === iataCode
//                               );
//                               return airport?.city || '';
//                             };

//                             const departureCity = findCity(firstDeparture);
//                             const arrivalCity = findCity(lastArrival);

//                             // Format as BKK (Bangkok) â†” JFK (New York)
//                             return `${firstDeparture}${
//                               departureCity ? ` (${departureCity})` : ''
//                             }${arrow}${lastArrival}${
//                               arrivalCity ? ` (${arrivalCity})` : ''
//                             }`;
//                           })()}
//                         </h2>
//                         <div className="bg-[#F1F2FF] px-2.5 py-0.5 rounded-full inline-block w-fit">
//                           <p className="label-l3 text-neutral-dark ">
//                             {(() => {
//                               const firstSegment =
//                                 flightData.flight.itineraries[0]?.segments[0];
//                               if (!firstSegment?.departure?.at) return '';

//                               const departureDate = new Date(
//                                 firstSegment.departure.at
//                               );
//                               return (
//                                 departureDate.toLocaleDateString('en-US', {
//                                   weekday: 'long',
//                                   month: 'long',
//                                   day: 'numeric',
//                                   year: 'numeric',
//                                 }) +
//                                 ' at ' +
//                                 departureDate.toLocaleTimeString('en-US', {
//                                   hour: '2-digit',
//                                   minute: '2-digit',
//                                   hour12: false,
//                                 })
//                               );
//                             })()}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center">
//                         {/* <span className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1 rounded mr-3">
//                           Non Refundable
//                         </span> */}
//                         <button
//                           className="text-primary label-l2 flex items-center "
//                           onClick={toggleFlightDetails}
//                         >
//                           {expandedItineraries.length > 0
//                             ? 'Hide Details'
//                             : 'View Full Itinerary'}
//                           <svg
//                             className={`ml-1 w-4 h-4 transition-transform ${
//                               expandedItineraries.length > 0 ? 'rotate-180' : ''
//                             }`}
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                             xmlns="http://www.w3.org/2000/svg"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth="2"
//                               d="M19 9l-7 7-7-7"
//                             ></path>
//                           </svg>
//                         </button>
//                       </div>
//                     </div>

//                     {/* Compact flight summary when collapsed - showing all legs */}

//                     {/* Debug log before rendering FlightItinerary */}
//                     {expandedItineraries.length > 0 &&
//                       flightData &&
//                       flightData.flight &&
//                       console.log('FlightItinerary data:', {
//                         itineraries: flightData.flight.itineraries,
//                         flight: flightData.flight,
//                         dictionaries: dictionariesData,
//                         flightDictionaries: flightData.dictionaries,
//                       })}
//                     {/* Detailed flight segments when expanded */}
//                     {expandedItineraries.length > 0 && (
//                       <div className="bg-white shadow-sm rounded p-4 flight-itinerary-container">
//                         <FlightItinerary
//                           key={`flight-itinerary-${new Date().getTime()}`}
//                           itineraries={flightData.flight.itineraries}
//                           formatDuration={formatDuration}
//                           getTransitTime={getTransitTime}
//                           flight={{
//                             ...flightData.flight,
//                             dictionaries: {
//                               ...flightData.flight.dictionaries,
//                               carriers: {
//                                 ...(flightData.flight.dictionaries?.carriers ||
//                                   {}),
//                                 ...(dictionariesData?.carriers || {}),
//                                 ...(flightData.dictionaries?.carriers || {}),
//                               },
//                             },
//                           }}
//                           apiData={{
//                             ...flightData,
//                             dictionaries: {
//                               ...flightData.dictionaries,
//                               ...dictionariesData,
//                               carriers: {
//                                 ...(flightData.dictionaries?.carriers || {}),
//                                 ...(dictionariesData?.carriers || {}),
//                               },
//                             },
//                           }}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 )}

//               {/* Sign In Section */}
//               {/* <div className="bg-white rounded-lg p-5 my-5 shadow-sm">
//                 <div className="flex flex-col md:flex-row items-center">
//                   <div className="mr-4 text-xl mb-3 md:mb-0">âœˆ</div>
//                   <div className="flex-grow mb-3 md:mb-0 text-center md:text-left">
//                     <h3 className="text-base font-medium">
//                       Sign in for easier booking
//                     </h3>
//                     <p className="text-sm text-gray-600">
//                       Securely book with your saved details and easily manage
//                       all your trips in one place
//                     </p>
//                   </div>
//                   <button className="bg-blue-900 text-white px-4 py-2 rounded font-medium text-sm hover:bg-blue-800 transition-colors">
//                     SIGN IN
//                   </button>
//                 </div>
//               </div> */}

//               {/* Sign In Section - Show only when user is not logged in */}
//               {!userData && !isUserDataLoading && (
//                 <div className="bg-[#E5E5EA] rounded-md px-3 py-2 mb-5 shadow-sm">
//                   <div className="flex flex-col md:flex-row items-center">
//                     <div className="mr-4 text-xl mb-3 md:mb-0">
//                       <img
//                         src="/assets/icons/log-in.svg"
//                         alt="Sign In"
//                         className="w-6 h-6"
//                       />
//                     </div>
//                     <div className="flex-grow mb-3 md:mb-0 text-center md:text-left">
//                       <h3 className="title-t3 text-background-on">
//                         Sign in for easier booking
//                       </h3>
//                       <p className="label-l3 text-neutral-dark">
//                         Securely book with your saved details and easily manage
//                         all your trips in one place
//                       </p>
//                     </div>
//                     <button
//                       className="bg-primary text-primary-on px-4 py-2 rounded font-medium text-sm hover:bg-[#5143d9] transition-colors"
//                       onClick={() => setIsSignInModalOpen(true)}
//                     >
//                       SIGN IN
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Passenger Information - Dynamic Rendering */}
//               <div className="bg-container rounded-md  py-0 mb-5 shadow-sm">
//                 {/* {isUserDataLoading && (
//                   <div className="px-5 py-3 bg-blue-50 border-b border-blue-200">
//                     <div className="flex items-center">
//                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
//                       <span className="label-l2 text-blue-700">
//                         Loading your profile and saved passengers...
//                       </span>
//                     </div>
//                   </div>
//                 )} */}

//                 {/* {userData && !isUserDataLoading && (
//                   <div className="px-5 py-3 bg-green-50 border-b border-green-200">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center">
//                         <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
//                         <span className="label-l2 text-green-700">
//                           Welcome back, {userData.firstName}!
//                           {relationshipsList.length > 0 && (
//                             <span>
//                               {' '}
//                               Found {relationshipsList.length} saved passengers.
//                             </span>
//                           )}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 )} */}

//                 {passengers.map((passengerType, index) => (
//                   <PassengerForm
//                     key={`passenger-${index}`}
//                     passengerType={passengerType}
//                     index={index}
//                   />
//                 ))}

//                 {/* Contact Details - Only shown when no passenger is primary contact */}
//                 {primaryContactIndex === -1 && (
//                   <div className="">
//                     <h3 className="title-t4 bg-dark text-background-on mb-5 px-5 py-3">
//                       Contact Details
//                     </h3>

//                     <div className="flex flex-wrap -mx-2 mb-4 px-5">
//                       <div className="w-full md:w-1/2 px-2  mb-4">
//                         <CustomTextField
//                           label="Email"
//                           id="contact-email"
//                           type="email"
//                           value={contactInfo.email}
//                           onChange={(e) =>
//                             handleContactDetailsChange(
//                               'email',
//                               e.target.value,
//                               e.target.id
//                             )
//                           }
//                           required
//                           fullWidth
//                           error={
//                             showValidationErrors &&
//                             !!formErrors.contactInfo?.email
//                           }
//                           errorMessage={formErrors.contactInfo?.email}
//                         />
//                       </div>

//                       <div className="w-full md:w-1/2 px-2 mb-4">
//                         <CustomTextField
//                           label="Contact Number"
//                           id="contact-phone"
//                           isPhoneNumber={true}
//                           countryCode={contactInfo.phoneCountryCode || '+61'}
//                           onCountryCodeChange={(code) =>
//                             handleContactDetailsChange(
//                               'phoneCountryCode',
//                               code,
//                               'contact-phoneCountry'
//                             )
//                           }
//                           value={contactInfo.phone}
//                           onChange={(
//                             e: React.ChangeEvent<HTMLInputElement>
//                           ) => {
//                             const value = e.target.value;
//                             handleContactDetailsChange(
//                               'phone',
//                               value,
//                               'contact-phone'
//                             );
//                           }}
//                           required
//                           fullWidth
//                           error={
//                             showValidationErrors &&
//                             !!formErrors.contactInfo?.phone
//                           }
//                           errorMessage={formErrors.contactInfo?.phone}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Travel Information */}
//               <div className=" bg-dark rounded-md  mb-5 shadow-sm">
//                 <div className="flex items-center neutral-medium px-5 py-2">
//                   <div className="mr-1 text-2xl">&#128313;</div>
//                   <h3 className="body-b3 text-background-on">
//                     Important Travel Information
//                   </h3>
//                   <button
//                     className="ml-auto text-primary label-l2 focus:outline-none"
//                     onClick={() => setShowDetails(!showDetails)}
//                   >
//                     View Details
//                   </button>
//                 </div>

//                 {showDetails && (
//                   <div className=" p-5  label-l3 text-gray-600 leading-relaxed bg-container text-background-on">
//                     <p>
//                       Stay informed about visa requirements, baggage policies,
//                       and essential travel guidelines before your journey.
//                       Ensure you have the necessary documents, adhere to airline
//                       regulations, and check prohibited items to avoid any
//                       inconvenience.
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {/* Payment Section - Using our new Payment component */}
//               <Payment
//                 cardHolderName={cardHolderName}
//                 cardNumber={cardNumber}
//                 expiryDate={expiryDate}
//                 cvc={cvc}
//                 onCardHolderNameChange={handleCardHolderNameChange}
//                 onCardNumberChange={handleCardNumberChange}
//                 onExpiryDateChange={handleExpiryDateChange}
//                 onCvcChange={handleCvcChange}
//                 isProcessing={isLoading}
//                 onPaymentSubmit={handleBooking}
//                 error={bookingError}
//                 validationErrors={paymentErrors}
//                 showValidationErrors={showValidationErrors}
//                 bookingResponse={bookingResponse}
//               />
//             </div>

//             {/* Right Column - Price Summary */}
//             <div className="lg:col-span-1 sticky top-5 self-start mb-3">
//               <div className="bg-white rounded-md p-5 shadow-sm">
//                 <h3 className="title-t3 mb-5 pb-3 border-b border-gray-200">
//                   Price Summary
//                 </h3>

//                 <div className="mb-5">
//                   <h4 className="title-t4 mb-2">
//                     Tickets (
//                     {(flightData?.travelers?.adults || 1) +
//                       (flightData?.travelers?.children || 0)}
//                     )
//                   </h4>

//                   {/* Group traveler pricings by type and show each type with its count and price */}
//                   {flightData?.flight?.travelerPricings ? (
//                     (() => {
//                       // Group travelers by type and count them
//                       const travelerGroups =
//                         flightData.flight.travelerPricings.reduce(
//                           (acc: any, pricing: any) => {
//                             const type = pricing.travelerType;
//                             if (!acc[type]) {
//                               acc[type] = {
//                                 count: 0,
//                                 price: parseFloat(pricing.price.base || 0),
//                               };
//                             }
//                             acc[type].count++;
//                             return acc;
//                           },
//                           {}
//                         );

//                       // Render each traveler type group
//                       return Object.entries(travelerGroups).map(
//                         ([type, data]: [string, any]) => (
//                           <div
//                             key={type}
//                             className="flex justify-between label-l3  mb-2"
//                           >
//                             <span>
//                               {type === 'ADULT'
//                                 ? 'Adult'
//                                 : type === 'CHILD'
//                                 ? 'Child'
//                                 : 'Held Infant'}{' '}
//                               x {data.count}
//                             </span>
//                             <span>
//                               {flightData?.currencyCode || 'AUD'}{' '}
//                               {(data.price * data.count).toFixed(2)}
//                             </span>
//                           </div>
//                         )
//                       );
//                     })()
//                   ) : (
//                     // Fallback - use base price from flight price when travelerPricings not available
//                     <>
//                       {/* {(flightData?.travelers?.adults > 0 ||
//                         flightData?.adults > 0) && (
//                         <div className="flex justify-between label-l3 text-background-on mb-2">
//                           <span>(Adult) x {adultCount}</span>
//                           <span>
//                             {flightData?.currencyCode || 'AUD'}{' '}
//                             {Number(
//                               flightData?.flight?.price?.base || 0
//                             ).toFixed(2)}
//                           </span>
//                         </div>
//                       )}

//                       {(flightData?.travelers?.children > 0 ||
//                         flightData?.children > 0) && (
//                         <div className="flex justify-between label-l3 text-background-on mb-2">
//                           <span>(Child) x {childCount}</span>
//                           <span>
//                             {flightData?.currencyCode || 'AUD'}{' '}
//                             {Number(
//                               flightData?.flight?.price?.base || 0
//                             ).toFixed(2)}
//                           </span>
//                         </div>
//                       )}

//                       {(flightData?.travelers?.infants > 0 ||
//                         flightData?.infants > 0) && (
//                         <div className="flex justify-between label-l3 text-background-on mb-2">
//                           <span>(Infant) x {infantCount}</span>
//                           <span>
//                             {flightData?.currencyCode || 'AUD'}{' '}
//                             {Number(
//                               flightData?.flight?.price?.base || 0
//                             ).toFixed(2)}
//                           </span>
//                         </div>
//                       )} */}
//                     </>
//                   )}

//                   <div className="flex justify-between label-l3 text-background-on mb-2">
//                     <div
//                       className="flex items-center cursor-pointer"
//                       onClick={() => setTaxesExpanded(!taxesExpanded)}
//                     >
//                       <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 text-primary transition-all mr-2">
//                         <span
//                           className="text-base font-lg leading-none"
//                           style={{ marginTop: '-1px' }}
//                         >
//                           {taxesExpanded ? '−' : '+'}
//                         </span>
//                       </span>
//                       <span>Taxes & Fees</span>
//                     </div>
//                     <span>
//                       {flightData?.currencyCode || 'AUD'}{' '}
//                       {Number(
//                         Number(
//                           flightData?.flight?.price?.total -
//                             flightData?.flight?.price?.base
//                         ) + Number(convertedServiceFee)
//                       ).toFixed(2)}
//                     </span>
//                   </div>

//                   {taxesExpanded && (
//                     <div className="pl-5 mb-3 bg-gray-200 py-2 px-3 rounded-md">
//                       <div className="flex justify-between label-l3 text-background-on mb-2">
//                         <span>Taxes</span>
//                         <span>
//                           {flightData?.currencyCode || 'AUD'}{' '}
//                           {Number(
//                             flightData?.flight?.price?.total -
//                               flightData?.flight?.price?.base
//                           ).toFixed(2)}
//                         </span>
//                       </div>
//                       <div className="flex justify-between label-l3 text-background-on">
//                         <span>{serviceFeeData?.name || 'Fees'}</span>
//                         <span>
//                           {flightData?.currencyCode || 'AUD'}{' '}
//                           {Number(convertedServiceFee).toFixed(2)}
//                         </span>
//                       </div>
//                     </div>
//                   )}

//                   {/* Show discount if Best Value fare is applied */}
//                   {fareDiscount && (
//                     <div className="flex justify-between label-l3 text-green-600 mb-2">
//                       <div className="flex items-center">
//                         {/* <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
//                           {fareDiscount.label}
//                         </span> */}
//                         <span>Discount</span>
//                       </div>
//                       <span>
//                         - {flightData?.currencyCode || 'AUD'}{' '}
//                         {Number(fareDiscount.amount).toFixed(2)}
//                       </span>
//                     </div>
//                   )}
//                 </div>

//                 <div className="pt-4 border-t border-gray-200">
//                   <div className="flex justify-between items-center font-medium">
//                     <span className="label-l3 text-background-on">Total</span>
//                     <span className="h5 text-primary">
//                       {flightData?.currencyCode || 'AUD'}{' '}
//                       {(() => {
//                         const baseTotal = serviceFeeData?.amount
//                           ? Number(
//                               flightData?.flight?.price?.grandTotal || 0.0
//                             ) + Number(convertedServiceFee)
//                           : Number(
//                               flightData?.flight?.price?.grandTotal || 0.0
//                             );

//                         const discountAmount = fareDiscount
//                           ? fareDiscount.amount
//                           : 0;
//                         const finalTotal = baseTotal - discountAmount;

//                         return finalTotal.toFixed(2);
//                       })()}
//                     </span>
//                   </div>
//                   {/* Show original price if discount is applied */}
//                   {/* {fareDiscount && (
//                     <div className="flex justify-between items-center label-l2 text-gray-500 mt-1">
//                       <span>Original Price</span>
//                       <span className="line-through">
//                         {flightData?.currencyCode || 'AUD'}{' '}
//                         {serviceFeeData?.amount
//                           ? Number(
//                               Number(
//                                 flightData?.flight?.price?.grandTotal || 0.0
//                               ) + Number(convertedServiceFee)
//                             ).toFixed(2)
//                           : Number(
//                               flightData?.flight?.price?.grandTotal || 0.0
//                             ).toFixed(2)}
//                       </span>
//                     </div>
//                   )} */}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Add hidden iframe for 3D Secure */}
//       {isOpenThreedsSecureModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-5 rounded-md w-full max-w-lg">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-medium">3D Secure Authentication</h3>
//               <button
//                 onClick={() => setIsOpenThreedsSecureModal(false)}
//                 className="text-gray-500 hover:text-gray-700 transition-colors"
//                 aria-label="Close modal"
//               >
//                 <svg
//                   className="w-6 h-6"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M6 18L18 6M6 6l12 12"
//                   ></path>
//                 </svg>
//               </button>
//             </div>
//             <p className="mb-4">
//               Please complete the authentication process to verify your card.
//             </p>
//             <div className="relative w-full h-96">
//               <iframe
//                 ref={iframeRef}
//                 className="absolute inset-0 w-full h-full border-0"
//                 title="3D Secure Authentication"
//                 sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups"
//                 onLoad={handleIframeLoad}
//               ></iframe>
//             </div>
//             <input type="hidden" ref={paymentTokenRef} value="" />
//           </div>
//         </div>
//       )}

//       {/* Countdown modal for redirecting when no fare is applicable */}
//       {isRedirecting && (
//         <BookRedirectCountdown redirectCountdown={redirectCountdown} />
//       )}

//       {/* Sign In Modal */}
//       <SignInModal
//         isOpen={isSignInModalOpen}
//         onClose={() => setIsSignInModalOpen(false)}
//       />

//       <Footer />
//     </>
//   );
// }
