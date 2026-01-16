import React, { useEffect, useRef, useState } from 'react';
// import NewModalTickets from '../NewModalTickets';

import NewModalTickets from '@skytrips-web/libs/shared-ui/NewModalTickets';
import './styles.scss';
import BaggageTab from './BaggageTab';
// import { useRouter } from 'next/router';
import { useRouter as useNavigationRouter } from 'next/navigation'; // For App Router
import { useRouter as usePagesRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Image from 'next/image';
import { FaTag } from 'react-icons/fa';
import { Input } from '..';

import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import TimePicker from '../TimePicker';
import { useMutation } from '@apollo/client';
import { STORE_FLIGHT_SEARCH_QUERY } from '../../shared-graphqlQueries/storeFlightSearchQuery';
import { toast } from 'react-toastify';
import rightArrow from '../../shared-assets/images/icons/right_arrow.svg';
import downArrow from '../../shared-assets/images/icons/down_arrow.svg';
import informationFill from '../../shared-assets/images/icons/information-fill.svg';
import bowlIcon from '../../shared-assets/images/icons/bowl-fill.svg';
import bagIcon from '../../shared-assets/images/icons/plug-fill.svg';
import plugIcon from '../../shared-assets/images/icons/fluent_tv-48-filled.svg';
import wifiIcon from '../../shared-assets/images/icons/wifi-fill.svg';
import loader from '../../shared-assets/images/loading-gif.gif';

// export const getRouter = () => {
//   try {
//     return require('next/navigation').useRouter; // App Router (Admin Panel)
//   } catch {
//     return require('next/router').useRouter; // Pages Router (Other apps)
//   }
// };
export const getRouter = () => {
  try {
    return {
      useRouter: require('next/navigation').useRouter, // App Router
      useSearchParams: require('next/navigation').useSearchParams, // App Router
      usePathname: require('next/navigation').usePathname,
    };
  } catch {
    return {
      useRouter: require('next/router').useRouter, // Pages Router
      useSearchParams: null, // Not available in Pages Router
      usePathname: null,
    };
  }
};

const FlightDetails = (props) => {
  const {
    data,
    price,
    flightFilter,
    amenities,
    dictionaries,
    handleFlightSeatmap,
    flightInfo,
    singleTravelerPricing,
    priceApiLoading,
    tripType,
    originLocationCode,
    destinationLocationCode,
    travelClass,
    adult,
    children,
    departureDate,
    infant,
    totalTraveler,
  } = props;

  console.log({ singleTravelerPricing });

  // const router = useRouter();
  // const useRouter = getRouter();
  // const router = useRouter();
  // const isAdmin = useRouter === require('next/navigation').useRouter;
  const [isAdmin, setIsAdmin] = useState(false);
  const { useRouter, useSearchParams, usePathname } = getRouter();
  const router = useRouter();
  const pathname = usePathname ? usePathname() : router.pathname;
  const [showForm, setShowForm] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedPhoneCode, setSelectedPhoneCode] = useState('+61');

  const [hourValue, setHourValue] = useState('12');
  const [minuteValue, setMinuteValue] = useState('00');

  const [stDeals, setStDeals] = useState('');
  const formRef = useRef(null);

  const [storeFlightSearchQuery, { loading, error }] = useMutation(
    STORE_FLIGHT_SEARCH_QUERY,
  );

  console.log('price', price);

  console.log('hourValue', hourValue);
  console.log('minuteValue', minuteValue);
  const callBackToSchema = Yup.object().shape({
    phone: Yup.number()
      .typeError('Contact number is required!')
      .when('$showForm', {
        is: true,
        then: (schema) => schema.required('Contact number is required!'),
        otherwise: (schema) => schema.notRequired(),
      }),

    hour: Yup.string()
      .matches(/^(0?[1-9]|1[0-2])$/, 'Hour must be between 1 and 12')
      .when('$showForm', {
        is: true,
        then: (schema) => schema.required('Hour is required!'),
        otherwise: (schema) => schema.notRequired(),
      }),

    period: Yup.string()
      .oneOf(['AM', 'PM'], 'Must be AM or PM')
      .when('$showForm', {
        is: true,
        then: (schema) => schema.required('Time format is required!'),
        otherwise: (schema) => schema.notRequired(),
      }),
  });

  console.log('flightInfo', flightInfo);

  const {
    register,
    getValues,
    watch,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(callBackToSchema),
    context: { showForm },
  });

  useEffect(() => {
    // Check if the current pathname contains '/inquiries'
    const checkIfAdmin = pathname.includes('/inquiries');
    setIsAdmin(checkIfAdmin);
  }, [pathname]);

  console.log('isAdmin', isAdmin);
  useEffect(() => {
    const storedDeals = localStorage.getItem('st-deals');
    setStDeals(storedDeals);
  }, []);

  useEffect(() => {
    if (selectedOption) {
      setSelectedPhoneCode(selectedOption.phone[0]);
    }
  }, [selectedOption]);

  const allAmenities =
    amenities && amenities.flatMap((segment) => segment.amenities || []);

  const uniqueAmenities = Array.from(
    new Set(
      allAmenities && allAmenities.map((amenity) => JSON.stringify(amenity)),
    ),
  ).map((amenity) => JSON.parse(amenity));

  const MealData =
    uniqueAmenities && uniqueAmenities.filter((i) => i.amenityType === 'MEAL');

  const today = new Date();

  const formattedDate = `${today.getDate()} ${today
    .toLocaleDateString(undefined, { month: 'short' })
    .toLowerCase()}`;

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [cancellationTimeInUserTimeZone, setCancellationTimeInUserTimeZone] =
    useState('00:00');

  useEffect(() => {
    const australianTime = new Date('2023-11-20T22:00:00+11:00');

    // Convert AEST to user's time zone
    const userTime = new Date(
      australianTime.toLocaleString('en-US', { timeZone: userTimeZone }),
    );
    const formattedUserTime = userTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    setCancellationTimeInUserTimeZone(formattedUserTime);
  }, [userTimeZone]);

  const getGMTOffset = () => {
    // Create a date to get the offset
    const date = new Date();
    const offset = date.getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset > 0 ? '-' : '+';

    // Format the offset string
    const formattedOffset = `GMT ${sign}${hours < 10 ? '0' : ''}${hours}:${
      minutes < 10 ? '0' : ''
    }${minutes}`;
    return formattedOffset;
  };
  const [openBaggageIndex, setOpenBaggageIndex] = useState(0);

  useEffect(() => {
    setOpenBaggageIndex(0);
  }, [singleTravelerPricing]);
  const handleBaggage = (index) => {
    setOpenBaggageIndex(openBaggageIndex === index ? null : index);
  };

  const adultTraveler =
    singleTravelerPricing &&
    singleTravelerPricing.find((item) => item.travelerType === 'ADULT');
  const childTraveler =
    singleTravelerPricing &&
    singleTravelerPricing.find((item) => item.travelerType === 'CHILD');
  const infantTraveler =
    singleTravelerPricing &&
    singleTravelerPricing.find((item) => item.travelerType === 'HELD_INFANT');

  const adultCount = singleTravelerPricing.filter(
    (traveler) => traveler.travelerType === 'ADULT',
  ).length;
  const childCount = singleTravelerPricing.filter(
    (traveler) => traveler.travelerType === 'CHILD',
  ).length;
  const infantCount = singleTravelerPricing.filter(
    (traveler) => traveler.travelerType === 'HELD_INFANT',
  ).length;

  const handleCancellationInfo = () => {
    // const flightModal = document.getElementById("flightdetail")
    // $(flightModal).modal("hide")
    // router.push("/terms-and-conditions")
    window.open('/terms-and-conditions', '_blank', 'noopener,noreferrer');
  };
  const handleCallBack = () => {
    setShowForm(!showForm);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleFormSubmit = async (formData) => {
    console.log('selected time', formData.time);
    try {
      const locationList = data.map((itinerary) => {
        const firstSegment = itinerary.segments[0];
        const lastSegment = itinerary.segments[itinerary.segments.length - 1];

        return {
          from: firstSegment.departure.iataCode,
          to: lastSegment.arrival.iataCode,
          date: firstSegment.departure.at.split('T')[0], // First departure date
          // segmentDepartureDates: itinerary.segments.map(
          //   (segment) => segment.departure.at.split("T")[0]
          // ) // Collects departure dates of all segments
        };
      });

      console.log('locationList', locationList);
      const variable = {
        // locations: [
        //   {
        //     from: originLocationCode,
        //     to: destinationLocationCode,
        //     date: departureDate?.date
        //   }
        // ],
        locations: locationList,
        travelClass: travelClass, // Change as needed
        travelerCount: totalTraveler, // Adjust based on actual form data
        tripType: tripType, // Adjust as needed
        preferedTime: formData?.preferedTime, // Uses formatted time from `TimePicker`
        phone: String(formData?.phone),
        phoneCountryCode: selectedPhoneCode, // Example default
        travelerDetail: {
          adults: adult ? adult : 0, // Adjust according to your form state
          children: children ? children : 0,
          infants: infant ? infant : 0,
        },
        timeZone: userTimeZone,
      };

      // console.log("variable", variable)

      const response = await storeFlightSearchQuery({ variables: variable });

      if (response && response.data) {
        toast.success('Message sent successfully');
      }
    } catch (err) {
      console.error('Mutation error:', err);
    }
  };

  console.log('data', data);
  return (
    <div className="modal-dialog modal-lg" id="flight-modal">
      <div className="modal-content px-3">
        {/* Title */}
        <div className="modal-header">
          <h6
            className={isAdmin ? 'text-lg ml-3 pt-4 pb-0' : 'modal-text pt-2'}
          >
            Details
          </h6>
          {!isAdmin && (
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          )}
        </div>
        {/* Body */}
        <div className="modal-body btn-modal-groups p-3">
          {/* Tabs START */}
          {/* <ul
            className="nav nav-pills nav-justified nav-responsive bg-opacity-10  px-0 mb-3"
            id="flight-pills-tab"
            role="tablist"
          > */}
          {/* Flight Details tab */}
          {/* <li className="nav-item " role="presentation">
              <button
                className="nav-link active mb-0 text-uppercase"
                id="flight-info"
                data-bs-toggle="pill"
                data-bs-target="#flight-info-tab"
                type="button"
                role="tab"
                aria-controls="flight-info-tab"
                aria-selected="true"
              >
                Flight Details
              </button>
            </li> */}
          {/* <button
              className="nav-link  mb-0 text-uppercase"
              // id="flight-info"
              // data-bs-toggle="pill"
              // data-bs-target="#flight-info-tab"
              // type="button"
              // role="tab"
              // aria-controls="flight-info-tab"
              // aria-selected="true"
            >
              Flight Details
            </button> */}
          {/* Fare tab item */}
          {/* <li className="nav-item" role="presentation">
              <button
                className="nav-link mb-0 text-uppercase"
                id="flight-fare"
                data-bs-toggle="pill"
                data-bs-target="#flight-fare-tab"
                type="button"
                role="tab"
                aria-controls="flight-fare-tab"
                aria-selected="false"
              >
                Fare
              </button>
            </li> */}

          {/* Baggage tab item */}
          {/* <li className="nav-item" role="presentation">
              <button
                className="nav-link mb-0 text-uppercase"
                id="flight-baggage"
                data-bs-toggle="pill"
                data-bs-target="#flight-baggage-tab"
                type="button"
                role="tab"
                aria-controls="flight-baggage-tab"
                aria-selected="false"
              >
                Baggage
              </button>
            </li> */}
          {/* Cancellation tab item */}
          {/* <li className="nav-item" role="presentation">
              <button
                className="nav-link mb-0 text-uppercase"
                id="flight-policy"
                data-bs-toggle="pill"
                data-bs-target="#flight-policy-tab"
                type="button"
                role="tab"
                aria-controls="flight-policy-tab"
                aria-selected="false"
              >
                Cancellation
              </button>
            </li> */}
          {/* Amenities tab items */}
          {/* <li className="nav-item pr-0" role="presentation">
              <button
                className="nav-link mb-0 text-uppercase pr-0"
                id="flight-amenities "
                data-bs-toggle="pill"
                data-bs-target="#flight-amenities-tab"
                type="button"
                role="tab"
                aria-controls="flight-amenities-tab"
                aria-selected="false"
              >
                Amenities
              </button>
            </li> */}
          {/* </ul> */}
          {/* Tabs END */}
          {/* Tab content START */}
          <div className="tab-content mb-0" id="flight-pills-tabContent">
            {/* Flight Details content item START */}
            {/*
            {stDeals === "fareFirst" && (
              <div className="exclusive-fare-offers mb-3 p-3 w-full">
                <h4>Exclusive Offers</h4>
                <div className="d-flex align-items-center  justify-content-center gap-3 offer-div-for-mob w-full">
                  <div className="single-offer d-flex flex-column align-items-center justify-content-center ">
                    <Image
                      src="/assets/images/valentine/giftIcon.svg"
                      width={16}
                      height={16}
                      alt="gift"
                    />
                    <h6 className="mt-2">Valentine Gift</h6>
                    <h5>-$21</h5>
                  </div>
                  <div className="single-offer d-flex flex-column align-items-center justify-content-center ">
                    {" "}
                    <Image
                      src="/assets/images/valentine/bookIcon.svg"
                      width={16}
                      height={16}
                      alt="book-icon"
                    />
                    <h6 className="mt-3">No Booking Fee</h6>
                    <h5>-$25</h5>
                  </div>
                  <div className="single-offer d-flex flex-column align-items-center justify-content-center ">
                    {" "}
                    <Image
                      src="/assets/images/valentine/upArrow.svg"
                      width={16}
                      height={16}
                      alt="upArrow"
                    />
                    <h6 className="mt-3">No Upgrade Fee</h6>
                    <h5>-$25</h5>
                  </div>
                  <div className="single-offer d-flex flex-column align-items-center justify-content-center ">
                    {" "}
                    <Image
                      src="/assets/images/valentine/savingIcon.svg"
                      width={16}
                      height={16}
                      alt="savings"
                    />
                    <h6 className="mt-3">Total Savings</h6>
                    <h5>$71</h5>
                  </div>
                </div>
              </div>
            )} */}
            <div
              className="tab-pane fade show active "
              id="flight-info-tab"
              role="tabpanel"
              aria-labelledby="flight-info"
            >
              <NewModalTickets
                data={data}
                flightFilter={flightFilter}
                dictionaries={dictionaries}
              />
            </div>
            {/* {stDeals === "fareLast" && (
              <div className="exclusive-fare-offers mb-3 p-3 w-auto">
                <h4>Exclusive Offers</h4>
                <div className="d-flex align-items-center  gap-4 offer-div-for-mob">
                  <div className="single-offer d-flex flex-column align-items-center justify-content-center ">
                    <Image
                      src="/assets/images/valentine/giftIcon.svg"
                      width={16}
                      height={16}
                      alt="gift"
                    />
                    <h6 className="mt-2">Valentine Gift</h6>
                    <h5>-$21</h5>
                  </div>
                  <div className="single-offer d-flex flex-column align-items-center justify-content-center ">
                    {" "}
                    <Image
                      src="/assets/images/valentine/bookIcon.svg"
                      width={16}
                      height={16}
                      alt="book-icon"
                    />
                    <h6 className="mt-3">No Booking Fee</h6>
                    <h5>-$25</h5>
                  </div>
                  <div className="single-offer d-flex flex-column align-items-center justify-content-center ">
                    {" "}
                    <Image
                      src="/assets/images/valentine/upArrow.svg"
                      width={16}
                      height={16}
                      alt="upArrow"
                    />
                    <h6 className="mt-3">No Upgrade Fee</h6>
                    <h5>-$25</h5>
                  </div>
                  <div className="single-offer d-flex flex-column align-items-center justify-content-center ">
                    {" "}
                    <Image
                      src="/assets/images/valentine/savingIcon.svg"
                      width={16}
                      height={16}
                      alt="savings"
                    />
                    <h6 className="mt-3">Total Savings</h6>
                    <h5>$71</h5>
                  </div>
                </div>
              </div>
            )} */}
            {/* Flight Details  content item END */}

            {/* Fare Content item START */}
            {/* <div
              className="tab-pane fade"
              id="flight-fare-tab"
              role="tabpanel"
              aria-labelledby="flight-fare"
            > */}
            <div className={isAdmin ? ' mt-3' : 'card card-body'}>
              <div className="fare-container">
                <div className={isAdmin ? 'grid grid-cols-2 gap-2' : 'row'}>
                  {/* Left Column (Labels) */}
                  <div className={isAdmin ? 'w-full' : 'col-7'}>
                    <p className={isAdmin ? 'mb-4' : 'pb-2'}>
                      Base fare (Adult) x{adultCount}
                    </p>
                    {childCount > 0 && (
                      <p className={isAdmin ? 'mb-4' : 'pb-2'}>
                        Base fare (Child) x{childCount}
                      </p>
                    )}
                    {infantCount > 0 && (
                      <p className={isAdmin ? 'mb-4' : 'pb-2'}>
                        Base fare (Infant) x{infantCount}
                      </p>
                    )}
                    <p>Tax</p>
                  </div>

                  {/* Right Column (Price Details - Left Aligned) */}
                  <div className={isAdmin ? 'w-full' : 'col-5 text-right'}>
                    <div className="price-fare ">
                      <p className={isAdmin ? 'mb-4 ' : 'pb-2'}>
                        ${(adultTraveler?.price?.base * adultCount).toFixed(2)}
                      </p>
                      {childCount > 0 && (
                        <p className={isAdmin ? 'mb-4' : 'pb-2'}>
                          $
                          {(childTraveler?.price?.base * childCount).toFixed(2)}
                        </p>
                      )}
                      {infantCount > 0 && (
                        <p className={isAdmin ? 'mb-4' : 'pb-2'}>
                          $
                          {(infantTraveler?.price?.base * infantCount).toFixed(
                            2,
                          )}
                        </p>
                      )}
                      <p>${(price?.total - price?.base).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Horizontal Line */}
                  {!isAdmin && (
                    <div className="col-span-2">
                      <hr className="hr-line-div mb-2 mt-2 mx-auto" />
                    </div>
                  )}

                  {/* Total Row */}
                  <div className={isAdmin ? 'w-full' : 'col-6'}>
                    <p>Total</p>
                  </div>
                  <div className={isAdmin ? 'w-full ' : 'col-6 text-right'}>
                    <div className="price-fare-total">
                      <p>${price?.total}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* </div> */}

            {/* Baggage Content item START */}
            {/* <div
              className="tab-pane fade"
              id="flight-baggage-tab"
              role="tabpanel"
              aria-labelledby="flight-baggage"
            > */}
            <div className="card mt-3">
              <div className="card-body">
                <div className="baggage-container ">
                  {singleTravelerPricing &&
                    singleTravelerPricing?.map((item, index) => (
                      <div
                        className="passenger-baggage-container mb-4"
                        key={index}
                      >
                        <h6
                          className={
                            isAdmin
                              ? 'flex justify-between'
                              : 'd-flex  align-items-center justify-content-between mb-0'
                          }
                        >
                          Passenger {index + 1} (
                          {item?.travelerType === 'HELD_INFANT'
                            ? 'INFANT'
                            : item?.travelerType}
                          )
                          <span
                            onClick={() => handleBaggage(index)}
                            className="cursor-pointer"
                          >
                            {openBaggageIndex !== index ? (
                              <Image
                                src={rightArrow}
                                alt="arrow"
                                width={25}
                                height={25}
                              />
                            ) : (
                              <Image
                                src={downArrow}
                                alt="arrow"
                                width={25}
                                height={25}
                              />
                            )}
                          </span>
                        </h6>
                        {openBaggageIndex === index && (
                          <BaggageTab
                            singleTravelerPricing={singleTravelerPricing}
                            data={data}
                            singleTravelerId={item.travelerId}
                            isAdmin={isAdmin}
                          />
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
            {/* </div> */}
            {/* Baggage content  item END */}

            {/* Cancellation content item START */}
            {/* <div
              className="tab-pane fade"
              id="flight-policy-tab"
              role="tabpanel"
              aria-labelledby="flight-policy"
            > */}
            {!isAdmin && (
              <div className="">
                <div className="">
                  <div className="cancellation-container p-3">
                    <div className="d-flex flex-row cancellation-section">
                      <div className="col-md-3 px-0">
                        <h6 className="bag-quantity-text mt-1">
                          Cancellation Fees:
                        </h6>
                        <div className="cancellation-gmt-time">
                          <h6 className="bag-quantity-text mt-5 ">
                            Cancellation Time:
                          </h6>
                          <p className="time-stamp">
                            {'('}
                            {getGMTOffset()}
                            {')'}
                          </p>
                        </div>
                      </div>

                      <div className="col-md-9 px-0">
                        <div className="row w-100">
                          <div className="col-6">
                            <h6 className="bag-quantity-text mt-1 text-center custom-bold">
                              Administrative fees
                            </h6>
                          </div>
                          <div className="col-6 ">
                            <h6 className="bag-quantity-text mt-1 text-center custom-bold">
                              Administrative fees + Airline penalty fees
                            </h6>
                          </div>
                        </div>

                        <div className="cancellation-meter mt-3 position-relative">
                          <div className="marker-line"></div>
                          <div className=" pt-4 text-center">
                            <span className="bag-quantity-text ">
                              {formattedDate}
                            </span>
                            <br />
                            <span className="date-time-text">
                              {cancellationTimeInUserTimeZone}
                            </span>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between  mt-4">
                          <span className="bag-quantity-text">Now</span>
                        </div>
                      </div>
                      <div className="cancellation-gmt-time-for-mobile">
                        <h6 className="bag-quantity-text mt-5 ">
                          Cancellation Time:
                        </h6>
                        <p className="time-stamp">
                          {'('}
                          {getGMTOffset()}
                          {')'}
                        </p>
                      </div>
                    </div>

                    <div className="d-flex justify-content-center">
                      <div
                        className="d-flex flex-row justify-content-center align-items-center information-div mt-5 cursor-pointer"
                        onClick={handleCancellationInfo}
                      >
                        <span className="me-2">
                          <Image
                            src={informationFill}
                            className="informationFill"
                            width={24}
                            height={24}
                          />
                        </span>
                        <p className="information-text">
                          Click here to see cancellation and refund policies
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* </div> */}
            {/* Cancelllation content item END */}

            {/* Amenities content item START */}
            {/* <div
              className="tab-pane fade"
              id="flight-amenities-tab"
              role="tabpanel"
              aria-labelledby="flight-amenities"
            > */}
            {!isAdmin && (
              <div className="amenities-container mt-3">
                {MealData && MealData.length > 0 && (
                  <div className="d-flex flex-row amenities-section align-items-center    ">
                    <div className=" pr-0">
                      <Image
                        src={bowlIcon}
                        alt="bowl"
                        width={33}
                        height={33}
                        className="mr-3"
                      />
                    </div>
                    <div className="d-flex flex-row justify-content-between align-items-center w-100 pr-0  pr-0 ">
                      <h6 className="bag-quantity-text mt-2">
                        Complimentary snack & beverages
                      </h6>

                      {MealData[0].isChargeable === true && (
                        <div className="charge-tag">
                          <h6 className="bag-quantity-text mt-2 ms-auto text-end ">
                            Charges Applied
                          </h6>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="d-flex flex-row amenities-section">
                  <div className=" pr-0">
                    <Image
                      src={bagIcon}
                      alt="bag"
                      width={33}
                      height={33}
                      className="mr-3"
                    />
                  </div>
                  <div className=" pr-0 ">
                    <h6 className="bag-quantity-text mt-2">
                      Power and USB outlets (Optional)
                    </h6>
                  </div>
                </div>
                <div className="d-flex flex-row amenities-section">
                  <div className=" pr-0">
                    <Image
                      src={plugIcon}
                      alt="plugIcon"
                      width={33}
                      height={33}
                      className="mr-3"
                    />
                  </div>
                  <div className=" pr-0 ">
                    <h6 className="bag-quantity-text mt-2">
                      On-demand live TV (Optional)
                    </h6>
                  </div>
                </div>
                <div className="d-flex flex-row amenities-section ">
                  <div className=" pr-0">
                    <Image
                      src={wifiIcon}
                      alt="wifi"
                      width={33}
                      height={33}
                      className="mr-3"
                    />
                  </div>
                  <div className="d-flex flex-row justify-content-between align-items-center w-100 pr-0  ">
                    <h6 className="bag-quantity-text mt-2">Wifi (Optional)</h6>
                  </div>
                </div>
              </div>
            )}
            {/* </div> */}
            {/* Amenities content item END */}
          </div>
          {/* Tab content END */}
        </div>

        {showForm && (
          <div className="callBack-form-container ">
            <form onSubmit={handleSubmit(handleFormSubmit)} ref={formRef}>
              <div className="mb-3 w-50 callback-contact-div">
                <label className="callback-contact">Contact Number*</label>
                <Input
                  key="phone-input"
                  type="number"
                  placeholder=""
                  extraClassName="booking-form-input"
                  name={'phone'}
                  register={register}
                  selectedOption={selectedOption}
                  setSelectedOption={setSelectedOption}
                  errors={errors && errors.phone}
                />
                {errors?.phone && (
                  <p className="error-message">{errors.phone.message}</p>
                )}
              </div>
              <label className="callback-contact">Select Time*</label>
              <TimePicker
                register={register}
                setValue={setValue}
                watch={watch}
                error={errors}
                clearErrors={clearErrors}
                setHourValue={setHourValue}
                hourValue={hourValue}
                minuteValue={minuteValue}
                setMinuteValue={setMinuteValue}
              />

              <button
                type="submit"
                className="btn btn-primary call-back-send-button mt-2"
                disabled={loading}
              >
                {loading && (
                  <Image
                    className="me-3"
                    src="/assets/images/loading-gif.gif"
                    alt="loader"
                    width="20"
                    height="20"
                  />
                )}{' '}
                Send
              </button>
            </form>
          </div>
        )}

        <div className="sticky-book-now-container pb-3">
          <div className="d-flex flex-column align-items-center justify-content-center">
            {!isAdmin && (
              <button
                className="btn btn-primary call-back-button "
                onClick={() => handleCallBack()}
              >
                Get a callback{' '}
                <span>
                  <Image
                    src="assets/images/contact/hotlineCall.svg"
                    width={25}
                    height={25}
                  />{' '}
                </span>
              </button>
            )}
            <button
              className="btn btn-primary book-now-button cursor-pointer"
              onClick={() => handleFlightSeatmap(flightInfo)}
              disabled={priceApiLoading}
            >
              {priceApiLoading && (
                <Image
                  className="me-3"
                  src={loader}
                  alt="loader"
                  width="20"
                  height="20"
                />
              )}{' '}
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
