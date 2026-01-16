import React, { useEffect, useState } from "react"
import NewModalTickets from "../NewModalTickets"
import "./styles.scss"
import BaggageTab from "./BaggageTab"
import { useRouter } from "next/router"
import Image from "next/image"
import { FaTag } from "react-icons/fa"

const NewFlightDetail = (props) => {
  const {
    data,
    price,
    flightFilter,
    amenities,
    dictionaries,
    handleFlightSeatmap,
    flightInfo,
    singleTravelerPricing,
    priceApiLoading
  } = props

  const router = useRouter()

  const allAmenities =
    amenities && amenities.flatMap((segment) => segment.amenities || [])

  const uniqueAmenities = Array.from(
    new Set(
      allAmenities && allAmenities.map((amenity) => JSON.stringify(amenity))
    )
  ).map((amenity) => JSON.parse(amenity))

  const MealData =
    uniqueAmenities && uniqueAmenities.filter((i) => i.amenityType === "MEAL")

  const today = new Date()

  const formattedDate = `${today.getDate()} ${today
    .toLocaleDateString(undefined, { month: "short" })
    .toLowerCase()}`

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const [cancellationTimeInUserTimeZone, setCancellationTimeInUserTimeZone] =
    useState("00:00")

  useEffect(() => {
    const australianTime = new Date("2023-11-20T22:00:00+11:00")

    // Convert AEST to user's time zone
    const userTime = new Date(
      australianTime.toLocaleString("en-US", { timeZone: userTimeZone })
    )
    const formattedUserTime = userTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })

    setCancellationTimeInUserTimeZone(formattedUserTime)
  }, [userTimeZone])

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
  const [openBaggageIndex, setOpenBaggageIndex] = useState(0)

  useEffect(() => {
    setOpenBaggageIndex(0)
  }, [singleTravelerPricing])
  const handleBaggage = (index) => {
    setOpenBaggageIndex(openBaggageIndex === index ? null : index)
  }

  const adultTraveler =
    singleTravelerPricing &&
    singleTravelerPricing.find((item) => item.travelerType === "ADULT")
  const childTraveler =
    singleTravelerPricing &&
    singleTravelerPricing.find((item) => item.travelerType === "CHILD")
  const infantTraveler =
    singleTravelerPricing &&
    singleTravelerPricing.find((item) => item.travelerType === "HELD_INFANT")

  const adultCount = singleTravelerPricing.filter(
    (traveler) => traveler.travelerType === "ADULT"
  ).length
  const childCount = singleTravelerPricing.filter(
    (traveler) => traveler.travelerType === "CHILD"
  ).length
  const infantCount = singleTravelerPricing.filter(
    (traveler) => traveler.travelerType === "HELD_INFANT"
  ).length

  const handleCancellationInfo = () => {
    // const flightModal = document.getElementById("flightdetail")
    // $(flightModal).modal("hide")
    // router.push("/terms-and-conditions")
    window.open("/terms-and-conditions", "_blank", "noopener,noreferrer")
  }

  return (
    <div className="modal-dialog modal-lg" id="flight-modal">
      <div className="modal-content px-3">
        {/* Title */}
        <div className="modal-header">
          <h6 className="modal-text pt-2">Details</h6>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        </div>
        {/* Body */}
        <div className="modal-body btn-modal-groups p-3">
          {/* Tabs START */}
          <ul
            className="nav nav-pills nav-justified nav-responsive bg-opacity-10 py-2 px-0 mb-3"
            id="flight-pills-tab"
            role="tablist"
          >
            {/* Flight Details tab */}
            <li className="nav-item " role="presentation">
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
            </li>
            {/* Fare tab item */}
            <li className="nav-item" role="presentation">
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
            </li>

            {/* Baggage tab item */}
            <li className="nav-item" role="presentation">
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
            </li>
            {/* Cancellation tab item */}
            <li className="nav-item" role="presentation">
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
            </li>
            {/* Amenities tab items */}
            <li className="nav-item pr-0" role="presentation">
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
            </li>
          </ul>
          {/* Tabs END */}
          {/* Tab content START */}
          <div className="tab-content mb-0" id="flight-pills-tabContent">
            {/* Flight Details content item START */}
            <div
              className="tab-pane fade show active"
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
            {/* Flight Details  content item END */}

            {/* Fare Content item START */}
            <div
              className="tab-pane fade"
              id="flight-fare-tab"
              role="tabpanel"
              aria-labelledby="flight-fare"
            >
              <div className="card card-body">
                <div className="fare-container">
                  <div className="row">
                    <div className="col-7 ">
                      <p className="pb-2">Base fare (Adult) x{adultCount}</p>
                      {childCount > 0 && (
                        <p className="pb-2">Base fare (Child) x{childCount}</p>
                      )}
                      {infantCount > 0 && (
                        <p className="pb-2">
                          Base fare (Infant) x{infantCount}
                        </p>
                      )}
                      <p>Tax</p>
                    </div>
                    <div className="col-5 d-flex flex-row align-items-end justify-content-end">
                      <div className="price-fare">
                        <p className="text-right pb-2">
                          ${" "}
                          {(adultTraveler?.price?.base * adultCount).toFixed(2)}{" "}
                        </p>
                        {childCount > 0 && (
                          <p className="text-right pb-2">
                            ${" "}
                            {(childTraveler?.price?.base * childCount).toFixed(
                              2
                            )}{" "}
                          </p>
                        )}
                        {infantCount > 0 && (
                          <p className="text-right pb-2">
                            ${" "}
                            {(
                              infantTraveler?.price?.base * infantCount
                            ).toFixed(2)}{" "}
                          </p>
                        )}
                        <p className="text-right">
                          ${(price?.total - price?.base).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="hr-line-adjust">
                      <hr className="hr-line-div mb-2 mt-2 mx-auto" />
                    </div>
                    <div className="col-6 ">
                      <p className="mb-0">Skytrips booking fee</p>
                    </div>
                    <div className="col-6 d-flex flex-row align-items-end justify-content-end">
                      <div className="price-fare-total">
                        <p className="text-right skytrips-fee mb-1">
                          <span className="original-price">
                            <s>$25 </s>
                          </span>
                          {"  "}
                          <span className="offer-price">Free</span>
                        </p>
                      </div>
                    </div>
                    <div className="col-6 ">
                      <p className="text-primary">
                        <FaTag className="icons" /> Discount Applied
                      </p>
                    </div>
                    <div className="col-6 d-flex flex-row align-items-end justify-content-end">
                      <div className="price-fare-total">
                        <p className="text-right skytrips-fee mb-1">
                          <span className="original-price text-primary">
                            -$21
                          </span>
                        </p>
                        <span className="offer-box offer-text">
                          Valentine special offer
                        </span>{" "}
                      </div>
                    </div>

                    <div className="hr-line-adjust">
                      <hr className="hr-line-div mb-3 mx-auto" />
                    </div>
                    <div className="col-6 ">
                      <p>Total</p>
                    </div>
                    <div className="col-6 d-flex flex-row align-items-end justify-content-end">
                      <div className="price-fare-total">
                        <p className="text-right">${price?.total}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Baggage Content item START */}
            <div
              className="tab-pane fade"
              id="flight-baggage-tab"
              role="tabpanel"
              aria-labelledby="flight-baggage"
            >
              <div className="card">
                <div className="card-body">
                  <div className="baggage-container ">
                    {singleTravelerPricing &&
                      singleTravelerPricing?.map((item, index) => (
                        <div
                          className="passenger-baggage-container mb-4"
                          key={index}
                        >
                          <h6 className="d-flex  align-items-center justify-content-between mb-0">
                            Passenger {index + 1} (
                            {item?.travelerType === "HELD_INFANT"
                              ? "INFANT"
                              : item?.travelerType}
                            )
                            <span
                              onClick={() => handleBaggage(index)}
                              className="cursor-pointer"
                            >
                              {openBaggageIndex !== index ? (
                                <Image
                                  src="/assets/images/icons/right_arrow.svg"
                                  alt="arrow"
                                  width={25}
                                  height={25}
                                />
                              ) : (
                                <Image
                                  src="/assets/images/icons/down_arrow.svg"
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
                            />
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Baggage content  item END */}

            {/* Cancellation content item START */}
            <div
              className="tab-pane fade"
              id="flight-policy-tab"
              role="tabpanel"
              aria-labelledby="flight-policy"
            >
              <div className="card ">
                <div className="card-body">
                  <div className="cancellation-container py-3">
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
                            {"("}
                            {getGMTOffset()}
                            {")"}
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
                          {"("}
                          {getGMTOffset()}
                          {")"}
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
                            src="/assets/images/icons/information-fill.svg"
                            className=""
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
            </div>
            {/* Cancelllation content item END */}

            {/* Amenities content item START */}
            <div
              className="tab-pane fade"
              id="flight-amenities-tab"
              role="tabpanel"
              aria-labelledby="flight-amenities"
            >
              <div className="amenities-container">
                {MealData && MealData.length > 0 && (
                  <div className="d-flex flex-row amenities-section align-items-center    ">
                    <div className=" pr-0">
                      <Image
                        src="/assets/images/icons/bowl-fill.svg"
                        alt="bag"
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
                      src="/assets/images/icons/plug-fill.svg"
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
                      src="/assets/images/icons/fluent_tv-48-filled.svg"
                      alt="bag"
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
                      src="/assets/images/icons/wifi-fill.svg"
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
            </div>
            {/* Amenities content item END */}
          </div>
          {/* Tab content END */}
        </div>

        <div className="sticky-book-now-container pb-3">
          <button
            className="btn btn-primary book-now-button"
            onClick={() => handleFlightSeatmap(flightInfo)}
            disabled={priceApiLoading}
          >
            {priceApiLoading && (
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
  )
}

export default NewFlightDetail
