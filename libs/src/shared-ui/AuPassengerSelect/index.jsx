import React, { useEffect, useState } from "react"

import "./styles.scss"

const INDIVIDUAL_PASSANGER_COUNT_UPDATE_TYPE = {
  INCREASE: "INCREASE",
  DECREASE: "DECREASE"
}

const AuPassengerSelect = ({
  name,
  register,
  errors,
  passengers,
  maxPassengers
}) => {
  const { onChange } = register(name)

  const getTotalPassegners = (passangersDetails) => {
    return Object.values(passangersDetails).reduce((init, ipc) => init + ipc, 0)
  }

  const [totalPassengers, setTotalPassengers] = useState(
    passengers ? getTotalPassegners(passengers) : 1
  )

  const [individualPassengerCount, setIndivisualPassengerCount] = useState({
    adult: passengers.adult || 1,
    children: passengers.children || 0,
    infants: passengers.infants || 0
  })

  const handleIndividualPasengerCountUpdate = (updateType, type, count) => {
    const newPassangerDetails = {
      ...individualPassengerCount,
      [type]:
        updateType === INDIVIDUAL_PASSANGER_COUNT_UPDATE_TYPE.INCREASE
          ? individualPassengerCount[type] + count
          : individualPassengerCount[type] - count
    }

    if (
      newPassangerDetails["adult"] < 1 ||
      newPassangerDetails["adult"] < newPassangerDetails["infants"] ||
      Object.values(newPassangerDetails).find((npd) => npd < 0)
    ) {
      return
    }

    const newTotalPassengers = getTotalPassegners(newPassangerDetails)

    if (newTotalPassengers > 0 && newTotalPassengers <= maxPassengers) {
      setIndivisualPassengerCount(newPassangerDetails)
    }
  }

  useEffect(() => {
    setTotalPassengers(getTotalPassegners(individualPassengerCount))
  }, [individualPassengerCount])

  useEffect(() => {
    onChange({ target: { name, value: individualPassengerCount } })
  }, [totalPassengers])

  useEffect(() => {
    if (getTotalPassegners(individualPassengerCount) > maxPassengers) {
      setIndivisualPassengerCount({ adult: 1, children: 0, infants: 0 })
    }
  }, [maxPassengers])

  return (
    <div className="select-container-au">
      <div className=" dropdown  p-1 rounded-2 ">
        <div
          className="nav-link dropdown-toggle d-flex justify-content-between"
          id="selectPassengers"
          data-bs-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          role="button" 
        >
          {totalPassengers > 0
            ? totalPassengers +
              `${totalPassengers > 1 ? " Travelers" : " Traveler"}`
            : "Select Travelers"}
        </div>
        <ul
          className="dropdown-menu min-w-auto w-120"
          aria-labelledby="selectPassengers"
          onClick={(e) => e.stopPropagation()}
        >
          <li className="d-flex align-items-center justify-content-between mb-2">
            <p className="mb-0 select-container-au-text">Adults (12y+)</p>
            <div className=" d-flex align-items-center">
              <button
                className="nav-link rounded-start rounded-0 mb-0 btn btn-primary"
                onClick={() =>
                  handleIndividualPasengerCountUpdate(
                    INDIVIDUAL_PASSANGER_COUNT_UPDATE_TYPE.DECREASE,
                    "adult",
                    1
                  )
                }
              >
                <i
                  className="fa fa-minus text-white p-1 plus-minus-icon"
                  aria-hidden="true"
                ></i>
              </button>
              <span className="mx-1 select-container-au-count">
                {individualPassengerCount.adult}
              </span>
              <button
                className="nav-link rounded-end rounded-0 mb-0 btn btn-primary "
                onClick={() =>
                  handleIndividualPasengerCountUpdate(
                    INDIVIDUAL_PASSANGER_COUNT_UPDATE_TYPE.INCREASE,
                    "adult",
                    1
                  )
                }
              >
                <i className="fa fa-plus text-white p-1" aria-hidden="true"></i>
              </button>
            </div>
          </li>
          <li className="d-flex align-items-center justify-content-between mb-2">
            <p className="mb-0 select-container-au-text">Children (2y - 11y)</p>
            <div className="d-flex align-items-center">
              <button
                className="nav-link rounded-start rounded-0 mb-0 btn btn-primary"
                onClick={() =>
                  handleIndividualPasengerCountUpdate(
                    INDIVIDUAL_PASSANGER_COUNT_UPDATE_TYPE.DECREASE,
                    "children",
                    1
                  )
                }
              >
                <i
                  className="fa fa-minus text-white p-1"
                  aria-hidden="true"
                ></i>
              </button>
              <span className="mx-1 select-container-au-count">
                {individualPassengerCount.children}
              </span>
              <button
                className="nav-link rounded-end rounded-0 mb-0 btn btn-primary "
                onClick={() =>
                  handleIndividualPasengerCountUpdate(
                    INDIVIDUAL_PASSANGER_COUNT_UPDATE_TYPE.INCREASE,
                    "children",
                    1
                  )
                }
              >
                <i className="fa fa-plus text-white p-1" aria-hidden="true"></i>
              </button>
            </div>
          </li>
          <li className="d-flex align-items-center justify-content-between mb-2">
            <p className="mb-0 select-container-au-text">Infants (23 months)</p>
            <div className="d-flex align-items-center">
              <button
                className="nav-link rounded-start rounded-0 mb-0 btn btn-primary"
                onClick={() =>
                  handleIndividualPasengerCountUpdate(
                    INDIVIDUAL_PASSANGER_COUNT_UPDATE_TYPE.DECREASE,
                    "infants",
                    1
                  )
                }
              >
                <i
                  className="fa fa-minus text-white p-1"
                  aria-hidden="true"
                ></i>
              </button>
              <span className="mx-1 select-container-au-count">
                {individualPassengerCount.infants}
              </span>
              <button
                className="nav-link rounded-end rounded-0 mb-0 btn btn-primary "
                onClick={() =>
                  handleIndividualPasengerCountUpdate(
                    INDIVIDUAL_PASSANGER_COUNT_UPDATE_TYPE.INCREASE,
                    "infants",
                    1
                  )
                }
              >
                <i className="fa fa-plus text-white p-1" aria-hidden="true"></i>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default AuPassengerSelect
