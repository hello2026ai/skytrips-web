import React, { useContext, useEffect, useState } from "react"

import "./styles.scss"
import { BookingContext } from "@/context/BookingContext"
import Image from "next/image"

const INDIVIDUAL_PASSANGER_COUNT_UPDATE_TYPE = {
  INCREASE: "INCREASE",
  DECREASE: "DECREASE"
}

const NewPassengerSelect = ({
  name,
  register,
  errors,
  passengers,
  maxPassengers,
  individualPassengerCount,
  setIndivisualPassengerCount
}) => {
  const { handleSearchBarChange } = useContext(BookingContext)

  const { onChange } = register(name)

  const getTotalPassegners = (passangersDetails) => {
    return Object.values(passangersDetails).reduce((init, ipc) => init + ipc, 0)
  }

  const [totalPassengers, setTotalPassengers] = useState(
    passengers ? getTotalPassegners(passengers) : 1
  )

  const handleIndividualPasengerCountUpdate = (updateType, type, count) => {
    const newPassangerDetails = {
      ...individualPassengerCount,
      [type]:
        updateType === INDIVIDUAL_PASSANGER_COUNT_UPDATE_TYPE.INCREASE
          ? individualPassengerCount[type] + count
          : individualPassengerCount[type] - count
    }

    if (
      newPassangerDetails["adults"] < 1 ||
      newPassangerDetails["adults"] < newPassangerDetails["infants"] ||
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
      setIndivisualPassengerCount({ adults: 1, children: 0, infants: 0 })
    }
  }, [maxPassengers])

  return (
    <div className="new-select-container ">
      <div className=" dropdown bg-light  rounded-0 new-select-section">
        <div
          className="nav-link dropdown-toggle d-flex justify-content-between"
          id="selectPassengers"
          data-bs-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          role="button"
        >
          <span className="new-passenger-text">
            <Image
              src="/assets/images/avatar/travelerIcon.svg"
              alt="passenger_icon"
              width={13}
              height={10}
              className="passenger-icon mr-1"
            />{" "}
            {totalPassengers}{" "}
            <span className="passenger-text-mob">Passenger</span>
          </span>
          <Image
            src="/assets/images/icons/dropdownIcon.svg"
            alt="dropdown icon"
            width={16}
            height={15}
            className="dropdown-icon ms-2"
          />
          <Image
            src="/assets/images/icons/mobDropdown.svg"
            alt="dropdown icon"
            className="dropdown-icon-mobile ms-2"
            width={16}
            height={15}
          />
        </div>
        <ul
          className="dropdown-menu  w-100 "
          aria-labelledby="selectPassengers"
          onClick={(e) => {
            if (!e.target.closest(".done-button")) {
              e.stopPropagation()
            }
          }}
        >
          <li className="d-flex align-items-center justify-content-between mb-2 ">
            <p className="mb-0 passenger-type">
              Adults
              {/* <span className="select-container-text">(12y+)</span> */}
            </p>
            <div className=" d-flex align-items-center ">
              <button
                type="button"
                className="nav-link   plus-minus-icon "
                onClick={() =>
                  handleIndividualPasengerCountUpdate(
                    INDIVIDUAL_PASSANGER_COUNT_UPDATE_TYPE.DECREASE,
                    "adults",
                    1
                  )
                }
              >
                <span className="minus"> - </span>
              </button>
              <span className="  for-adult">
                {individualPassengerCount.adults}
              </span>
              <button
                type="button"
                className="nav-link plus-minus-icon "
                onClick={() =>
                  handleIndividualPasengerCountUpdate(
                    INDIVIDUAL_PASSANGER_COUNT_UPDATE_TYPE.INCREASE,
                    "adults",
                    1
                  )
                }
              >
                <span className="plus"> + </span>
                {/* <i className="fa fa-plus text-white p-2" aria-hidden="true"></i> */}
              </button>
            </div>
          </li>
          <li className="d-flex align-items-center justify-content-between mb-2">
            <p className="mb-0 passenger-type">
              Children <span className="select-container-text">(2y - 17y)</span>
            </p>
            <div className="d-flex align-items-center">
              <button
                type="button"
                className="nav-link plus-minus-icon"
                onClick={() =>
                  handleIndividualPasengerCountUpdate(
                    INDIVIDUAL_PASSANGER_COUNT_UPDATE_TYPE.DECREASE,
                    "children",
                    1
                  )
                }
              >
                <span className="minus"> - </span>
              </button>
              <span className=" select-container-count">
                {individualPassengerCount.children}
              </span>
              <button
                type="button"
                className="nav-link plus-minus-icon "
                onClick={() =>
                  handleIndividualPasengerCountUpdate(
                    INDIVIDUAL_PASSANGER_COUNT_UPDATE_TYPE.INCREASE,
                    "children",
                    1
                  )
                }
              >
                <span className="plus"> + </span>
              </button>
            </div>
          </li>
          <li className="d-flex align-items-center justify-content-between mb-2">
            <p className="mb-0 passenger-type">
              Infants{" "}
              <span className="select-container-text">(Under 2 y/o)</span>
            </p>
            <div className="d-flex align-items-center">
              <button
                type="button"
                className="nav-link plus-minus-icon"
                onClick={() =>
                  handleIndividualPasengerCountUpdate(
                    INDIVIDUAL_PASSANGER_COUNT_UPDATE_TYPE.DECREASE,
                    "infants",
                    1
                  )
                }
              >
                <span className="minus"> - </span>
              </button>
              <span className="select-container-count">
                {individualPassengerCount.infants}
              </span>
              <button
                type="button"
                className="nav-link plus-minus-icon "
                onClick={() =>
                  handleIndividualPasengerCountUpdate(
                    INDIVIDUAL_PASSANGER_COUNT_UPDATE_TYPE.INCREASE,
                    "infants",
                    1
                  )
                }
              >
                <span className="plus"> + </span>
              </button>
            </div>
          </li>
          <button
            type="submit"
            className="nav-link d-flex align-items-center justify-content-end btn btn-primary  px-4 py-2 done-button"
          >
            Done
          </button>
        </ul>
      </div>
    </div>
  )
}

export default NewPassengerSelect
