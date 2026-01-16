import React, { useState } from "react"
import "./index.scss"
import FlightItineraries from "../NewTickets/FlightItenaries/FlightItenaryWeb"
import FlightItenaryMob from "../NewTickets/FlightItenaries/FlightItenaryMob"
import { getAirlineFromIatacode, getItemFromIatacode } from "@/utils"

function ShowMoreFlight({
  samePriceOffers,
  tripType,
  flightFilter,
  flightData,
  handleFlightDetailClick,
  formatTransitTime,
  getTransitInfo,
  isExpanded,
  setIsExpanded,
  itineraries,
  item,
  flight,
  handleFlightSeatmap,
  priceApiLoading
}) {
  const isCurrentFlightExpanded = isExpanded === flight.id

  return (
    <>
      <div className={`${isCurrentFlightExpanded ? "expanded-border" : ""} `}>
        <>
          <FlightItineraries
            itineraries={itineraries}
            tripType={tripType}
            flightFilter={flightFilter}
            flightData={flightData}
            item={item}
            handleFlightDetailClick={handleFlightDetailClick}
            formatTransitTime={formatTransitTime}
            getTransitInfo={getTransitInfo}
            flight={flight}
          />
          <FlightItenaryMob
            itineraries={itineraries}
            tripType={tripType}
            flightFilter={flightFilter}
            flightData={flightData}
            item={item}
            handleFlightDetailClick={handleFlightDetailClick}
            formatTransitTime={formatTransitTime}
            getTransitInfo={getTransitInfo}
            flight={flight}
            handleFlightSeatmap={handleFlightSeatmap}
            priceApiLoading={priceApiLoading}
          />
        </>

        <div className="custom-container">
          {!isCurrentFlightExpanded && (
            <div
              className="text-primary text-center btn-pointer  mx-auto more-flights-dropdown"
              onClick={() => setIsExpanded(flight.id)}
            >
              {samePriceOffers.length} MORE FLIGHTS AT THIS PRICE
              <i className="bi bi-chevron-down ms-2"></i>
            </div>
          )}

          {isCurrentFlightExpanded && (
            <>
              {samePriceOffers.map((flight, item) => {
                const itineraries = flight?.itineraries
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
                    {/* For Web */}
                    <FlightItineraries
                      itineraries={itineraries}
                      tripType={tripType}
                      flightFilter={flightFilter}
                      flightData={flightData}
                      item={item}
                      handleFlightDetailClick={handleFlightDetailClick}
                      formatTransitTime={formatTransitTime}
                      getTransitInfo={getTransitInfo}
                      flight={updatedFlight}
                    />

                    {/* For Mobile */}
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
                  </>
                )
              })}
            </>
          )}
        </div>
      </div>
      {isCurrentFlightExpanded && (
        <div
          className="text-center text-primary btn-pointer more-flights-dropdown"
          onClick={() => setIsExpanded(null)}
        >
          Show Less
          <i className="bi bi-chevron-up ms-2"></i>
        </div>
      )}
    </>
  )
}

export default ShowMoreFlight
