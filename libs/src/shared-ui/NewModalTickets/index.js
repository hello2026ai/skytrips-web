import React, { useEffect, useState } from 'react';
// import { useRouter } from "next/router"
import { useRouter as useNavigationRouter } from 'next/navigation'; // For App Router
import { useRouter as usePagesRouter } from 'next/router';
import lzutf8 from 'lzutf8';
import {
  getAirlineFromIatacode,
  getItemFromIatacode,
} from '../../shared-utils/helpers/dataFromIata';
import moment from 'moment';
import './styles.scss';
// import {
//   extractFlightInfo,
//   getHoursAndMinFromDuration,
// } from '@skytrips-web/libs/shared-utils';
// import {
//   // extractFlightInfo,
//   getHoursAndMinFromDuration,
//   // getAirlineFromIatacode,
//   // getItemFromIatacode,
// } from '../../shared-utils/helpers/timeDifference';
import {
  extractFlightInfo,
  getHoursAndMinFromDuration,
  // getAirlineFromIatacode,
  // getItemFromIatacode,
} from '../../shared-utils/helpers/flightDetails';
import Image from 'next/image';

import departureImage from '../../shared-assets/images/icons/departure.svg';
import aeroPlaneIcon from '../../shared-assets/images/icons/aeroplane.svg';
import transitIcon from '../../shared-assets/images/icons/transitTime.svg';
import destinationIcon from '../../shared-assets/images/icons/destination.svg';

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

const NewModalTickets = (props) => {
  const {
    data,
    flightFilter,
    dictionaries: { aircraft, carriers },
  } = props;


  // const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false);
  const { useRouter, useSearchParams, usePathname } = getRouter();
  const router = useRouter();
  const pathname = usePathname ? usePathname() : router.pathname;

  // const isAdmin = useRouter === require('next/navigation').useRouter;

  useEffect(() => {
    // Check if the current pathname contains '/inquiries'
    const checkIfAdmin = pathname.includes('/inquiries');
    setIsAdmin(checkIfAdmin);
  }, [pathname]);

  console.log('isAdmin', isAdmin);

  let searchParams;
  if (useSearchParams) {
    // App Router
    searchParams = useSearchParams();
  } else {
    // Pages Router
    searchParams = router.query; // `router.query` in Pages Router
  }
  // const { searchParams } = router.query;
  const [params, setParams] = useState({});

  useEffect(() => {
    // Check if searchParams exist and parse the JSON string
    // if (searchParams) {
    //   const parsedSearchParams = JSON.parse(
    //     lzutf8.decompress(searchParams, { inputEncoding: 'Base64' }),
    //   );
    //   setParams(parsedSearchParams);
    // }

    if (searchParams) {
      // Ensure searchParams is a string before decompression
      const compressedString =
        typeof searchParams === 'string'
          ? searchParams
          : JSON.stringify(searchParams);

      try {
        const parsedSearchParams = JSON.parse(
          lzutf8.decompress(compressedString, { inputEncoding: 'Base64' }),
        );
        setParams(parsedSearchParams);
      } catch (error) {
        console.error('Failed to decompress searchParams:', error);
      }
    }
  }, [searchParams]);

  return (
    <div className="card  ticket-container">
      {/* Card body START */}
      <div className="p-3  ticket-details">
        {/* Ticket item START */}
        {data?.map((journey, i) => {
          const { firstDeparture, lastArrival, transits } = extractFlightInfo(
            journey.segments,
          );
          const airlineCodeImage = require(
            `../../shared-assets/images/airlines/${firstDeparture?.carrierCode}.webp`,
          );

          return (
            <>
              <>
                <div className="row g-4 mb-3">
                  {/* Airport detail */}
                  <h4 className="Flight-destinations">
                    {'To '}
                    {
                      (getItemFromIatacode(lastArrival?.arrival.iataCode) ?? {})
                        .city
                    }{' '}
                    ({getHoursAndMinFromDuration(journey?.duration)})
                  </h4>
                  <div className="col-12 ">
                    <>
                      <div
                        className={`${isAdmin ? 'flex' : 'd-flex'}   mb-2 mb-sm-0 ms-auto airline-icon-image-for-mobile mb-2`}
                      >
                        <div className="d-flex flex-row">
                          <Image
                            src={airlineCodeImage}
                            className="w-30px h-30px me-2"
                            alt="airlineCodeImage"
                            width={33}
                            height={33}
                            unoptimized
                            onError={(e) => {
                              e.target.onerror = null; // Prevent infinite loop
                              e.target.src = getAirlineFromIatacode(
                                firstDeparture?.carrierCode,
                              )?.logo;
                            }}
                          />
                          <div className="">
                            <h6 className=" mb-0 airport-name">
                              {getAirlineFromIatacode(firstDeparture?.carrierCode)?.name}
                            </h6>
                            <p className="airline-label mb-0 mt-1">
                              {firstDeparture?.number}{' '}
                            </p>
                            <p className="airline-label mt-0">
                              {aircraft[firstDeparture?.airCraftCode]}
                            </p>
                            {firstDeparture?.operatedBy && (
                              <p className="airline-label mt-0">
                                Operated By:{' '}
                                {carriers[firstDeparture?.operatedBy]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`${isAdmin ? 'flex  mt-3 ' : 'd-flex flex-row'}`}
                      >
                        <div className="">
                          <Image
                            src={departureImage}
                            alt="departure"
                            className="mb-1"
                            width={24}
                            height={24}
                          />
                          <div
                            className={`${isAdmin ? 'relative' : 'position-relative ml-7'}`}
                          >
                            <div
                              className={`${isAdmin ? 'relative dash-line' : 'position-relative dash-line'}`}
                            />

                            <div
                              className={`${isAdmin ? 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' : 'icon-md  text-white rounded-circle position-absolute top-50 start-50 translate-middle'}`}
                            >
                              <Image
                                src={aeroPlaneIcon}
                                alt="aeroplane"
                                className=""
                                width={24}
                                height={24}
                              />
                            </div>
                          </div>
                        </div>

                        <div
                          className={`${isAdmin ? 'relative ml-2' : 'position-relative ml-2'}`}
                        >
                          <div className="">
                            <h6 className="mb-0 body-text2 date-time-text">
                              {' '}
                              {moment(firstDeparture.departure?.at).format(
                                'DD, MMMM ddd',
                              )}
                              ,
                              {moment(firstDeparture.departure?.at).format(
                                ' HH:mm',
                              )}
                            </h6>
                          </div>
                          <h6
                            className={`${isAdmin ? 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 body-text2 mt-3 date-time-text ml-1' : 'mb-0 position-absolute top-50 start-10 mt-1 body-text2 date-time-text'}`}
                          >
                            {getHoursAndMinFromDuration(
                              firstDeparture?.duration,
                            )}
                          </h6>
                          <p className="mb-0 airport-name">
                            {(
                              getItemFromIatacode(
                                firstDeparture.departure?.iataCode,
                              ) ?? {}
                            ).name +
                              ` Airport (${firstDeparture?.departure.iataCode})`}
                          </p>
                          {firstDeparture.departure.terminal && (
                            <p className=" date-time-text mt-1">
                              Terminal{' '}
                              {firstDeparture.departure.terminal ?? 'unknown'}
                            </p>
                          )}
                        </div>

                        <div
                          className={`${isAdmin ? 'flex pl-4' : 'd-flex  mb-2 mb-sm-0 ms-auto airline-icon-image'}`}
                        >
                          <div
                            className={`${isAdmin ? 'flex ' : 'd-flex flex-row'}`}
                          >
                            <Image
                              src={airlineCodeImage}
                              className="w-30px h-30px me-2"
                              alt=""
                              width={33}
                              height={33}
                              unoptimized
                              onError={(e) => {
                                e.target.onerror = null; // Prevent infinite loop
                                e.target.src = getAirlineFromIatacode(
                                  firstDeparture.carrierCode,
                                )?.logo;
                              }}
                            />
                            <div className="">
                              <h6 className=" mb-0 airport-name">
                                {
                                  getAirlineFromIatacode(firstDeparture?.carrierCode)?.name
                                }
                              </h6>
                              <p className="airline-label mb-0 mt-1">
                                {firstDeparture?.number}{' '}
                              </p>
                              <p className="airline-label mt-0 mb-0">
                                {aircraft[firstDeparture?.airCraftCode]}
                              </p>
                              {firstDeparture?.operatedBy && (
                                <p className="airline-label mt-0">
                                  Operated By:{' '}
                                  {carriers[firstDeparture?.operatedBy]}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {transits?.map((segment, index) => {
                        const segmentAirlineCodeImage = require(
                          `../../shared-assets/images/airlines/${segment?.carrierCode}.webp`,
                        );
                        return (
                          <div
                            className={`${isAdmin ? 'flex ' : 'd-flex flex-row '}`}
                          >
                            <div className="">
                              <Image
                                src={transitIcon}
                                alt="transitTime"
                                className="mb-1"
                                width={24}
                                height={24}
                              />
                              <div
                                className={`${isAdmin ? 'relative' : 'position-relative ml-7'}`}
                              >
                                {/* Line */}

                                <div
                                  className={`${isAdmin ? 'relative dash-line' : 'position-relative dash-line'}`}
                                />
                                {/* Icon */}
                                <div
                                  className={`${isAdmin ? 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ' : 'icon-md text-white rounded-circle position-absolute top-50 start-50 translate-middle'}`}
                                >
                                  <Image
                                    src={aeroPlaneIcon}
                                    alt="aeroplane"
                                    className=""
                                    width={24}
                                    height={24}
                                  />
                                </div>
                              </div>
                            </div>
                            <div
                              className={`${isAdmin ? 'relative ml-2' : 'ml-2 position-relative body-text2'}`}
                            >
                              {moment(segment?.arrival?.at).format(
                                'DD, MMMM ddd',
                              )}{' '}
                              • {moment(segment?.arrival?.at).format(' HH: mm')}
                              <h6 className="airport-name">
                                Transit • {segment?.layoverTime} •{' '}
                                {(() => {
                                  const location = getItemFromIatacode(
                                    data[i]?.segments[index]?.arrival?.iataCode,
                                  );
                                  return (
                                    location?.name ??
                                    data[i]?.segments[index]?.arrival?.iataCode
                                  );
                                })()}
                              </h6>
                              <p className=" date-time-text mt-1">
                                {segment?.arrival?.terminal
                                  ? `Terminal  ${segment?.arrival?.terminal}`
                                  : null}
                              </p>
                              <h6
                                className={`${isAdmin ? 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-3 body-text2 date-time-text ml-1' : 'mb-0 position-absolute top-50 start-10 mt-1 body-text2 date-time-text'}`}
                              >
                                {getHoursAndMinFromDuration(segment?.duration)}
                              </h6>
                            </div>
                            <div
                              className={`${isAdmin ? 'flex pl-4' : 'd-flex   mb-2 mb-sm-0 ms-auto airline-icon-image'}`}
                            >
                              <div
                                className={`${isAdmin ? 'flex ' : 'd-flex flex-row'}`}
                              >
                                <Image
                                  src={segmentAirlineCodeImage}
                                  width={33}
                                  height={33}
                                  className="w-30px h-30px me-2"
                                  alt=""
                                  unoptimized
                                  onError={(e) => {
                                    e.target.onerror = null; // Prevent infinite loop
                                    e.target.src = getAirlineFromIatacode(
                                      segment?.carrierCode,
                                    )?.logo;
                                  }}
                                />
                                <div className="">
                                  <h6 className=" mb-0 airport-name">
                                    {getAirlineFromIatacode(firstDeparture?.carrierCode)?.name}
                                  </h6>
                                  <p className="airline-label mb-0 mt-1">
                                    {segment?.number}
                                  </p>
                                  <p className="airline-label mt-0 mb-0">
                                    {aircraft[segment?.airCraftCode]}
                                  </p>
                                  {segment?.operatedBy && (
                                    <p className="airline-label mt-0">
                                      Operated By:{' '}
                                      {carriers[segment?.operatedBy]}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div
                        className={`${isAdmin ? 'flex ' : 'd-flex flex-row mt-1 arrival-destination'}`}
                      >
                        <div className="">
                          <Image
                            src={destinationIcon}
                            alt="destination"
                            className="mb-2"
                            width={24}
                            height={24}
                          />
                        </div>
                        <div className="ml-2 body-text2 date-time-text">
                          {moment(lastArrival.arrival?.at).format(
                            'DD, MMMM ddd',
                          )}
                          ,{moment(lastArrival.arrival?.at).format(' HH:mm')} (
                          {lastArrival?.arrival?.iataCode})
                          <p className="mb-0 airport-name ">
                            {(
                              getItemFromIatacode(
                                lastArrival.arrival?.iataCode,
                              ) ?? {}
                            ).name +
                              `Airport (${lastArrival?.arrival?.iataCode})`}
                          </p>
                        </div>
                      </div>
                    </>
                  </div>
                </div>
              </>
            </>
          );
        })}
        {/* Ticket item END */}
      </div>
      {/* Card body END */}
    </div>
  );
};

export default NewModalTickets;
