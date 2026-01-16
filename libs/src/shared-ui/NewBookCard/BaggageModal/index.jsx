import React from "react"

import "./styles.scss"

const BaggageModal = ({ id, flight }) => {
  const segmentDetails =
    flight && flight.itineraries
      ? flight.itineraries.reduce((init, i) => {
          const itenaryDetails =
            i && i.segments
              ? i.segments.map((s) => ({
                  id: s.id,
                  detail: s.departure.iataCode + "-" + s.arrival.iataCode,
                  travelers: flight.travelerPricings.map((tp) => ({
                    id: tp.travelerId,
                    type: tp.travelerType,
                    baggage:
                      tp && tp.fareDetailsBySegment
                        ? tp.fareDetailsBySegment.find(
                            (fdbs) => fdbs.segmentId === s.id
                          )?.includedCheckedBags || {}
                        : {}
                  }))
                }))
              : []

          init = [...init, ...itenaryDetails]

          return init
        }, [])
      : []

  return (
    <div
      className="modal fade"
      id={id}
      aria-hidden="true"
      style={{ color: "#FFFFFF" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          {/* Title */}
          <div className="modal-header">
            <h5 className="modal-title">Free Baggage</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>

          {/* Body */}
          <div className="modal-body text-dark p-3 ">
            <div className="baggagemodal">
              <div className="row baggagemodal_table_row">
                <div className="col-4"></div>
                <div className="col-8 baggagemodal_table_row">
                  <div className="row">
                    <div className="col baggagemodal__title">Name</div>
                    <div className="col baggagemodal__title">Type</div>
                    <div className="col baggagemodal__title">Baggage</div>
                  </div>
                </div>
              </div>
              {segmentDetails ? (
                segmentDetails.map((sd, i) => (
                  <div className="row baggagemodal__item">
                    <div className="col-4 baggagemodal__item__detail">
                      {sd.detail}
                    </div>
                    <div className="col-8">
                      {sd.travelers.map((t) => (
                        <div className="row baggagemodal__item__body">
                          <div className="col baggagemodal__item__body__single">
                            passenger {t.id}
                          </div>
                          <div className="col text-capitalize baggagemodal__item__body__single">
                            {t.type.toLowerCase()}
                          </div>
                          <div className="col baggagemodal__item__body__single">
                            {t.baggage &&
                            t.baggage.weight &&
                            t.baggage.weightUnit
                              ? `${t.baggage.weight} ${t.baggage.weightUnit}`
                              : "N/A"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div>Baggage detail not available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BaggageModal
