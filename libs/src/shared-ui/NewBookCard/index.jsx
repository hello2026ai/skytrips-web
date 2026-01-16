import React, { useEffect, useState, useContext } from "react"
import { getAirlineFromIatacode, getItemFromIatacode } from "@utils"
import moment from "moment"
import { BsArrowRight } from "react-icons/bs"
import "./styles.scss"
import { BookingContext } from "@/context/BookingContext"
import { extractFlightInfo } from "@/utils/helpers/flightDetails"
import Image from "next/image"

const NewBookCard = (props) => {
  const { data, passengerCount } = props

  const { searchData } = useContext(BookingContext)

  const selectedTripType =
    searchData && searchData?.tripType === "ROUND_TRIP"
      ? "Round Trip"
      : searchData?.tripType === "ONE_WAY"
      ? "One Way"
      : "Multi City"
  const selectedTravelClass =
    searchData && searchData?.travelClass === "ECONOMY"
      ? "Economy"
      : searchData?.travelClass === "BUSINESS"
      ? "Business"
      : "First Class"

  const [contactDetails, setContactDetails] = useState("")

  useEffect(() => {
    const domain = window.location.hostname // Get the current domain

    console.log("domain", domain)
    if (domain.includes("skytrips.com.au")) {
      setContactDetails("+61 2 4072 0886")
    } else if (domain.includes("skytrips.com.np")) {
      setContactDetails("+977 9802378762")
    } else {
      setContactDetails("+61 2 4072 0886")
    }
  }, [])

  const [showFlightDetail, setShowFlightDetail] = useState(true)

  useEffect(() => {
    localStorage.setItem("selectedTripType", selectedTripType)
    localStorage.setItem("selectedTravelClass", selectedTravelClass)

    if (data) {
      localStorage.setItem("flightDetails", JSON.stringify(data))
    }

    if (passengerCount) {
      localStorage.setItem("passengerCount", passengerCount.toString())
    }
  }, [selectedTripType, selectedTravelClass, data, passengerCount])

  const handleFlightDetail = (e) => {
    e.preventDefault()
    setShowFlightDetail(!showFlightDetail)
  }

  const getGMTOffset = () => {
    // Create a date to get the offset
    const date = new Date()
    const offset = date.getTimezoneOffset()
    const hours = Math.floor(Math.abs(offset) / 60)
    const minutes = Math.abs(offset) % 60
    const sign = offset > 0 ? "-" : "+"

    // Format the offset string
    const formattedOffset = `GMT ${sign}${hours < 10 ? "0" : ""}${hours}:${
      minutes < 10 ? "0" : ""
    }${minutes}`
    return formattedOffset
  }

  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateSize = () => {
      const newWidth = window.innerWidth
      setSize({ width: newWidth, height: window.innerHeight })

      if (newWidth && newWidth <= 768) {
        setShowFlightDetail(false)
      } else {
        setShowFlightDetail(true)
      }
    }

    updateSize() // Set initial size
    window.addEventListener("resize", updateSize)

    return () => window.removeEventListener("resize", updateSize)
  }, [])

  return (
    <>
      {/* Ticket START */}
      {data?.map((flight, index) => {
        const itineraries = flight?.itineraries

        return (
          <div className="book-card-section">
            <div className="book-card-container">
              {itineraries?.map((segments, i) => {
                const { firstDeparture, lastArrival, transits } =
                  extractFlightInfo(segments?.segments)
                const lastItinerary = itineraries[itineraries.length - 1]
                const lastItineraryFirstDeparture =
                  lastItinerary?.segments[0]?.departure?.at

                const lastItineraryLastArrival =
                  lastItinerary?.segments[lastItinerary?.segments?.length - 1]
                    ?.arrival.iataCode

                return (
                  <div>
                    {i === 0 && (
                      <div className="d-flex trip-info-container align-items-center justify-content-center">
                        <div className=" ">
                          {/* Title */}
                          <div className="d-flex  align-items-center justify-content-center mb-0">
                            <div className=" me-2">
                              <h3 className="destination-location mb-0">
                                {`${
                                  getItemFromIatacode(
                                    segments?.segments[0]?.departure?.iataCode
                                  ).city
                                } 
                         
                          `}
                              </h3>
                            </div>
                            <div className="me-2">
                              <h3 className="mb-0">
                                {selectedTripType === "One Way" ||
                                selectedTripType === "Multi City" ? (
                                  <BsArrowRight color="white" size="20px" />
                                ) : (
                                  <Image
                                    src="assets/images/icons/roundTripArrow.svg"
                                    alt="round_trip_arrow"
                                    className="mb-1"
                                    width={23}
                                    height={23}
                                  />
                                )}
                              </h3>
                            </div>
                            <div className="me-0">
                              {selectedTripType === "Multi City" ? (
                                <h3 className="destination-location mb-0">
                                  {`${
                                    getItemFromIatacode(
                                      lastItineraryLastArrival
                                    ).city
                                  } `}
                                </h3>
                              ) : (
                                <h3 className="destination-location mb-0">
                                  {`${
                                    getItemFromIatacode(
                                      segments?.segments[
                                        segments?.segments?.length - 1
                                      ]?.arrival?.iataCode
                                    ).city
                                  } `}
                                </h3>
                              )}
                            </div>
                          </div>
                          {/* List */}
                          <div className="flight-date d-flex align-items-center justify-content-center mb-2">
                            <div className="">
                              {moment(
                                segments?.segments[0]?.departure?.at
                              ).format("DD MMM")}{" "}
                              {/* {"-"}{" "} */}
                              {selectedTripType !== "One Way" &&
                              lastItineraryFirstDeparture
                                ? "- " +
                                  moment(lastItineraryFirstDeparture).format(
                                    "DD MMM"
                                  )
                                : ""}
                            </div>
                          </div>
                          <div className="mb-2 text-center">
                            {selectedTripType} • {passengerCount}{" "}
                            {passengerCount > 1 ? "Passengers" : "Passenger"} •{" "}
                            {selectedTravelClass}
                          </div>
                        </div>
                        {/* Title and content END */}
                      </div>
                    )}
                    {/* {itineraries?.map((segments, i) => ( */}
                    <>
                      <div className="departure-detail">
                        {(i <= 0 || selectedTripType === "Multi City") && (
                          <div className="d-flex align-item-center gap-2  px-2 py-2 ">
                            <div className="dep-arrival-div">Depart</div>
                            <div className="date-time">
                              {moment(
                                segments?.segments[0]?.departure?.at
                              ).format("ddd, D MMM")}{" "}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="departure-detail pb-2">
                        {i === 1 && selectedTripType === "Round Trip" && (
                          <div className="d-flex align-item-center gap-2  px-2 py-2 ">
                            <div className="dep-arrival-div">Return</div>
                            <div className="date-time">
                              {moment(
                                segments?.segments[0]?.departure?.at
                              ).format("ddd, D MMM")}{" "}
                            </div>
                          </div>
                        )}
                        {showFlightDetail && (
                          <div className="card-body px-2">
                            {segments?.segments?.map((segment, index) => {
                              const airline = getAirlineFromIatacode(
                                segment?.carrierCode
                              )
                              const depIata = getItemFromIatacode(
                                segment?.departure?.iataCode
                              )
                              const arrivalIata = getItemFromIatacode(
                                segment?.arrival?.iataCode
                              )

                              return (
                                <>
                                  {index == 0 && (
                                    <div className="d-flex align-items-center justify-content-left mb-3">
                                      <Image
                                        src={`/assets/images/airlines/${segment?.carrierCode}.webp`}
                                        // src={airline?.logo ?? ""}
                                        className=" me-3"
                                        alt={airline.name ?? "Unknown Airline"}
                                        width={33}
                                        height={33}
                                        unoptimized
                                        onError={(e) => {
                                          e.target.onerror = null // Prevent infinite loop
                                          e.target.src = airline?.logo
                                        }}
                                      />
                                      {/* Title */}
                                      <div>
                                        <h6 className="fw-normal ">
                                          {`
                                          ${airline?.name ?? "Unknown Airline"} 
                                          `}
                                        </h6>
                                        <p className="mb-0">
                                          {firstDeparture?.number}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  {/* Airport detail */}
                                  {index !== segments?.segments.length - 1}{" "}
                                  <div className="d-flex align-items-top justify-content-left mt-0 airport-detail">
                                    {/* Title */}

                                    <div className="time-travel-container">
                                      <h6 className="mb-0">
                                        {moment(segment.departure?.at).format(
                                          "HH:mm"
                                        )}
                                      </h6>
                                      <div class="vertical-dotted-border" />
                                    </div>

                                    <div className="ml-3">
                                      <p
                                        className={`mb-0 ${
                                          segments?.segments.length > 1 &&
                                          index !== 0
                                            ? "transit-detail"
                                            : ""
                                        }`}
                                      >
                                        {segments?.segments.length > 1 &&
                                        index !== 0
                                          ? "Transit - "
                                          : ""}
                                        {depIata?.name ?? "Unknown"} Airport{" "}
                                        {`${
                                          segment?.departure?.terminal
                                            ? "• Ter " +
                                              segment.departure?.terminal
                                            : ""
                                        }`}
                                      </p>
                                    </div>
                                  </div>
                                  {/* Airport detail */}
                                  {index === segments?.segments.length - 1 && (
                                    <div className="d-flex align-items-top justify-content-left airport-detail">
                                      <h6>
                                        {moment(segment.arrival?.at).format(
                                          "HH:mm"
                                        )}
                                      </h6>

                                      <div>
                                        <p className="mb-0 ml-3 mt-0">
                                          {arrivalIata?.name ?? "Unknown "}{" "}
                                          Airport
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  </div>
                )
              })}
              {!showFlightDetail && (
                <div
                  className="d-flex align-items-center justify-content-end pr-2 cursor-pointer pb-2"
                  onClick={(e) => handleFlightDetail(e)}
                >
                  Show More{" "}
                  <span>
                    <Image
                      src="/assets/images/icons/dropdownIcon.svg"
                      width={20}
                      height={20}
                    />
                  </span>
                </div>
              )}

              {showFlightDetail && (
                <div
                  className="d-flex align-items-center justify-content-end pr-2 cursor-pointer pb-2"
                  onClick={(e) => handleFlightDetail(e)}
                >
                  Show Less{" "}
                  <span>
                    <Image
                      src="/assets/images/icons/right_arrow.svg"
                      width={20}
                      height={20}
                    />
                  </span>
                </div>
              )}
            </div>

            <div>
              <p className="time-zone">
                Times are displayed based on your local time zone:{" "}
                {getGMTOffset()}
              </p>
            </div>

            {/* <p className="hotline-text mb-0">
                <span>
                  <Image
                    src="/assets/images/contact/hotlineCallValentine.svg"
                    width={30}
                    height={30}
                  />
                </span>{" "}
                Support:
                <a
                  href={`tel:${contactDetails}`}
                  className="hover:underline call-link"
                >
                  {contactDetails}
                </a>
              </p> */}
            {/* <a
                href={`tel:${contactDetails}`}
                className=" hover:underline support-number"
              > */}
            <div className="hotline mt-2 support-number">
              <p className="hotline-text mb-0 ">
                <span>
                  <Image
                    // src="/assets/images/contact/hotlineCallValentine.svg"
                    src="/assets/images/contact/hotlineCall.svg"
                    width={30}
                    height={30}
                  />
                </span>{" "}
                Support:{" "}
                {/* <span className="support-number">{contactDetails}</span> */}
                {contactDetails}
              </p>
            </div>
            {/* </a> */}
            <a href={`tel:${contactDetails}`} className="  call-link">
              {" "}
              <div className="hotline mt-2">
                <p className="hotline-text mb-0">
                  <span>
                    <Image
                      // src="/assets/images/contact/hotlineCallValentine.svg"
                      src="/assets/images/contact/hotlineCall.svg"
                      width={30}
                      height={30}
                    />
                  </span>{" "}
                  Support:{" "}
                  {/* <span className="support-number">{contactDetails}</span> */}
                  {contactDetails}
                </p>
              </div>
            </a>

            {/* ))} */}
            {/* <BaggageModal flight={flight} id={`baggageFare-${index}`} /> */}
          </div>
        )
      })}
      {/* Ticket END */}
    </>
  )
}

export default NewBookCard
