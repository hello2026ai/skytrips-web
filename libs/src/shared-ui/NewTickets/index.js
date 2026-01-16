import React, { useState } from "react"
import { useRouter } from "next/router"
import lzutf8 from "lzutf8"
import {
  axiosClient,
  getAirlineFromIatacode,
  getItemFromIatacode
} from "@utils"
import Modal from "../Modal"
import { STORAGE_KEYS, getValueOf } from "@/service/storage"
import { Tooltip } from "react-tooltip"
import Image from "next/image"
import ShowMoreFlight from "../MoreFlight"
import FlightItineraries from "./FlightItenaries/FlightItenaryWeb"
import FlightItenaryMob from "./FlightItenaries/FlightItenaryMob"
import { toast } from "react-toastify"
import { RxCross2 } from "react-icons/rx"
import { MdDone } from "react-icons/md"

const NewTickets = (props) => {
  const {
    flightData,
    flightFilter,
    tripType,
    campionTemplate,
    originLocationCode,
    destinationLocationCode,
    travelClass,
    adult,
    children,
    departureDate,
    infant,
    totalTraveler
  } = props
  const router = useRouter()

  const { searchParams } = router.query

  const [singleFlightData, setSingleFlightData] = useState()
  const [singleFlightPrice, setSingleFlightPrice] = useState()
  const [singleTravelerPricing, setSingleTravelerPricing] = useState([])
  const [flightInfo, setFlightInfo] = useState()
  const [amenities, setAmenities] = useState()
  const [isExpanded, setIsExpanded] = useState(false)

  // handle flight detail modal
  const handleFlightDetailClick = (flight) => {
    const segments = flight.itineraries

    const price = flight.price
    const travelerPrice = flight.travelerPricings

    const amenitiesList = flight.travelerPricings[0].fareDetailsBySegment.map(
      (i) => i
    )

    setFlightInfo(flight)
    setSingleFlightData(segments)
    setSingleFlightPrice(price)
    setAmenities(amenitiesList)
    setSingleTravelerPricing(travelerPrice)
  }

  const userUniqueId = getValueOf(STORAGE_KEYS.CLIENT_UNIQUE_ID)
  const newparameter = {
    "ama-client-ref": userUniqueId
  }
  const newHeader = {
    ...axiosClient.defaults,
    headers: {
      ...axiosClient.defaults.headers,
      ...newparameter
    }
  }

  const [priceApiLoading, setPriceApiLoading] = useState(false)
  const handleLockPrice = async (flight) => {
    setPriceApiLoading(true)
    try {
      const { data } = await axiosClient.post(
        "/flight-price",
        flight,
        newHeader
      )
      if (data) {
        setPriceApiLoading(false)
        return data
      }
    } catch (error) {
      setPriceApiLoading(false)
      toast.error(error?.response?.message || "An error occurred", {
        onClose: () => {
          router.back()
        }
      })
      // toast.error(error?.response?.message || "An error occurred")
    }
  }

  // handle flight detail
  const handleFlightSeatmap = async (flight) => {
    const userUniqueId = getValueOf(STORAGE_KEYS.CLIENT_UNIQUE_ID) || ""
    if (!userUniqueId) {
      window.dispatchEvent(new CustomEvent("userReferenceNotFound"))
      return
    }
    if (!userUniqueId.trim()) {
      router.push("/error")
      hideDetailsModal()
      return
    }

    try {
      const updatedFlightsData = await handleLockPrice(flight)
      const flightDataWithQuery = {
        data: updatedFlightsData?.data[0],
        query: searchParams
      }
      router.push({
        pathname: "/book",
        query: {
          searchParams: lzutf8.compress(JSON.stringify(flightDataWithQuery), {
            outputEncoding: "Base64"
          }),

          user_unique_id: userUniqueId
        }
      })
    } catch (error) {
      router.push("/error")
    } finally {
      hideDetailsModal()
    }
  }

  const hideDetailsModal = () => {
    const flightModal = document.getElementById("flightdetail")
    $(flightModal).modal("hide")
  }

  function formatTransitTime(transitTime) {
    const match = transitTime.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)

    if (match) {
      const hours = match[1] ? `${match[1]}H` : "0H"
      const minutes = match[2] ? `${match[2]}M` : "0M"

      return `${hours} ${minutes}`
    }

    return "Invalid time format"
  }

  // const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  // console.log("baseUrl", baseUrl)

  return (
    <>
      {flightData?.data?.map((flight, item) => {
        const itineraries = flight?.itineraries
        const hasSamePriceOffers = flight?.samePriceOffers?.length > 0
        const updatedFlight = {
          ...flight,
          price: {
            ...flight.price,
            offeredPrice: Math.floor(flight.price.total),
            total: Math.floor(parseFloat(flight.price.total)),
            grandTotal: Math.floor(parseFloat(flight.price.grandTotal))
          }
        }
        return (
          <>
            {!hasSamePriceOffers ? (
              <>
                {/* for web */}
                <FlightItineraries
                  itineraries={itineraries}
                  tripType={tripType}
                  flightFilter={flightFilter}
                  flightData={flightData}
                  item={item}
                  handleFlightDetailClick={handleFlightDetailClick}
                  getAirlineFromIatacode={getAirlineFromIatacode}
                  getItemFromIatacode={getItemFromIatacode}
                  formatTransitTime={formatTransitTime}
                  getTransitInfo={getTransitInfo}
                  getFirstAndLastIataCodes={getFirstAndLastIataCodes}
                  flight={updatedFlight}
                  campionTemplate={campionTemplate}
                />
                {/* for mobile */}
                <FlightItenaryMob
                  itineraries={itineraries}
                  tripType={tripType}
                  flightFilter={flightFilter}
                  flightData={flightData}
                  item={item}
                  handleFlightDetailClick={handleFlightDetailClick}
                  formatTransitTime={formatTransitTime}
                  getTransitInfo={getTransitInfo}
                  flight={updatedFlight}
                  handleFlightSeatmap={handleFlightSeatmap}
                  priceApiLoading={priceApiLoading}
                />
                {/* mobile view end */}
              </>
            ) : (
              <ShowMoreFlight
                itineraries={itineraries}
                samePriceOffers={flight?.samePriceOffers}
                id={item}
                tripType={tripType}
                flightFilter={flightFilter}
                flightData={flightData}
                item={item}
                handleFlightDetailClick={handleFlightDetailClick}
                formatTransitTime={formatTransitTime}
                getTransitInfo={getTransitInfo}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                flight={updatedFlight}
                handleFlightSeatmap={handleFlightSeatmap}
                priceApiLoading={priceApiLoading}
              />
            )}

            {/* for future valentine */}
            {/* {item === 0 && (
              <div className="valentine-template">
                {campionTemplate === "reunion" && (
                  <div className="reunion-div mb-3 gap-2">
                    <div className="d-flex align-items-center justify-content-left gap-2">
                      <h3 className="mb-0">Fly ‘n’ Meet Your Love</h3>
                      <Image
                        src="/assets/images/valentine/loveAeroplane.svg"
                        width={90}
                        height={90}
                        alt="love-image"
                      />
                    </div>{" "}
                    <div>
                      <h4 className="mb-0">$21 Off your flight</h4>
                      <p className="mb-0">(Auto applied when you checkout)</p>
                    </div>
                  </div>
                )}{" "}
                {campionTemplate === "celebration" && (
                  <div className="celebration-div mb-3 gap-2">
                    <div className="d-flex align-items-center  ">
                      <Image
                        src="/assets/images/valentine/loveWithPlane.svg"
                        width={110}
                        height={120}
                        alt="love-image"
                        className=""
                      />
                    </div>{" "}
                    <div>
                      <h4 className="mb-0 strike-text">
                        <span>
                          <RxCross2 size="20" />
                        </span>{" "}
                        No Booking Fee
                        <span className="">
                          (<s>$25</s>)
                        </span>
                      </h4>
                      <h4 className="mb-0 strike-text">
                        <span>
                          <RxCross2 size="20" />
                        </span>{" "}
                        No Upgrade Fee{" "}
                        <span className="">
                          (<s>$25</s>)
                        </span>
                      </h4>
                      <h4 className="mb-0 strike-right-text">
                        <span className="me-1">
                          <MdDone size="20" />
                        </span>
                        Easy Cancellation
                      </h4>
                    </div>
                  </div>
                )}
                {campionTemplate === "nostalgia" && (
                  <div className="nostalgia-div mb-3 gap-2">
                    <div className="d-flex align-items-center justify-content-left gap-2">
                      <div className="mb-3">
                        <h3 className="mb-0">Fly ‘n’ Find</h3>
                        <p className="description mb-0">
                          the spot that connected you and your love
                        </p>
                      </div>
                      <Image
                        src="/assets/images/valentine/lovers.svg"
                        width={90}
                        height={90}
                        alt="love-image"
                      />
                    </div>{" "}
                    <div className="mb-3">
                      <h4 className="mb-0">$21 Off your flight</h4>
                      <p className="mb-0">(Auto applied when you checkout)</p>
                    </div>
                  </div>
                )}
                {campionTemplate === "counselling" && (
                  <div className="counselling-div mb-3 gap-5">
                    <div className="d-flex align-items-center justify-content-left gap-2">
                      <div>
                        <h3 className="mb-0">Valentine Gift Idea</h3>
                        <p className="description mb-0">
                          Give the BEST gift- You.
                        </p>
                      </div>
                      <Image
                        src="/assets/images/valentine/valentineGift.svg"
                        width={100}
                        height={100}
                        alt="love-image"
                      />
                    </div>{" "}
                    <div>
                      <div className="discount-tag">
                        <h4 className="mb-0">$21 Off your flight</h4>
                      </div>
                      <p className="mb-0">(Auto applied when you checkout)</p>
                    </div>
                  </div>
                )}
                {campionTemplate === "hope_and_imagination" && (
                  <div className="reunion-div mb-3 gap-2">
                    <div className="d-flex align-items-center justify-content-left gap-2">
                      <h3 className="mb-0">Fly 'n' Fall in Love</h3>
                      <Image
                        src="/assets/images/valentine/loveAeroplane.svg"
                        width={90}
                        height={90}
                        alt="love-image"
                      />
                    </div>{" "}
                    <div>
                      <h4 className="mb-0">$21 Off your flight</h4>
                      <p className="mb-0">(Auto applied when you checkout)</p>
                    </div>
                  </div>
                )}
                {campionTemplate === "hope_and_pursuit" && (
                  <div className="reunion-div mb-3 gap-2">
                    <div className="d-flex align-items-center justify-content-left gap-2">
                      <h3 className="mb-0">Fly 'n' Find your Love</h3>
                      <Image
                        src="/assets/images/valentine/loveAeroplane.svg"
                        width={90}
                        height={90}
                        alt="love-image"
                      />
                    </div>{" "}
                    <div>
                      <h4 className="mb-0">$21 Off your flight</h4>
                      <p className="mb-0">(Auto applied when you checkout)</p>
                    </div>
                  </div>
                )}
                {campionTemplate === "counselling_chicky" && (
                  <div className="reunion-div mb-3 gap-2">
                    <div className="d-flex align-items-center justify-content-left gap-2">
                      <h3 className="mb-0">Fly Away - singles!</h3>
                      <Image
                        src="/assets/images/valentine/loveAeroplane.svg"
                        width={90}
                        height={90}
                        alt="love-image"
                      />
                    </div>{" "}
                    <div>
                      <h4 className="mb-0">$21 Off your flight</h4>
                      <p className="mb-0">(Auto applied when you checkout)</p>
                    </div>
                  </div>
                )}
              </div>
            )} */}
          </>
        )
      })}
      <Modal
        data={singleFlightData}
        id="flightdetail"
        price={singleFlightPrice}
        flightFilter={flightFilter}
        amenities={amenities}
        dictionaries={flightData.dictionaries}
        handleFlightSeatmap={handleFlightSeatmap}
        flightInfo={flightInfo}
        singleTravelerPricing={singleTravelerPricing}
        priceApiLoading={priceApiLoading}
        originLocationCode={originLocationCode}
        destinationLocationCode={destinationLocationCode}
        travelClass={travelClass}
        tripType={tripType}
        adult={adult}
        children={children}
        departureDate={departureDate}
        infant={infant}
        totalTraveler={totalTraveler}
      />
    </>
  )
}

export default NewTickets

// get the transit points or "Direct" flight info
const getTransitInfo = (segments) => {
  const segmentCount = segments?.length

  if (segmentCount === 1) return "Direct"
  if (segmentCount >= 2) {
    const transitCodes = segments
      .slice(1)
      .map((segment) => segment?.departure?.iataCode || "")
      .join(" ")
    return transitCodes
  }
  return ""
}

function getFirstAndLastIataCodes(segments) {
  if (!segments || segments.length === 0) {
    throw new Error("Segments array is empty or undefined.")
  }

  const firstDeparture = segments[0].departure.iataCode
  const lastArrival = segments[segments.length - 1].arrival.iataCode

  return { firstDeparture, lastArrival }
}

// Render baggage info
export const TravelerFareDetails = ({ travelerPricings, className }) => {
  return (
    <>
      {travelerPricings.slice(0, 1).map((traveler, travelerIndex) => (
        <>
          {traveler.fareDetailsBySegment.slice(0, 1).map((segment) => (
            <div className={className} key={segment.segmentId}>
              <BaggageInfo
                segment={segment}
                type="checked"
                icon="/assets/images/icons/bag.svg"
              />
              <BaggageInfo
                segment={segment}
                type="cabin"
                icon="/assets/images/icons/suitcaseBig.svg"
                className="ml-2"
              />
            </div>
          ))}
        </>
      ))}
    </>
  )
}

const BaggageInfo = ({ segment, type, icon, className = "" }) => {
  const isCheckedBag = type === "checked"
  const baggage = isCheckedBag
    ? segment?.includedCheckedBags
    : segment?.includedCabinBags

  const quantity = baggage?.quantity ?? (baggage?.weight ? 1 : 0)

  if (quantity === 0) return null

  return (
    <div className={className}>
      <Image
        src={icon}
        width={20}
        height={20}
        alt={`${type} baggage`}
        data-tooltip-id={`${segment.segmentId}-${type}`}
      />
      <Tooltip
        id={`${segment.segmentId}-${type}`}
        top="bottom"
        content={() => <p>{isCheckedBag ? "Cabin Bag" : "Checked Bag"}</p>}
        style={{ fontSize: "10px", height: "30px" }}
      />
    </div>
  )
}
