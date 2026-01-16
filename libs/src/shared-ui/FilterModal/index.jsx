import React from "react"
import { Accordion } from "react-bootstrap"
import "./styles.scss"
import RangeSlider from "../RangeSlider"
import TimeRangeSlider from "../TimeRangeSlider"

import Image from "next/image"

const FilterModal = (props) => {
  const {
    show,
    onClose,
    flightFilter,
    setFlightFilter,
    stopOption,
    setStopCount,
    stopCount,
    data,
    newParams,
    clearFlightFilter,
    handleFlightFilter,
    initialFlightFilter,
    handleFilterModal,
    stopStatus,
    filterStatus,
    setFilterStatus,
    handleStatus,
    setStopStatus,
    handleAirlineChange,
    showAirlines,
    airlineLength,
    showMoreAirlines,
    rangeValue,
    setRangeValue,
    timeRangeValue,
    setTimeRangeValue,
    departureTime,
    selectedCheckboxes,
    handleDepartureCheckboxChange,
    arrivalTime,
    selectedArrivalCheckboxes,
    handleArrivalCheckboxChange,
    handleMaxPriceSlider,
    handleMaxTravelDuration,
    prevFilterValue,
    removePrevFilterValue,
    removeStopFilterValue,
    removeDepartureValue,
    removeArrivalValue,
    removeRangeFilterValue,
    removeTimeRangeFilterValue,
    clearAllFilter
  } = props

  if (!show) return null

  const selectedStop = (number) => {
    if (number !== undefined && number !== stopCount) {
      setStopCount(number)
      setStopStatus(true)
      handleFlightFilter()
    } else {
      setStopStatus(false)
    }
  }

  return (
    <>
      <div className="filter-modal-container">
        {/* Backdrop */}
        <div
          className="modal-backdrop"
          style={{
            zIndex: 1040,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }}
        >
          {/* Modal */}
          <div
            className="modal"
            style={{
              display: "block",
              position: "fixed",
              zIndex: 1050,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          >
            <div className="modal-dialog modal-lg filter-modal ">
              <div className="modal-content for-mobile">
                <div className="modal-header ">
                  <button
                    type="button"
                    className="btn-close"
                    onClick={onClose}
                    aria-label="Close"
                  ></button>
                  <h5 className="modal-title ">Filters </h5>
                </div>
                <div className="modal-body ">
                  <div
                    className="offcanvas-xl offcanvas-end available_flight_sticky"
                    tabIndex={-1}
                    id="offcanvasSidebar"
                    aria-labelledby="offcanvasSidebarLabel"
                  >
                    <div className="offcanvas-body flex-column p-xl-0">
                      <div className="mx-2 d-flex flex-wrap  align-items-center justify-content-left">
                        {prevFilterValue &&
                          prevFilterValue.map((selected, index) => {
                            const matchedAirline =
                              initialFlightFilter[selected.name]?.name

                            return (
                              matchedAirline && (
                                <span
                                  className="selected-tag "
                                  id={index}
                                  key={index}
                                >
                                  {matchedAirline}
                                  <Image
                                    src="/assets/images/icons/cross.svg"
                                    alt="cross-icon"
                                    width={18}
                                    height={18}
                                    className="ml-1 cursor-pointer"
                                    onClick={() =>
                                      removePrevFilterValue(selected.name)
                                    }
                                  />
                                </span>
                              )
                            )
                          })}

                        {stopCount && (
                          <span className="selected-tag ">
                            {stopCount} {stopCount > 1 ? "Transits" : "Transit"}
                            <Image
                              src="/assets/images/icons/cross.svg"
                              alt="cross-icon"
                              width={18}
                              height={18}
                              className="ml-1 cursor-pointer"
                              onClick={() => removeStopFilterValue(stopCount)}
                            />
                          </span>
                        )}
                        {selectedCheckboxes &&
                          selectedCheckboxes.map((selected) => (
                            <span className="selected-tag ">
                              Departure: {selected}
                              <Image
                                src="/assets/images/icons/cross.svg"
                                alt="cross-icon"
                                width={18}
                                height={18}
                                className="ml-1 cursor-pointer"
                                onClick={() => removeDepartureValue(selected)}
                              />
                            </span>
                          ))}

                        {selectedArrivalCheckboxes &&
                          selectedArrivalCheckboxes.map((arrivalCheckbox) => (
                            <span className="selected-tag ">
                              Arrival: {arrivalCheckbox}
                              <Image
                                src="/assets/images/icons/cross.svg"
                                alt="cross-icon"
                                width={18}
                                height={18}
                                className="ml-1 cursor-pointer"
                                onClick={() =>
                                  removeArrivalValue(arrivalCheckbox)
                                }
                              />
                            </span>
                          ))}
                        {rangeValue && (
                          <span className="selected-tag ">
                            Max Price: ${rangeValue}
                            <Image
                              src="/assets/images/icons/cross.svg"
                              alt="cross-icon"
                              className="ml-1 cursor-pointer"
                              width={18}
                              height={18}
                              onClick={() => {
                                removeRangeFilterValue(rangeValue)
                              }}
                            />
                          </span>
                        )}

                        {timeRangeValue && (
                          <span className="selected-tag ">
                            {timeRangeValue} Hours
                            <Image
                              src="/assets/images/icons/cross.svg"
                              alt="cross-icon"
                              width={18}
                              height={18}
                              className="ml-1 cursor-pointer"
                              onClick={() => {
                                removeTimeRangeFilterValue(timeRangeValue)
                              }}
                            />
                          </span>
                        )}
                      </div>

                      <form className="rounded-3  ">
                        <div className=" ">
                          <div className="filters-list">
                            <Accordion className="card card-body">
                              <Accordion.Item eventKey={"0"}>
                                <Accordion.Header>
                                  <b className="filter-options mb-1">
                                    Airlines
                                  </b>
                                </Accordion.Header>
                                <Accordion.Body className="accordion-body-part">
                                  <div className="mt-0 mb-3">
                                    {showAirlines ? (
                                      <>
                                        {Object.keys(
                                          initialFlightFilter
                                            ? initialFlightFilter
                                            : prevFilterValue
                                        ).map((ff) => (
                                          <div className="mt-2 ">
                                            <div className="form-check ">
                                              <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={ff}
                                                name={ff}
                                                // checked={flightFilter[ff]?.checked}
                                                checked={
                                                  ((filterStatus &&
                                                    newParams?.manualFilter?.airlines?.includes(
                                                      ff
                                                    )) ||
                                                    flightFilter[ff]
                                                      ?.checked) ??
                                                  false
                                                }
                                                onChange={handleAirlineChange}
                                              />
                                              <label
                                                className="form-check-label "
                                                htmlFor={ff}
                                              >
                                                {initialFlightFilter[ff].name
                                                  ? initialFlightFilter[ff].name
                                                  : flightFilter[ff].name}
                                              </label>
                                            </div>
                                          </div>
                                        ))}
                                      </>
                                    ) : (
                                      <>
                                        {Object.keys(
                                          initialFlightFilter
                                            ? initialFlightFilter
                                            : prevFilterValue
                                        )
                                          ?.slice(0, 10)
                                          .map((ff) => (
                                            <div className="mt-2 ">
                                              <div className="form-check ">
                                                <input
                                                  className="form-check-input"
                                                  type="checkbox"
                                                  id={ff}
                                                  name={ff}
                                                  // checked={flightFilter[ff]?.checked}
                                                  checked={
                                                    ((filterStatus &&
                                                      newParams?.manualFilter?.airlines?.includes(
                                                        ff
                                                      )) ||
                                                      flightFilter[ff]
                                                        ?.checked) ??
                                                    false
                                                  }
                                                  onChange={handleAirlineChange}
                                                />
                                                <label
                                                  className="form-check-label "
                                                  htmlFor={ff}
                                                >
                                                  {initialFlightFilter[ff].name
                                                    ? initialFlightFilter[ff]
                                                        .name
                                                    : flightFilter[ff].name}
                                                </label>
                                              </div>
                                            </div>
                                          ))}
                                      </>
                                    )}
                                  </div>
                                  {airlineLength > 10 && !showAirlines && (
                                    <div>
                                      <p
                                        onClick={showMoreAirlines}
                                        className="show-more cursor-pointer text-right mt-2"
                                      >
                                        Show more
                                      </p>
                                    </div>
                                  )}

                                  {airlineLength > 10 && showAirlines && (
                                    <div>
                                      <p
                                        onClick={showMoreAirlines}
                                        className="show-more cursor-pointer text-right mt-2"
                                      >
                                        Show less
                                      </p>
                                    </div>
                                  )}
                                </Accordion.Body>
                              </Accordion.Item>
                            </Accordion>
                            <Accordion className="card card-body mt-2 mb-0">
                              <Accordion.Item eventKey={"0"}>
                                <Accordion.Header>
                                  <b className="filter-options">Max Price</b>
                                </Accordion.Header>
                                <Accordion.Body>
                                  <RangeSlider
                                    rangeValue={rangeValue || 0}
                                    setRangeValue={setRangeValue}
                                    min="0"
                                    max="40000"
                                    handleMaxPriceSlider={handleMaxPriceSlider}
                                    className="justify-content-end"
                                  />
                                </Accordion.Body>
                              </Accordion.Item>
                            </Accordion>

                            <Accordion className="card card-body mt-2 mb-0">
                              <Accordion.Item eventKey={"0"}>
                                <Accordion.Header>
                                  <b className="filter-options">Transits</b>
                                </Accordion.Header>
                                <Accordion.Body className="accordion-body-part">
                                  <div className=" mb-3">
                                    {stopOption &&
                                      stopOption.map((item) => (
                                        <div className="form-check ">
                                          <input
                                            className="form-check-input"
                                            type="checkbox"
                                            // id={ff}
                                            // name={ff}
                                            checked={
                                              (stopCount || stopCount === 0) &&
                                              stopStatus
                                                ? stopCount === item.value
                                                : false
                                            }
                                            // unChecked={!stopStatus}
                                            onChange={(e) => {
                                              selectedStop(item.value)
                                            }}
                                          />
                                          <label
                                            className="form-check-label"
                                            // htmlFor={ff}
                                          >
                                            {/* {initialFlightFilter[ff].name
                                           ? initialFlightFilter[ff].name
                                           : flightFilter[ff].name} */}
                                            {/* Non stop */}
                                            {item.label}
                                          </label>
                                        </div>
                                      ))}
                                  </div>
                                </Accordion.Body>
                              </Accordion.Item>
                            </Accordion>
                            <Accordion className="card card-body mt-2 mb-0">
                              <Accordion.Item eventKey={"0"}>
                                <Accordion.Header>
                                  <b className="filter-options">
                                    Max Travel Duration
                                  </b>
                                </Accordion.Header>

                                <Accordion.Body>
                                  <TimeRangeSlider
                                    rangeValue={timeRangeValue || 0}
                                    setRangeValue={setTimeRangeValue}
                                    handleMaxTravelDuration={
                                      handleMaxTravelDuration
                                    }
                                    min="0"
                                    max="200"
                                    className="mt-2"
                                  />
                                </Accordion.Body>
                              </Accordion.Item>
                            </Accordion>
                            <Accordion className="card card-body mt-2 mb-0">
                              <Accordion.Item eventKey={"0"}>
                                <Accordion.Header>
                                  <b className="filter-options">
                                    Departure Time
                                  </b>
                                </Accordion.Header>
                                <Accordion.Body className="accordion-body-part">
                                  <div className="mt-2 mb-3">
                                    {/* <div className="mt-2 "> */}
                                    {departureTime &&
                                      departureTime.map((i) => (
                                        <div className="form-check mb-3">
                                          <input
                                            className="form-check-input "
                                            type="checkbox"
                                            id={i.id}
                                            name={i.value}
                                            checked={selectedCheckboxes.includes(
                                              i.value
                                            )}
                                            onChange={
                                              handleDepartureCheckboxChange
                                            }
                                          />
                                          <div className="d-flex flex-row align-items-center justify-content-start">
                                            <Image
                                              src={i.icon}
                                              alt="icon"
                                              width={18}
                                              height={18}
                                            />
                                            <label
                                              className="form-check-label ml-1 mt-0 "
                                              htmlFor={i.id}
                                            >
                                              {i.label}
                                            </label>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                  {/* </div> */}
                                </Accordion.Body>
                              </Accordion.Item>
                            </Accordion>
                            <Accordion className="card card-body mt-2 mb-0">
                              <Accordion.Item eventKey={"0"}>
                                <Accordion.Header>
                                  <b className="filter-options mb-2">
                                    Arrival Time
                                  </b>
                                </Accordion.Header>
                                <Accordion.Body className="accordion-body-part">
                                  <div className="mt-2 mb-3">
                                    {/* <div className="mt-2 "> */}
                                    {arrivalTime &&
                                      arrivalTime.map((i) => (
                                        <div className="form-check mb-3">
                                          <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={i.id}
                                            name={i.value}
                                            checked={selectedArrivalCheckboxes.includes(
                                              i.value
                                            )}
                                            onChange={
                                              handleArrivalCheckboxChange
                                            }
                                          />
                                          <div className="d-flex flex-row align-items-center justify-content-start">
                                            <Image
                                              src={i.icon}
                                              alt="icon"
                                              width={18}
                                              height={18}
                                            />
                                            <label
                                              className="form-check-label ml-1 mt-0 "
                                              htmlFor={i.id}
                                            >
                                              {i.label}
                                            </label>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                  {/* </div> */}
                                </Accordion.Body>
                              </Accordion.Item>
                            </Accordion>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Buttons */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default FilterModal
