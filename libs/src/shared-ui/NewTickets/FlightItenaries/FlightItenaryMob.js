import React, { useEffect, useState } from "react"
import Image from "next/image"
import moment from "moment"
import { getAirlineFromIatacode, getItemFromIatacode } from "@/utils"
import { getFirstAndLastIataCodes } from "@/utils/helpers/flightDetails"
import { TravelerFareDetails } from ".."
import { Tooltip } from "react-tooltip"

function FlightItenaryMob({
  itineraries,
  flightFilter,
  flightData,
  item,
  handleFlightDetailClick,
  getTransitInfo,
  flight,
  handleFlightSeatmap,
  priceApiLoading,
  formatTransitTime
}) {
  const [screenSize, setScreenSize] = useState({
    width: undefined
  })
  const [loadingFlightId, setLoadingFlightId] = useState(null)

  useEffect(() => {
    // Function to update the screen size
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth
      })
    }

    // Set initial size
    handleResize()

    // Add event listener to track window resizing
    window.addEventListener("resize", handleResize)

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handleBookNow = (flightData) => {
    setLoadingFlightId(flightData.id) // Set the ID of the flight that is loading
    handleFlightSeatmap(flightData) // Call the root function
  }

  return (
    <div className={`card ticket-container h-auto`}>
      <div
        className={`row ${itineraries.length > 1 ? "" : "align-items-center "}`}
      >
        <div className=" col-sm-12  px-3 for-mobile ">
          <div>
            {itineraries?.map((segments, i) => {
              const { firstDeparture, lastArrival } = getFirstAndLastIataCodes(
                segments?.segments
              )
              return (
                <>
                  <div className="container mb-4">
                    <div className="row g-3 align-items-center justify-content-center">
                      {/* Airport detail */}
                      {segments?.segments?.map((segment, index) => (
                        <React.Fragment key={index}>
                          {index === 0 && (
                            <>
                              {itineraries.length > 2 && (
                                <div className="col-12 ">
                                  {i != 0 && <hr className="mt-1" />}
                                  <h6 className={`${i === 0 ? "mt-3" : ""}`}>
                                    {getItemFromIatacode(firstDeparture).city ??
                                      ""}{" "}
                                    To{" "}
                                    {getItemFromIatacode(lastArrival).city ??
                                      ""}
                                  </h6>
                                </div>
                              )}
                              {itineraries.length > 2 ? (
                                <div className="col-12 pt-2 px-0">
                                  <div className={`mb-2 mb-md-0`} key={index}>
                                    <div className="row">
                                      <div
                                        className={`
                                          ${
                                            index === 0 && i === 0 && item === 0
                                              ? "col-4"
                                              : "col-8"
                                          }
                                        d-flex flex-row align-items-center justify-content-start`}
                                      >
                                        {getAirlineFromIatacode(
                                          segment?.carrierCode
                                        )?.logo && (
                                          <Image
                                            src={
                                              getAirlineFromIatacode(
                                                segment?.carrierCode
                                              )?.logo
                                            }
                                            className=" me-2 airline-image"
                                            alt={
                                              flightFilter[segment?.carrierCode]
                                                ?.name
                                            }
                                            width={30}
                                            height={30}
                                            unoptimized
                                          />
                                        )}

                                        <h6 className={`airline-iata mb-0`}>
                                          {flightFilter[segment?.carrierCode]
                                            ?.name.length > 15 &&
                                          index === 0 &&
                                          i === 0 &&
                                          item === 0
                                            ? flightFilter[
                                                segment?.carrierCode
                                              ]?.name.slice(0, 15)
                                            : flightFilter[segment?.carrierCode]
                                                ?.name}
                                        </h6>
                                      </div>

                                      {/* {index === 0 && i === 0 && item === 0 && (
                                        <div
                                          className={`col-4 d-flex align-items-center justify-content-center pt-1`}
                                        >
                                          <h6 className="cheap-tag ">
                                            Cheapest
                                          </h6>
                                        </div>
                                      )} */}
                                      <div className="col-4 d-flex align-items-center justify-content-end">
                                        <h6 className="seat-left text-end">
                                          {
                                            flightData?.data[item]
                                              ?.numberOfBookableSeats
                                          }{" "}
                                          seats left
                                        </h6>
                                      </div>
                                    </div>
                                  </div>
                                  <hr className="mt-1 " />
                                </div>
                              ) : (
                                i === 0 && (
                                  <div className="col-12 pt-0 px-0">
                                    <div
                                      className={`mb-2 mb-md-0 `}
                                      key={index}
                                    >
                                      <div className="row">
                                        <div
                                          className={`col-8 d-flex flex-row align-items-center justify-content-start mt-2`}
                                        >
                                          {getAirlineFromIatacode(
                                            segment?.carrierCode
                                          )?.logo && (
                                            <Image
                                              src={`/assets/images/airlines/${segment?.carrierCode}.webp`}
                                              // src={
                                              //   getAirlineFromIatacode(
                                              //     segment?.carrierCode
                                              //   )?.logo
                                              // }
                                              className=" me-2 airline-image"
                                              width={30}
                                              height={30}
                                              alt={
                                                flightFilter[
                                                  segment?.carrierCode
                                                ]?.name
                                              }
                                              unoptimized
                                              onError={(e) => {
                                                e.target.onerror = null // Prevent infinite loop
                                                e.target.src =
                                                  getAirlineFromIatacode(
                                                    segment?.carrierCode
                                                  )?.logo
                                              }}
                                            />
                                          )}

                                          <h6 className={`airline-iata mb-0`}>
                                            {/* {flightFilter[segment?.carrierCode]
                                              ?.name.length > 15 &&
                                            index === 0 &&
                                            i === 0 &&
                                            item === 0
                                              ? flightFilter[
                                                  segment?.carrierCode
                                                ]?.name.slice(0, 15)
                                              : flightFilter[
                                                  segment?.carrierCode
                                                ]?.name} */}
                                            {
                                              flightFilter[segment?.carrierCode]
                                                ?.name
                                            }
                                          </h6>
                                        </div>

                                        {/* {index === 0 &&
                                          i === 0 &&
                                          item === 0 && (
                                            <div
                                              className={`col-4 d-flex align-items-center justify-content-center pt-1`}
                                            >
                                              <h6 className="cheap-tag ">
                                                Cheapest
                                              </h6>
                                            </div>
                                          )} */}
                                        <div className="col-4 d-flex align-items-center justify-content-end">
                                          <h6 className="seat-left text-end">
                                            {
                                              flightData?.data[item]
                                                ?.numberOfBookableSeats
                                            }{" "}
                                            seats left
                                          </h6>
                                        </div>
                                      </div>
                                    </div>
                                    <hr className="mt-1 " />
                                  </div>
                                )
                              )}
                              <div className="col-4 d-flex flex-column mt-0 airline-time">
                                <h4 className="airline-time">
                                  {moment(segment.departure?.at).format(
                                    "HH:mm"
                                  )}
                                </h4>
                                <p className="mb-0 airline-destination-date">
                                  {segment.departure?.iataCode}{" "}
                                  <span
                                    className="p-0 mt-1 rounded-circle"
                                    style={{ fontSize: "11px" }}
                                  >
                                    •
                                  </span>{" "}
                                  {moment(segment.departure?.at).format(
                                    "D MMM"
                                  )}
                                </p>
                              </div>
                            </>
                          )}

                          {index === 0 && (
                            <div className="col-4 text-center mt-0 mb-2">
                              <h5 className="travel-duration">
                                {segments.duration.slice(2).replace("H", "H  ")}
                              </h5>
                              <div className="position-relative my-4">
                                <hr className="bg-primary opacity-5 position-relative" />
                                <div className="d-flex position-absolute top-50 start-50 translate-middle">
                                  {segments?.segments?.map((item, idx) => (
                                    <React.Fragment key={idx}>
                                      {item?.transitTime && (
                                        <div>
                                          <div
                                            className="p-2 transit-icon rounded-circle me-2 ms-3"
                                            data-tooltip-id={`${idx}-${item?.transitTime}-transit-tooltip`}
                                          >
                                            <Tooltip
                                              id={`${idx}-${item?.transitTime}-transit-tooltip`}
                                              content={() => (
                                                <p>
                                                  Transit:{" "}
                                                  {formatTransitTime(
                                                    item?.transitTime
                                                  )}
                                                </p>
                                              )}
                                              style={{
                                                fontSize: "10px",
                                                height: "30px"
                                              }}
                                            />
                                          </div>

                                          <div
                                            className="position-absolute  d-flex flex-wrap align-items-center start-50 translate-middle  "
                                            style={{
                                              top: "80%",
                                              marginTop: "1.5rem",
                                              flexWrap: "nowrap"
                                            }}
                                          >
                                            {" "}
                                            <p className="transit-airline ml-2 mt-3 d-flex align-items-center gap-3">
                                              {getTransitInfo(segments.segments)
                                                .split(" ")
                                                .map((word, idx) => (
                                                  <span
                                                    key={idx}
                                                    className="me-0"
                                                  >
                                                    {word}
                                                  </span>
                                                ))}
                                            </p>
                                          </div>
                                          {/* <Tooltip
                                            id={`${
                                              flightFilter[segment?.carrierCode]
                                                ?.name
                                            }-airline-name-tooltip`}
                                            content={() => (
                                              <p>
                                                {
                                                  flightFilter[
                                                    segment?.carrierCode
                                                  ]?.name
                                                }
                                              </p>
                                            )}
                                            style={{
                                              fontSize: "10px",
                                              height: "30px"
                                            }}
                                          /> */}
                                          {/* </> */}
                                          {/* )} */}
                                          {/* </div> */}
                                        </div>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {segments.segments?.length - 1 === index && (
                            <div className="col-4 mt-0 airline-time">
                              <h4 className="airline-time">
                                {moment(segment.arrival?.at).format("HH:mm")}
                              </h4>
                              <p className="mb-0 airline-destination-date">
                                {segment.arrival?.iataCode}{" "}
                                <span
                                  className=" mt-1 rounded-circle"
                                  style={{ fontSize: "11px" }}
                                >
                                  •
                                </span>{" "}
                                {moment(segment.arrival?.at).format("D MMM")}
                              </p>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </>
              )
            })}
          </div>
        </div>

        <div className=" col-sm-12 booking-detail-for-mobile ">
          <hr className="hr-line" />
          <div className="row g-2">
            <TravelerFareDetails
              travelerPricings={flight?.travelerPricings}
              className="col-4 d-flex  align-items-start justify-content-start pr-3 booking-detail pl-4"
            />

            <div className="col-8 d-flex flex-row price-detail  justify-content-end pr-4">
              {/* <p className="text-secondary p-2">
                ${flight?.price?.offeredPrice}{" "}
                <span className="discounted-price">- $21 =</span>
              </p>{" "} */}
              <h4>${flight?.price?.total + " "}</h4>
            </div>
          </div>

          <div className="row  mt-3 px-3 ">
            {screenSize.width <= 768 && screenSize.width > 450 && (
              <div className="col-6"></div>
            )}
            <div
              style={{ color: "#F7941E" }}
              className={` pr-1 flight-detail-text ${
                screenSize.width <= 768 && screenSize.width > 450
                  ? "col-3"
                  : "col-6"
              }`}
              data-bs-toggle="modal"
              data-bs-target="#flightdetail"
              onClick={() => handleFlightDetailClick(flight)}
            >
              <button className={`custom-flight-button `}>View Deals</button>
            </div>
            <div
              className={` pl-1 ${
                screenSize.width <= 768 && screenSize.width > 450
                  ? "col-3"
                  : "col-6"
              }`}
            >
              <button
                className={`btn btn-primary custom-book-button`}
                disabled={priceApiLoading && loadingFlightId === flight.id}
                onClick={() => handleBookNow(flight)}
              >
                {loadingFlightId === flight.id && (
                  <Image
                    className="me-3"
                    src="/assets/images/loading-gif.gif"
                    alt="loader"
                    width="20"
                    height="20"
                  />
                )}{" "}
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlightItenaryMob
