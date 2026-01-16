// FlightItineraries.js
import React from "react"
import Image from "next/image"
import moment from "moment"
import { getAirlineFromIatacode, getItemFromIatacode } from "@/utils"
import { getFirstAndLastIataCodes } from "@/utils/helpers/flightDetails"
import { TravelerFareDetails } from ".."
import { Tooltip } from "react-tooltip"

const FlightItineraries = ({
  itineraries,
  tripType,
  flightFilter,
  handleFlightDetailClick,
  getTransitInfo,
  formatTransitTime,
  flight
}) => {
  return (
    <div className={`card ticket-container h-auto`}>
      <div
        className={`row ${itineraries.length > 1 ? "" : "align-items-center "}`}
      >
        <div className="col-md-9 col-sm-12 pr-0 for-web h-100">
          <div>
            {itineraries?.map((segments, i) => {
              const { firstDeparture, lastArrival } = getFirstAndLastIataCodes(
                segments?.segments
              )
              return (
                <React.Fragment key={i}>
                  <div className="row g-2 h-100 flex justify-center items-center">
                    {segments?.segments?.map((segment, index) => (
                      <React.Fragment key={index}>
                        {index === 0 && (
                          <>
                            {tripType === "MULTI_CITY" && (
                              <div className="col-12 mb-0">
                                <h6 className="pl-4 multi-city-destinations mt-3 mb-0">
                                  {getItemFromIatacode(
                                    firstDeparture
                                  )?.city.toUpperCase() ?? ""}{" "}
                                  TO{" "}
                                  {getItemFromIatacode(
                                    lastArrival
                                  )?.city.toUpperCase() ?? ""}
                                </h6>
                              </div>
                            )}
                            <div
                              className={`col-sm-2 ${
                                itineraries.length === 1 ? "pt-0" : "pt-3"
                              } pb-0`}
                            >
                              <div className="d-flex flex-column align-items-center justify-content-center mb-2 mb-md-0">
                                {getAirlineFromIatacode(segment?.carrierCode)
                                  ?.logo ? (
                                  <Image
                                    src={`/assets/images/airlines/${segment?.carrierCode}.webp`}
                                    className="w-30px me-2"
                                    width={30}
                                    height={30}
                                    alt={
                                      flightFilter[segment?.carrierCode]?.name
                                    }
                                    unoptimized
                                    onError={(e) => {
                                      e.target.onerror = null
                                      e.target.src = getAirlineFromIatacode(
                                        segment?.carrierCode
                                      )?.logo
                                    }}
                                  />
                                ) : null}
                                <h6
                                  className="airline-iata mb-0"
                                  data-tooltip-id={`${
                                    flightFilter[segment?.carrierCode]?.name
                                  }-airline-name-tooltip`}
                                >
                                  {flightFilter[segment?.carrierCode]?.name
                                    ?.length > 10
                                    ? `${flightFilter[
                                        segment?.carrierCode
                                      ]?.name.slice(0, 10)}...`
                                    : flightFilter[segment?.carrierCode]?.name}
                                </h6>
                                <Tooltip
                                  id={`${
                                    flightFilter[segment?.carrierCode]?.name
                                  }-airline-name-tooltip`}
                                  content={() => (
                                    <p>
                                      {flightFilter[segment?.carrierCode]?.name}
                                    </p>
                                  )}
                                  style={{ fontSize: "10px", height: "30px" }}
                                />
                              </div>
                            </div>
                            <div className="col-sm-3 pt-2 mb-0">
                              <h4 className="airline-time">
                                {moment(segment.departure?.at).format("HH:mm")}
                              </h4>
                              <p className="mb-0 airline-destination-date">
                                {segment.departure?.iataCode}{" "}
                                <span className="p-1 mt-1 rounded-circle">
                                  •
                                </span>{" "}
                                {moment(segment.departure?.at).format("D MMM")}
                              </p>
                            </div>
                          </>
                        )}

                        {index === 0 && (
                          <div className="col-sm-4 text-center">
                            <h5 className="travel-duration mt-2">
                              {segments.duration.slice(2).replace("H", "H  ")}
                            </h5>
                            <div className="position-relative">
                              <hr className="bg-primary opacity-5 position-relative" />
                              <div className="d-flex flex-row position-absolute top-50 start-50 translate-middle">
                                {segments.segments.length > 1 &&
                                  segments.segments.map((item, idx) => (
                                    <React.Fragment key={idx}>
                                      {item?.transitTime && (
                                        <div>
                                          <div
                                            className="p-2 transit-icon rounded-circle me-4 ms-4"
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
                                            className="position-absolute d-flex flex-wrap align-items-center start-50 translate-middle"
                                            style={{
                                              top: "80%",
                                              marginTop: "1.5rem",
                                              flexWrap: "nowrap"
                                            }}
                                          >
                                            <p className="transit-airline mt-1 d-flex align-items-center gap-5">
                                              {getTransitInfo(segments.segments)
                                                .split(" ")
                                                .map((word, wordIdx) => (
                                                  <span
                                                    key={wordIdx}
                                                    className="me-0"
                                                  >
                                                    {word}
                                                  </span>
                                                ))}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </React.Fragment>
                                  ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {segments.segments?.length - 1 === index && (
                          <div className="col-sm-3 pt-2 pl-4 pr-0">
                            <h4 className="airline-time">
                              {moment(segment.arrival?.at).format("HH:mm")}
                            </h4>
                            <p className="mb-0 airline-destination-date">
                              {segment.arrival?.iataCode}{" "}
                              <span
                                className="p-1 mt-1 rounded-circle"
                                style={{ fontSize: "20px" }}
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
                </React.Fragment>
              )
            })}
          </div>
        </div>

        <div className="col-md-3 col-sm-12 booking-detail-for-web border-start">
          <TravelerFareDetails
            travelerPricings={flight?.travelerPricings}
            className="d-flex pt-2 booking-detail"
          />
          <div className="pt-0">
            <h6 className="seat-left mb-0">
              {flight?.numberOfBookableSeats} seats left
            </h6>
          </div>
          <div className="d-flex">
            <h4 className="flight-price mr-3 mb-1">${flight?.price?.total}</h4>
            {/* <span className="text-bottom ml-1 mr-1">/pax</span> */}
          </div>
          <div className="d-flex">
            {/* <h4 className="valentine-discount mr-3 mb-1">
              Valentine Deal: <span>- $21</span>
            </h4> */}
            {/* <span className="text-bottom ml-1">/pax</span> */}
          </div>
          {/* <div className="pb-1">
            <span className="text-secondary">
              <s>AUD {flight?.price?.offeredPrice} </s>
            </span>
          </div> */}
          {/* <div className="pb-1 d-flex justify-content-end mr-3">
            <span>
              <s className="text-old-price">${flight?.price?.offeredPrice} </s>
            </span>
          </div> */}

          <div className="w-full pb-2">
            <div
              style={{ color: "#F7941E" }}
              className="flight-detail-text"
              data-bs-toggle="modal"
              data-bs-target="#flightdetail"
              onClick={() => handleFlightDetailClick(flight)}
            >
              <button className="custom-flight-button mt-2">View Deals</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlightItineraries
