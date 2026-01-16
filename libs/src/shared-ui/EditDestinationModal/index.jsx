import { yupResolver } from "@hookform/resolvers/yup"
import { Select } from "antd"
import React, { useContext, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import * as Yup from "yup"
import NewPassengerSelect from "../NewPassengerSelect"
import NewClassSelectMobile from "../NewClassSelectMobile"
import NewCitySelect from "../NewCitySelect"
import { airports } from "@/utils"
import NewDatePicker from "../NewDatePicker"
import moment from "moment"
import { BookingContext } from "@/context/BookingContext"
import { toast } from "react-toastify"
import Image from "next/image"

const UPDATE_TRIP_TYPE = {
  INCREASE: "INCREASE",
  DECREASE: "DECREASE"
}

const TRIP_TYPES = {
  ONE_WAY: "one_way",
  ROUND_TRIP: "round_trip",
  MULTI_CITY: "multi_city"
}
const initialValues = {
  departure: [],
  arrival: [],
  travelClass: "ECONOMY"
}

const EditDestinationModal = ({ onClose }) => {
  const { Option } = Select
  const { parsedSearchParams, initialFilterSet, handleSearchBarChange } =
    useContext(BookingContext)
  const [tripCount, setTripCount] = useState(parsedSearchParams.tripCount || 1)
  const [tripType, setTripType] = useState(parsedSearchParams?.tripType)

  const parsedTrips = useMemo(() => {
    if (!parsedSearchParams?.originDestinations) return []

    const { tripType, originDestinations } = parsedSearchParams

    if (tripType === TRIP_TYPES.ROUND_TRIP && originDestinations.length > 1) {
      return [
        {
          id: originDestinations[0]?.id,
          from: originDestinations[0]?.originLocationCode,
          to: originDestinations[0]?.destinationLocationCode,
          departure: originDestinations[0]?.departureDateTimeRange.date,
          return: originDestinations[1]?.departureDateTimeRange.date
        }
      ]
    }
    if (tripType === TRIP_TYPES.ONE_WAY && originDestinations.length > 1) {
      return [
        {
          id: originDestinations[0]?.id,
          from: originDestinations[0]?.originLocationCode,
          to: originDestinations[0]?.destinationLocationCode,
          departure: originDestinations[0]?.departureDateTimeRange.date
        }
      ]
    }

    return originDestinations.map((param) => ({
      id: originDestinations[0]?.id,
      from: param?.originLocationCode,
      to: param?.destinationLocationCode,
      departure: param?.departureDateTimeRange?.date
    }))
  }, [parsedSearchParams])

  const [destinations, setDestinations] = useState(parsedTrips)
  const [individualPassengerCount, setIndivisualPassengerCount] = useState({
    adults: parsedSearchParams?.adults || 1,
    children: parsedSearchParams?.children || 0,
    infants: parsedSearchParams?.infants || 0
  })

  const validationSchema = Yup.object().shape({
    travelClass: Yup.string().required("Class is required!"),
    passenger: Yup.object().shape({
      adult: Yup.number().min(0, "Passenger is required"),
      children: Yup.number().min(0, "Passenger is required")
    }),
    from: Yup.array().of(
      Yup.object()
        .shape({
          value: Yup.string().required("From is required!"),
          label: Yup.string().required("From is required!")
        })
        .transform((value, originalValue) => {
          // If original value is a string, convert it into the expected object format.
          if (typeof originalValue === "string") {
            return { value: originalValue, label: originalValue }
          }
          return originalValue
        })
    ),
    to: Yup.array().of(
      Yup.object()
        .shape({
          value: Yup.string().required("To is required!"),
          label: Yup.string().required("To is required!")
        })
        .transform((value, originalValue) => {
          if (typeof originalValue === "string") {
            return { value: originalValue, label: originalValue }
          }
          return originalValue
        })
    ),
    departure: Yup.array().of(
      Yup.date().required("Departure date is required!")
    ),
    ...(tripType === TRIP_TYPES.ROUND_TRIP
      ? {
          // return: Yup.array().of(
          //   Yup.date().required("Return date is required!")
          //   // .test(
          //   //   "departure_value_test",
          //   //   "Return should be after departure!",
          //   //   function (value) {
          //   //     const { departure } = this.parent;
          //   //     if (departure && departure.length > 0 && value) {
          //   //       return new Date(value).getTime() >= new Date(departure[0]).getTime();
          //   //     }
          //   //     return false;
          //   //   }
          //   // )
          // )
          return: Yup.array().of(
            Yup.date()
              .nullable()
              .transform((originalValue) =>
                originalValue === "" ? null : originalValue
              )
              .required("Return date is required!")
              .typeError("Return date is required!")
            // .test(
            //   "departure_value_test",
            //   "Return should be after departure!",
            //   function (value) {
            //     const { departure } = this.parent
            //     if (departure && departure.length > 0 && value) {
            //       // Compare return date to departure date
            //       return (
            //         new Date(value).getTime() >=
            //         new Date(departure[0]).getTime()
            //       )
            //     }
            //     return false
            //   }
            // )
          )
        }
      : {})
  })

  const {
    register,
    getValues,
    setValue,
    resetField,
    watch,
    control,
    handleSubmit,
    formState: { errors },
    clearErrors,
    reset
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { tripType: TRIP_TYPES.ROUND_TRIP }
  })

  const addDestination = () => {
    if (destinations.length < 4) {
      setDestinations([...destinations, { from: "", to: "", departure: "" }])
    }
  }

  const removeDestination = (index) => {
    const updatedDestinations = destinations.filter((_, i) => i !== index)
    setTripCount(updatedDestinations.length)
    setDestinations(updatedDestinations)
    reset({ destinations: updatedDestinations })
  }

  useEffect(() => {
    if (parsedSearchParams) {
      const { adults, children, infants, travelClass } = parsedSearchParams
      setValue("passenger.adults", adults || 1)
      setValue("passenger.children", children || 0)
      setValue("passenger.infants", infants || 0)
      setValue("travelClass", travelClass)
    }
  }, [parsedSearchParams, setValue, removeDestination])

  const getDefaultDate = (i) => {
    return parsedSearchParams.originDestinations &&
      parsedSearchParams.originDestinations.length &&
      parsedSearchParams.originDestinations[i * 2 + 1]
      ? parsedSearchParams.originDestinations[i * 2 + 1].departureDateTimeRange
          .date
      : moment().add(4, "days").format("YYYY-MM-DD")
  }

  // const getDefaultMinDate = (i, departureDate) => {
  //   return departureDate && departureDate !== ""
  //     ? moment(departureDate).add(1, "days").format("YYYY-MM-DD")
  //     : parsedSearchParams.originDestinations &&
  //       parsedSearchParams.originDestinations.length &&
  //       parsedSearchParams.originDestinations[i * 2]
  //     ? parsedSearchParams.originDestinations[i * 2].departureDateTimeRange.date
  //     : moment().add(4, "days").format("YYYY-MM-DD")
  // }

  const getDefaultMinDate = (i, departureDate) => {
    console.log("Departure Date:", departureDate)

    if (departureDate && departureDate !== "") {
      const calculatedDate = moment(departureDate).add(1, "days").toDate() // Return a Date object
      console.log("Calculated Min Date:", calculatedDate)
      return calculatedDate
    }

    if (
      parsedSearchParams.originDestinations &&
      parsedSearchParams.originDestinations.length &&
      parsedSearchParams.originDestinations[i * 2]
    ) {
      const fallbackDate = new Date(
        parsedSearchParams.originDestinations[i * 2].departureDateTimeRange.date
      )

      return fallbackDate
    }

    const defaultDate = moment().add(4, "days").toDate()

    return defaultDate
  }

  const [departureDate, setDepartureDate] = useState("")
  const watchMinDepartureDate = watch(`departure[${0}]`)

  const handleTripTypeChange = (value) => {
    setTripType(value)
    if (value === TRIP_TYPES.MULTI_CITY) {
      setTripCount(2)
    } else if (value === TRIP_TYPES.ONE_WAY || TRIP_TYPES.ROUND_TRIP) {
      setTripCount(1)
      const firstDestination = destinations.slice(0, 1)
      setDestinations(firstDestination)
      reset({ destinations: firstDestination })
    }
  }

  const updateTripCount = (updateType, count) => {
    const newTripCount =
      updateType === UPDATE_TRIP_TYPE.INCREASE
        ? tripCount + count
        : tripCount - count

    if (newTripCount > 0 && newTripCount < 5) {
      setTripCount(newTripCount)
      resetFieldValues(newTripCount)
    }
  }

  const resetFieldValues = (tripCount) => {
    const currentFromValues = getValues("from") || []
    const currentToValues = getValues("to") || []

    const updatedFromValues = Array.from(
      { length: tripCount },
      (_, i) => currentFromValues[i] || ""
    )
    const updatedToValues = Array.from(
      { length: tripCount },
      (_, i) => currentToValues[i] || ""
    )

    resetField("from", { defaultValue: updatedFromValues })
    resetField("to", { defaultValue: updatedToValues })
  }

  const onSubmit = (data, e) => {
    const originDestinations = []
    data.from.forEach((_, i) => {
      originDestinations.push({
        id: i + 1,
        originLocationCode: data.from[i].value,
        destinationLocationCode: data.to[i].value,
        departureDateTimeRange: {
          date: moment(data.departure[i]).format("YYYY-MM-DD")
        }
      })

      // Check if it's a two-way trip
      if (tripType === TRIP_TYPES.ROUND_TRIP) {
        originDestinations.push({
          id: i + 2,
          originLocationCode: data.to[i].value,
          destinationLocationCode: data.from[i].value,
          departureDateTimeRange: {
            date: moment(data.return[i]).format("YYYY-MM-DD")
          }
        })
      }
    })

    const searchParams = {
      currencyCode: "AUD",
      originDestinations: originDestinations,
      adults: data.passenger.adults,
      // children: data.passenger.children,
      // infants: data.passenger.infants,
      travelClass: data.travelClass,
      tripType: tripType,
      tripCount: tripCount
    }
    const passengerFields = ["children", "infants"]

    passengerFields.forEach((field) => {
      if (data.passenger[field]) {
        searchParams[field] = data.passenger[field]
      }
    })

    const watchFrom = watch("from")
    const watchTo = watch("to")

    const fromValues = data.from.map((fromItem) => fromItem)
    const toValues = data.to.map((toItem) => toItem)
    const areSame = fromValues.some((fromValue) =>
      toValues.some((toValue) => fromValue === toValue)
    )

    if (areSame && tripCount == 1) {
      toast.error("Same From and To destinations are not allowed", {
        position: "top-right",

        autoClose: true
      })
    } else {
      handleSearchBarChange(searchParams)
      onClose()
    }
  }

  console.log("destinations", destinations)

  return (
    <div className="search-modal-container">
      {/* Backdrop */}
      <div className="modal-backdrop" style={{ backgroundColor: "#EEEEEE" }}>
        {/* Modal */}
        <div
          className="modal"
          style={{
            display: "block"
          }}
        >
          <div className="modal-dialog modal-lg  ">
            <div className="modal-content for-mobile">
              <div className="modal-header ">
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                ></button>
                <h5 className="modal-title ">Flight Preferences </h5>
              </div>
              <div className="modal-body search-modal">
                <form className="rounded-3" onSubmit={handleSubmit(onSubmit)}>
                  <div className=" ">
                    <div className="search-destination-mob">
                      <div className="row">
                        <div className="col-4 ">
                          <Select
                            className="w-100 custom-trip-select"
                            value={tripType}
                            name="tripType"
                            onChange={(value) => handleTripTypeChange(value)}
                            dropdownStyle={{
                              width: "auto",
                              minWidth: "200px",
                              maxWidth: "100%"
                            }}
                            suffixIcon={
                              <>
                                <Image
                                  src="/assets/images/icons/mobDropdown.svg"
                                  alt="dropdown icon"
                                  className="dropdown-icon-mobile"
                                  width={20}
                                  height={20}
                                />
                              </>
                            }
                          >
                            <Option value={TRIP_TYPES.ROUND_TRIP}>
                              Round Trip
                            </Option>
                            <Option value={TRIP_TYPES.ONE_WAY}>One Way</Option>
                            <Option value={TRIP_TYPES.MULTI_CITY}>
                              Multi City
                            </Option>
                          </Select>
                        </div>
                        <div className="col-4 pl-1 ">
                          <div
                            className={`form-control-bg-light form-fs-md   ${
                              errors && errors.passenger !== ""
                                ? "is-invalid"
                                : ""
                            }`}
                          >
                            <NewPassengerSelect
                              name={"passenger"}
                              control={control}
                              register={register}
                              errors={errors}
                              passengers={{
                                adults: 1,
                                children: 0,
                                infants: 0
                              }}
                              individualPassengerCount={
                                individualPassengerCount
                              }
                              setIndivisualPassengerCount={
                                setIndivisualPassengerCount
                              }
                              maxPassengers={
                                tripType === TRIP_TYPES.MULTI_CITY ? 9 : 7
                              }
                            />
                            {errors && errors.passenger && (
                              <div className="text-danger">
                                {errors.passenger.message}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-4 pl-1">
                          <div
                            className={`form-control-bg-light form-fs-md   ${
                              errors && errors.class !== "" ? "is-invalid" : ""
                            }`}
                          >
                            <NewClassSelectMobile
                              name={"travelClass"}
                              control={control}
                              data={[
                                { label: "Economy", value: "ECONOMY" },
                                { label: "Business", value: "BUSINESS" },
                                { label: "First Class", value: "FIRST" }
                              ]}
                              register={register}
                              errors={errors}
                              defaultValue={
                                parsedSearchParams?.travelClass ?? "ECONOMY"
                              }
                            />
                            {errors && errors.class && (
                              <div className="text-danger">
                                {errors.class.message}
                              </div>
                            )}
                          </div>
                        </div>

                        {destinations.map((destination, index) => (
                          <React.Fragment key={index}>
                            {tripType === TRIP_TYPES.MULTI_CITY &&
                              index > 0 && (
                                <div
                                  className="d-flex align-items-center justify-content-end cross-icon cursor-pointer p-2"
                                  onClick={() => {
                                    removeDestination(index)
                                  }}
                                >
                                  <Image
                                    src="/assets/images/icons/remove.svg"
                                    className="mr-2"
                                    width={20}
                                    height={20}
                                  />
                                </div>
                              )}
                            <div className="col-12 mt-1">
                              <div className="search-input-field">
                                <NewCitySelect
                                  name={`from[${index}]`}
                                  data={airports.map((a) => ({
                                    ...a,
                                    value: a.IATA
                                  }))}
                                  register={register}
                                  errors={errors}
                                  defaultValue={
                                    destination?.from ||
                                    parsedSearchParams?.originDestinations?.[
                                      index
                                    ]?.originLocationCode
                                  }
                                  value={watch(`from[${index}]`)}
                                />
                                {errors?.from?.[index] && (
                                  <div className="text-danger">
                                    {errors.from[index].message}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="col-12">
                              <div className="search-input-field mt-2">
                                <NewCitySelect
                                  name={`to[${index}]`}
                                  data={airports.map((a) => ({
                                    ...a,
                                    value: a.IATA
                                  }))}
                                  register={register}
                                  errors={errors}
                                  defaultValue={
                                    destination?.to ||
                                    parsedSearchParams.originDestinations?.[
                                      index
                                    ]?.destinationLocationCode
                                  }
                                  value={watch(`to[${index}]`)}
                                />
                                {errors?.to?.[index] && (
                                  <div className="text-danger">
                                    {errors.to[index].message}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-12 mt-2">
                              <div className="search-input-field">
                                <NewDatePicker
                                  name={`departure[${index}]`}
                                  register={register}
                                  errors={errors}
                                  control={control}
                                  setValue={setValue}
                                  defaultDate={
                                    parsedSearchParams?.originDestinations?.[
                                      index
                                    ]?.departureDateTimeRange?.date ||
                                    moment().add(3, "days").format("YYYY-MM-DD")
                                  }
                                  value={watch(`departure[${index}]`)}
                                  minDate={moment().format("YYYY-MM-DD")}
                                />
                              </div>
                              {errors?.departure?.[index] && (
                                <div className="text-danger">
                                  {errors.return[index].message}
                                </div>
                              )}
                            </div>

                            {tripType == TRIP_TYPES.ROUND_TRIP && (
                              <div className="col-12 mt-2">
                                <div className="search-input-field">
                                  <NewDatePicker
                                    name={`return[${index}]`}
                                    register={register}
                                    errors={errors}
                                    control={control}
                                    setValue={setValue}
                                    defaultDate={getDefaultDate(index)}
                                    value={watch(`return[${index}]`)}
                                    // minDate={
                                    //   watchMinDepartureDate ||
                                    //   getDefaultMinDate(index, departureDate)
                                    // }
                                    minDate={getDefaultMinDate(
                                      index,
                                      departureDate
                                    )}
                                  />
                                </div>
                                {errors?.return?.[index] &&
                                  tripType === TRIP_TYPES.ROUND_TRIP && (
                                    <div className="text-danger">
                                      {errors.return[index].message}
                                    </div>
                                  )}
                              </div>
                            )}
                          </React.Fragment>
                        ))}

                        {tripType === TRIP_TYPES.MULTI_CITY &&
                          destinations.length < 4 && (
                            <div className="d-flex align-items-center justify-content-end mt-2">
                              <div className="col-lg-6">
                                <button
                                  className="btn btn-primary add-destination-btn "
                                  onClick={addDestination}
                                  type="button"
                                >
                                  Add Destinations
                                </button>
                              </div>
                            </div>
                          )}
                        <div className="col-12 mt-3 mb-3">
                          <button
                            className="btn btn-primary w-100 mob-search-btn"
                            type="submit"
                          >
                            <span>
                              <Image
                                src="/assets/images/icons/search-img-icon.svg"
                                alt="search-icon"
                                className="mr-2"
                                width={26}
                                height={26}
                              />
                              Search
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditDestinationModal
