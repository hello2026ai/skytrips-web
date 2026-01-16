import React, { useState } from "react"
import { useRouter } from "next/router"
import lzutf8 from "lzutf8"
import {
  calculateTimeDifference,
  formattedTime,
  getAirlineFromIatacode,
  getItemFromIatacode
} from "../../shared-utils"
import moment from "moment"

import Modal from "../Modal"

import { Tooltip } from "react-tooltip"

import "./styles.scss"
import { STORAGE_KEYS, getValueOf } from "../../shared-service/storage"

const Tickets = (props) => {
  const { flightData, flightFilter } = props

  // variables
  const router = useRouter()

  const [singleFlightData, setSingleFlightData] = useState()
  const [singleFlightPrice, setSingleFlightPrice] = useState()

  // handle flight detail modal
  const handleFlightDetailClick = (flight) => {
    const segments = flight.itineraries
    const price = flight.price
    setSingleFlightData(segments)
    setSingleFlightPrice(price)
  }

  // handle flight detail
  const handleFlightSeatmap = (flight) => {
    console.log("handleFlightSeatmap data in ticket", flight)

    // Convert the object to a string using JSON.stringify()
    // const selectedFlight = JSON.stringify(flight)

    // localStorage.setItem("selectedFlight", selectedFlight)
    // console.log("selectedFlight l", localStorage.getItem("selectedFlight"))''
    const userUniqueId = getValueOf(STORAGE_KEYS.CLIENT_UNIQUE_ID) || ""

    if (!userUniqueId.trim()) {
      router.push("/error")
      return
    }

    try {
      router.push({
        pathname: "/book",
        query: {
          searchParams: lzutf8.compress(JSON.stringify(flight), {
            outputEncoding: "Base64"
          }),

          // user_unique_id: getValueOf(STORAGE_KEYS.CLIENT_UNIQUE_ID)
          //   ? getValueOf(STORAGE_KEYS.CLIENT_UNIQUE_ID)
          //   : router.push("/error")
          user_unique_id: userUniqueId
        }
      })
    } catch (error) {
      router.push("/error")
    }
  }

  const getTransitInfo = (item) => {
    let info = ""

    console.log({ item })

    return (
      <>
        <p>{}</p>
      </>
    )
  }

  return (
    <>
      {flightData?.data?.map((flight, index) => {
        const itineraries = flight?.itineraries
        return (
          <div className="card border ticket-container mb-1">
            <div className="card-header">
              <div className="d-md-flex justify-content-md-between">
                {/* Airline Name */}
                <div className="ticket-container-airlines d-flex overflow-auto">
                  {itineraries?.map((segments, index) =>
                    segments?.segments?.map((segment, index) => (
                      <div
                        className="d-flex align-items-center mb-2 mb-md-0"
                        key={index}
                      >
                        {getAirlineFromIatacode(segment?.carrierCode)?.logo ? (
                          <img
                            src={
                              getAirlineFromIatacode(segment?.carrierCode)?.logo
                            }
                            className="w-30px me-2"
                            alt={flightFilter[segment?.carrierCode]?.name}
                          />
                        ) : (
                          ""
                        )}
                        <h6 className="fw-normal mb-0">
                          {`
                          ${flightFilter[segment?.carrierCode]?.name} (${
                            segment?.carrierCode
                          } - ${segment?.number})
                        `}
                        </h6>
                      </div>
                    ))
                  )}
                </div>
                {/* <h6 className="fw-normal mb-0">
                  <span className="text-body">
                    Travel Class:
                  </span>{" "}
                  Economy
                </h6> */}
              </div>
            </div>
            {/* Card body START */}
            <div className="card-body p-4 pb-0">
              <div className="row g-4 align-items-center">
                {/* Ticket START */}
                <div className="col-md-9">
                  {/* Ticket detail START */}
                  {itineraries?.map((segments, i) => (
                    <>
                      <div className="row g-4">
                        {/* Airport detail */}
                        {segments?.segments?.map((segment, index) => (
                          <React.Fragment key={index}>
                            {index === 0 && (
                              <div className="col-sm-4">
                                <h4>
                                  {moment(segment.departure?.at).format(
                                    "HH:mm"
                                  )}
                                </h4>
                                <h6 className="mb-0 fw-normal">
                                  {moment(segment.departure?.at).format(
                                    "ddd, DD MMMM YYYY"
                                  )}
                                </h6>
                                <p className="mb-0">
                                  {`${segment.departure?.iataCode} -  ${
                                    segment.departure?.terminal
                                      ? "Terminal " +
                                        segment.departure?.terminal +
                                        ","
                                      : ""
                                  } ${
                                    getItemFromIatacode(
                                      segment.departure?.iataCode
                                    ).city
                                  }, ${
                                    getItemFromIatacode(
                                      segment.departure?.iataCode
                                    ).country
                                  }`}
                                </p>
                              </div>
                            )}
                            {/* Time */}
                            {index === 0 && (
                              <div className="col-sm-4 my-sm-auto text-center">
                                <h5>
                                  {segments.duration
                                    .slice(2)
                                    .replace("H", "H  ")}
                                </h5>
                                <div className="position-relative my-4">
                                  {/* Line */}

                                  <hr className="bg-primary opacity-5 position-relative" />

                                  {/* Icon */}
                                  <div className="d-flex position-absolute top-50 start-50 translate-middle">
                                    {segments?.segments?.map((item, index) => (
                                      <div id={`${segment.id}-tooltip`}>
                                        {index % 2 === 0 && (
                                          <div className="icon-md bg-primary-new text-white rounded-circle  ms-2">
                                            <i className="fa-solid fa-fw fa-plane rtl-flip" />
                                          </div>
                                        )}

                                        {/* <Tooltip
                                          anchorId={`${segment.id}-tooltip`}
                                          place="bottom"
                                          variant="info"
                                          content={() => getTransitInfo(item)}
                                        /> */}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <p>
                                  {/* {
                                    Math.ceil(segments?.segments?.length / 2)
                                  }{" "}
                                  {Math.ceil(segments?.segments?.length / 2)
                                    ? "stops"
                                    : "stop"} */}
                                  {segments?.segments?.length === 1
                                    ? "Non-stop"
                                    : segments?.segments?.length === 2
                                    ? "1 Stop"
                                    : "2+ Stops"}{" "}
                                </p>
                              </div>
                            )}
                            {/* Airport detail */}
                            {segments.segments?.length - 1 === index && (
                              <div className="col-sm-4">
                                <h4>
                                  {moment(segment.arrival?.at).format("HH:mm")}
                                </h4>
                                <h6 className="mb-0 fw-normal">
                                  {moment(segment.arrival?.at).format(
                                    "ddd, DD MMMM YYYY"
                                  )}
                                </h6>
                                <p className="mb-0">
                                  {`${segment.arrival?.iataCode} -  ${
                                    segment.arrival?.terminal
                                      ? "Terminal " +
                                        segment.arrival?.terminal +
                                        ","
                                      : ""
                                  } ${
                                    getItemFromIatacode(
                                      segment.arrival?.iataCode
                                    )?.city
                                  }, ${
                                    getItemFromIatacode(
                                      segment.arrival?.iataCode
                                    )?.country
                                  }`}
                                </p>
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      {itineraries?.length - 1 !== i && <hr className="my-4" />}
                    </>
                  ))}
                  {/* Ticket detail END */}
                  {/* Divider */}
                </div>
                {/* Ticket END */}
                {/* Price START */}
                <div className="col-md-3 text-md-end">
                  {/* Price */}
                  <h4>
                    {flightData?.data[index]?.price?.currency +
                      " " +
                      flightData?.data[index]?.price?.total}
                  </h4>
                  <div>
                    <div
                      style={{ color: "#F7941E" }}
                      className="btn btn-link body-R2 p-0 mb-0 text-decoration-none flight-detail-text mt-3"
                      data-bs-toggle="modal"
                      data-bs-target="#flightdetail"
                      onClick={() =>
                        handleFlightDetailClick(flightData?.data[index])
                      }
                    >
                      <i className="bi bi-eye-fill me-1" />
                      View Details
                    </div>
                  </div>
                  <div>
                    <button
                      // href="flight-detail.html"
                      className="btn btn-primary mb-0 mt-sm-3 custom-book-button"
                      onClick={() => handleFlightSeatmap(flight)}
                    >
                      Book Now
                    </button>
                  </div>

                  <Modal
                    data={singleFlightData}
                    id="flightdetail"
                    price={singleFlightPrice}
                    flightFilter={flightFilter}
                  />
                </div>
                {/* Price END */}
              </div>
              {/* Row END */}
            </div>
            {/* Card body END */}
            {/* Card footer */}
            <div className="card-footer pt-4">
              <div className="">
                <ul className="list-inline bg-light d-sm-flex text-center justify-content-sm-between rounded-2 py-2 px-4 mb-0">
                  <li className="list-inline-item text-danger">
                    Only {flightData?.data[index]?.numberOfBookableSeats} Seat
                    Left
                  </li>
                  {/* <li className="list-inline-item text-success">
                    Refundable
                  </li> */}
                </ul>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default Tickets
