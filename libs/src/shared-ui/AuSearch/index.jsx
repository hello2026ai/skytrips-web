import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import lzutf8 from "lzutf8"

// common components
import {
  CitySelect,
  ClassSelect,
  DatePicker,
  PassengerSelect
} from "@/src/components/commons"

import { airports } from "@utils"
import moment from "moment"
import { toast } from "react-toastify"

import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { CiSearch } from "react-icons/ci"
import { CgProfile } from "react-icons/cg"

import * as Yup from "yup"

import "./styles.scss"
import AuCitySelect from "../AuCitySelect"
import AuClassSelect from "../AuClassSelect"
import AuDatePicker from "../AuDatePicker"
import AuPassengerSelect from "../AuPassengerSelect"
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
  arrival: []
}

const AuSearch = ({ redirectTo, updateSearchTripCount, searchParams }) => {
  const parsedSearchParams = searchParams ? JSON.parse(searchParams) : {}

  // console.log("parsedSearchParams", parsedSearchParams)

  const [rerender, setRerender] = useState(false)

  const [tripType, setTripType] = useState(
    parsedSearchParams.tripType || TRIP_TYPES.ROUND_TRIP
  )
  const [departureDate, setDepartureDate] = useState("")
  const [tripCount, setTripCount] = useState(parsedSearchParams.tripCount || 1)

  const [openSearch, setSearch] = useState(false)

  const [isFirstRender, setIsFirstRender] = useState(true)
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined
  })

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false) // Set it to false after the first render
    }
  }, [isFirstRender])

  useEffect(() => {
    // Handler to call on window resize
    const handleScreenResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    // Add event listener
    window.addEventListener("resize", handleScreenResize)

    // Call handler right away so state gets updated with initial window size
    handleScreenResize()

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleScreenResize)
  }, [])

  const validationSchema = Yup.object().shape({
    travelClass: Yup.string().required("Class is required!"),
    passenger: Yup.object().shape({
      adult: Yup.number().min(0, "Passenger is required"),
      children: Yup.number().min(0, "Passenger is required")
    }),
    from: Yup.array(
      Yup.string("From is required!").required("From is required!")
    ),
    to: Yup.array(Yup.string("To is required!").required("To is required!")),
    departure: Yup.array(Yup.date().required("Departure date is required!")),
    ...(tripType === TRIP_TYPES.ROUND_TRIP
      ? {
          return: Yup.array(
            Yup.date()
              .required("Return date is required!")
              .test({
                name: "departure_value_test",
                message: "Return should be after departure!",
                test: (value, context) => {
                  const currentDate = new Date(value)
                  const previousDate = new Date(
                    context.from[0]["value"]["departure"][0]
                  )
                  if (currentDate && previousDate) {
                    return currentDate.getTime() >= previousDate.getTime()
                  }

                  return false
                }
              })
          )
        }
      : {})
  })

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSearch(false)
      }
    }

    window.addEventListener("resize", handleResize)

    // Call handleResize initially to set the state based on the initial window size
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // constant
  const router = useRouter()
  const pathname = router.pathname

  // console.log("pathname", pathname)

  const {
    register,
    getValues,
    setValue,
    resetField,
    watch,
    handleSubmit,
    formState: { errors },
    clearErrors
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: initialValues
  })

  const resetFieldValues = (tripCount) => {
    resetField("from", {
      defaultValue: getValues("from").filter((_, i) => i < tripCount)
    })
    resetField("to", {
      defaultValue: getValues("to").filter((_, i) => i < tripCount)
    })
    // resetField("departure", {
    //   defaultValue: getValues("departure").filter((_, i) => i < tripCount)
    // })

    // if (tripType === TRIP_TYPES.ROUND_TRIP) {
    //   resetField("return", {
    //     defaultValue: getValues("return").filter((_, i) => i < tripCount)
    //   })
    // }
  }

  const updateTripType = (newTripType) => {
    if (newTripType !== TRIP_TYPES.MULTI_CITY) {
      setTripCount(1)
      if (updateSearchTripCount) {
        updateSearchTripCount(1)
      }
      resetFieldValues(1)
    }
    setTripType(newTripType)
    clearErrors()
  }

  console.log("openSearch in au", openSearch)

  const onSubmit = (data, e) => {
    const originDestinations = []
    data.from.forEach((_, i) => {
      originDestinations.push({
        id: i + 1,
        originLocationCode: data.from[i],
        destinationLocationCode: data.to[i],
        departureDateTimeRange: {
          date: moment(data.departure[i]).format("YYYY-MM-DD")
        }
      })

      // Check if it's a two-way trip
      if (tripType === TRIP_TYPES.ROUND_TRIP) {
        originDestinations.push({
          id: i + 2,
          originLocationCode: data.to[i],
          destinationLocationCode: data.from[i],
          departureDateTimeRange: {
            date: moment(data.return[i]).format("YYYY-MM-DD")
          }
        })
      }
    })

    const searchParams = {
      currencyCode: "AUD",
      originDestinations: originDestinations,
      adults: data.passenger.adult,
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

    if (areSame && areSame === true && tripCount == 1) {
      toast.error("Same From and To destinations are not allowed", {
        position: "top-right",

        autoClose: true
      })
    } else {
      // Continue with form submission logic
      setSearch(false)
      router.push({
        pathname: `/${redirectTo}`,
        query: {
          searchParams: lzutf8.compress(JSON.stringify(searchParams), {
            outputEncoding: "Base64"
          })
        }
      })
    }
  }

  const updateTripCount = (updateType, count) => {
    const newTripCount =
      updateType === UPDATE_TRIP_TYPE.INCREASE
        ? tripCount + count
        : tripCount - count

    if (newTripCount > 0 && newTripCount < 5) {
      setTripCount(newTripCount)
      if (updateSearchTripCount) {
        updateSearchTripCount(newTripCount)
      }
      resetFieldValues(newTripCount)
    }
  }

  const getDefaultDate = (i) => {
    return parsedSearchParams.originDestinations &&
      parsedSearchParams.originDestinations.length &&
      parsedSearchParams.originDestinations[i * 2 + 1]
      ? parsedSearchParams.originDestinations[i * 2 + 1].departureDateTimeRange
          .date
      : moment().add(4, "days").format("YYYY-MM-DD")
  }

  const getDefaultMinDate = (i, departureDate) => {
    return departureDate && departureDate !== ""
      ? moment(departureDate).add(1, "days").format("YYYY-MM-DD")
      : parsedSearchParams.originDestinations &&
        parsedSearchParams.originDestinations.length &&
        parsedSearchParams.originDestinations[i * 2]
      ? parsedSearchParams.originDestinations[i * 2].departureDateTimeRange.date
      : moment().add(4, "days").format("YYYY-MM-DD")
  }

  const departureField = register("departure", { required: true })

  const [fromValue, setFromValue] = useState("")
  const [toValue, setToValue] = useState("")

  useEffect(() => {
    // Whenever fromValue or toValue changes, trigger a re-render
    setRerender((prev) => !prev)
  }, [fromValue, toValue])

  const handleFlipDestination = (i) => {
    // Get the default values of "from" and "to"
    const defaultFromValue = watch(`from[${i}]`)
    const defaultToValue = watch(`to[${i}]`)

    setValue(`from[${i}]`, defaultToValue)
    setFromValue(watch(`from[${i}]`))

    setValue(`to[${i}]`, defaultFromValue)
    setToValue(watch(`to[${i}]`))
  }
  const searchDefault = (e, des1, des2) => {
    e.preventDefault()
    console.log("searchDefault", des1, des2)

    if (!des1 == "" && !des2 == "") {
      setValue(`from[${des1}]`, des1)
      setFromValue(watch(`from[${des1}]`))

      setValue(`to[${des2}]`, des2)
      setToValue(watch(`to[${des2}]`))

      const i = 0
      const originDestinations = []
      // data.from.forEach((_, i=0) => {
      originDestinations.push({
        id: i + 1,
        originLocationCode: "SYD",
        destinationLocationCode: "KTM",
        departureDateTimeRange: {
          date: moment().add(3, "days").format("YYYY-MM-DD")
        }
      })

      const searchParams = {
        currencyCode: "AUD",
        originDestinations: originDestinations,
        // destinationLocationCode: "KTM",
        adults: 1,
        // children: data.passenger.children,
        // infants: data.passenger.infants,
        travelClass: "ECONOMY",
        tripType: tripType,
        tripCount: tripCount
      }

      router.push({
        pathname: `/${redirectTo}`,
        query: {
          searchParams: lzutf8.compress(JSON.stringify(searchParams), {
            outputEncoding: "Base64"
          })
        }
      })

      const watchFrom = watch("from")
      const watchTo = watch("to")
    }
  }
  // console.log("fromValue", fromValue)
  // console.log("toValue", toValue)

  const openSearchBar = (e) => {
    e.preventDefault()
    setSearch(!openSearch)
  }

  // console.log("openSearch", openSearch)

  const originLocationCode =
    parsedSearchParams?.originDestinations?.[0]?.originLocationCode
  const destinationLocationCode =
    parsedSearchParams?.originDestinations?.[0]?.destinationLocationCode

  // Safely find the city based on the destination IATA code
  const toCountry = destinationLocationCode
    ? airports.find((airport) => airport.IATA === destinationLocationCode)
        ?.city || null
    : null
  const fromCountry = originLocationCode
    ? airports.find((airport) => airport.IATA === originLocationCode)?.city ||
      null
    : null

  // const fromCountry =
  //   airports.find(
  //     (airport) =>
  //       airport.IATA ===
  //       parsedSearchParams?.originDestinations[0]?.originLocationCode
  //   )?.city || null

  // const toCountry =
  //   airports.find(
  //     (airport) =>
  //       airport.IATA ===
  //       parsedSearchParams?.originDestinations[0]?.destinationLocationCode
  //   )?.city || null

  // console.log("fromCountry", fromCountry)
  // console.log("toCountry", toCountry)
  const watchMinDepartureDate = watch(`departure[${0}]`)

  return (
    <>
      {pathname === "/available-flights" && openSearch === false && (
        <div
          className="destination-for-mobile"
          onClick={(e) => openSearchBar(e)}
        >
          <h1>
            {fromCountry} to {toCountry}
            <span className="mobile-search-icon">
              {" "}
              <CiSearch size="28px" />
            </span>
          </h1>
        </div>
      )}

      <div
        className={
          pathname === "/available-flights"
            ? `flight-form bg-mode  px-3 px-sm-4 pt-4 mb-4 mb-sm-0 search-section-au ${
                openSearch === true
                  ? "search-main-component-mobile-au"
                  : "search-main-component"
              }`
            : `flight-form bg-mode  px-3 px-sm-4 pt-4 mb-4 mb-sm-0 search-section-au ${
                pathname === "/au" ? "au-search" : ""
              }`

          // `/available-flights flight-form bg-mode  px-3 px-sm-4 pt-4 mb-4 mb-sm-0 search-section-au ${
          //   pathname === "/au" ? "au-search" : ""
          // }`
        }
      >
        {/* Svg decoration */}
        <figure
          className="position-absolute top-0 h-100 ms-n2 ms-sm-n1 side-design"
          style={{ left: "0px" }}
        >
          <svg
            className={`h-100 ${pathname === "/au" ? "au-side-design" : ""}`}
            viewBox="0 0 12.9 324"
            style={{ enableBackground: "new 0 0 12.9 324" }}
          >
            <path
              className="fill-mode"
              d="M9.8,316.4c1.1-26.8,2-53.4,1.9-80.2c-0.1-18.2-0.8-36.4-1.2-54.6c-0.2-8.9-0.2-17.7,0.8-26.6 c0.5-4.5,1.1-9,1.4-13.6c0.1-1.9,0.1-3.7,0.1-5.6c-0.2-0.2-0.6-1.5-0.2-3.1c-0.3-1.8-0.4-3.7-0.4-5.5c-1.2-3-1.8-6.3-1.7-9.6 c0.9-19,0.5-38.1,0.8-57.2c0.3-17.1,0.6-34.2,0.2-51.3c-0.1-0.6-0.1-1.2-0.1-1.7c0-0.8,0-1.6,0-2.4c0-0.5,0-1.1,0-1.6 c0-1.2,0-2.3,0.2-3.5H0v11.8c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1V31c3.3,0,6.1,2.7,6.1,6.1S3.3,43.3,0,43.3v6.9 c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1 s-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9 c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1 c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.7,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9 c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.7,6.1,6.1 c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1V324h9.5C9.6,321.4,9.7,318.8,9.8,316.4z"
            />
          </svg>
        </figure>
        {/* Svg decoration */}
        <figure
          className="position-absolute top-0 h-100 rotate-180 me-n2 me-sm-n1 side-design"
          style={{ right: "0px" }}
        >
          <svg
            className={`h-100 ${pathname === "/au" ? "au-side-design" : ""}`}
            viewBox="0 0 21 324"
            style={{ enableBackground: "new 0 0 21 324" }}
          >
            <path
              className="fill-mode"
              d="M9.8,316.4c1.1-26.8,2-53.4,1.9-80.2c-0.1-18.2-0.8-36.4-1.2-54.6c-0.2-8.9-0.2-17.7,0.8-26.6 c0.5-4.5,1.1-9,1.4-13.6c0.1-1.9,0.1-3.7,0.1-5.6c-0.2-0.2-0.6-1.5-0.2-3.1c-0.3-1.8-0.4-3.7-0.4-5.5c-1.2-3-1.8-6.3-1.7-9.6 c0.9-19,0.5-38.1,0.8-57.2c0.3-17.1,0.6-34.2,0.2-51.3c-0.1-0.6-0.1-1.2-0.1-1.7c0-0.8,0-1.6,0-2.4c0-0.5,0-1.1,0-1.6 c0-1.2,0-2.3,0.2-3.5H0v11.8c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1V31c3.3,0,6.1,2.7,6.1,6.1S3.3,43.3,0,43.3v6.9 c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1 s-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9 c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1 c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.7,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9 c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.7,6.1,6.1 c0,3.4-2.8,6.1-6.1,6.1v6.9c3.3,0,6.1,2.8,6.1,6.1c0,3.4-2.8,6.1-6.1,6.1V324h9.5C9.6,321.4,9.7,318.8,9.8,316.4z"
            />
          </svg>
        </figure>
        <div className="row g-4 position-relative ">
          {/* Nav tabs START */}
          <div className="col-lg-12">
            {/* </div> */}
            {/* Nav tabs END */}

            {/* <div className="col-lg-10"> */}
            <form className="mt-0" onSubmit={handleSubmit(onSubmit)}>
              {/* <div className="row g-4">
                <div className="col-lg-10">
                  <ul className="nav nav-pills nav-pills-dark">
                    <li className="nav-item">
                      <button
                        className={`nav-link rounded-start rounded-0 mb-0 ${
                          tripType === TRIP_TYPES.ROUND_TRIP ? "active" : ""
                        }`}
                        type="button"
                        onClick={() => updateTripType(TRIP_TYPES.ROUND_TRIP)}
                      >
                        Round Trip
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`nav-link  rounded-0 mb-0  ${
                          tripType === TRIP_TYPES.ONE_WAY ? "active" : ""
                        }`}
                        type="button"
                        onClick={() => {
                          updateTripType(TRIP_TYPES.ONE_WAY)
                        }}
                      >
                        One Way
                      </button>
                    </li>

                    <li className="nav-item " role="presentation">
                      <button
                        className={`nav-link rounded-end rounded-0 mb-0 ${
                          tripType === TRIP_TYPES.MULTI_CITY ? "active" : ""
                        }`}
                        id="pills-mutiple-trip-tab"
                        data-bs-toggle="pill"
                        data-bs-target="#pills-multiple-trip"
                        type="button"
                        role="tab"
                        aria-selected="false"
                        onClick={() => updateTripType(TRIP_TYPES.MULTI_CITY)}
                      >
                        Multi City
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="col-lg-2  col-sm-12  ">
                  <div
                    className={`form-control-bg-light form-fs-md  economy-class ${
                      errors && errors.class !== "" ? "is-invalid" : ""
                    }`}
                  >
                    <AuClassSelect
                      name={"travelClass"}
                      data={[
                        { label: "Economy", value: "ECONOMY" },
                        { label: "Business", value: "BUSINESS" },
                        { label: "First Class", value: "FIRST" }
                      ]}
                      register={register}
                      errors={errors}
                      defaultValue={parsedSearchParams.travelClass || "ECONOMY"}
                    />
                    {errors && errors.class && (
                      <div className="text-danger">{errors.class.message}</div>
                    )}
                  </div>
                </div>
              </div> */}
              <div className="mt-0" id="pills-tabContent">
                <div className="">
                  {[...Array(tripCount)].map((_, i) => (
                    <div
                      className={`row g-4 justify-content-start ${
                        i !== 0 ? "mt-2" : ""
                      }`}
                    >
                      {i == 0 && (
                        <div className="col-lg-10 col-sm-12 trip-option-nav">
                          <ul
                            className="nav nav-pills nav-pills-dark mobile-design"
                            role="tablist"
                          >
                            <li className="nav-item ">
                              <button
                                className={`nav-link rounded-start start rounded-0 mb-0 ${
                                  tripType === TRIP_TYPES.ROUND_TRIP
                                    ? "active"
                                    : ""
                                }`}
                                type="button"
                                onClick={() =>
                                  updateTripType(TRIP_TYPES.ROUND_TRIP)
                                }
                                role="tab"
                              >
                                Round Trip
                              </button>
                            </li>
                            <li className="nav-item ">
                              <button
                                className={`nav-link  rounded-middle rounded-0 mb-0 one-way-div  ${
                                  tripType === TRIP_TYPES.ONE_WAY
                                    ? "active"
                                    : ""
                                }`}
                                type="button"
                                onClick={() => {
                                  updateTripType(TRIP_TYPES.ONE_WAY)
                                }}
                                role="tab"
                              >
                                One Way
                              </button>
                            </li>

                            <li className="nav-item " role="presentation">
                              <button
                                className={`nav-link rounded-end end rounded-0 mb-0 ${
                                  tripType === TRIP_TYPES.MULTI_CITY
                                    ? "active"
                                    : ""
                                }`}
                                id="pills-mutiple-trip-tab"
                                data-bs-toggle="pill"
                                data-bs-target="#pills-multiple-trip"
                                type="button"
                                role="tab"
                                aria-selected="false"
                                onClick={() =>
                                  updateTripType(TRIP_TYPES.MULTI_CITY)
                                }
                              >
                                Multi City
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                      {i == 0 && windowSize?.width > 820 && (
                        <div className="col-lg-2  col-sm-12  ">
                          <div
                            className={`form-control-bg-light form-fs-md  economy-class ${
                              errors && errors.class !== "" ? "is-invalid" : ""
                            }`}
                          >
                            <AuClassSelect
                              name={"travelClass"}
                              data={[
                                { label: "Economy", value: "ECONOMY" },
                                { label: "Business", value: "BUSINESS" },
                                { label: "First Class", value: "FIRST" }
                              ]}
                              register={register}
                              errors={errors}
                              defaultValue={
                                parsedSearchParams.travelClass || "ECONOMY"
                              }
                            />
                            {errors && errors.class && (
                              <div className="text-danger">
                                {errors.class.message}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div
                        className={`${
                          tripType === TRIP_TYPES.ONE_WAY
                            ? "col-lg-3"
                            : "col-lg-3"
                        }`}
                      >
                        <div
                          className={`form-border-transparent form-fs-lg  rounded-3 ${
                            tripType === TRIP_TYPES.MULTI_CITY ||
                            tripType === TRIP_TYPES.ROUND_TRIP
                              ? "multi-city-destination"
                              : "h-100"
                          } p-3 au-search-details`}
                        >
                          <label className="mb-1 search-label">
                            {/* <i className="bi bi-geo-alt me-2" /> */}
                            <Image
                              src="/assets/images/homeIcon/fromIcon.svg"
                              alt="from-image"
                              className="me-2"
                              width={20}
                              height={20}
                            />
                            From
                          </label>
                          <AuCitySelect
                            name={`from[${i}]`}
                            data={airports.map((a) => ({
                              ...a,
                              value: a.IATA
                            }))}
                            register={register}
                            errors={errors}
                            defaultValue={
                              parsedSearchParams.originDestinations &&
                              parsedSearchParams.originDestinations.length &&
                              parsedSearchParams.originDestinations[
                                tripType === TRIP_TYPES.ROUND_TRIP ? i * 2 : i
                              ]
                                ? parsedSearchParams.originDestinations[
                                    tripType === TRIP_TYPES.ROUND_TRIP
                                      ? i * 2
                                      : i
                                  ].originLocationCode
                                : i === 0
                                ? "SYD"
                                : ""
                            }
                            // value={fromValue}
                            value={watch(`from[${i}]`)}
                            // onChange={handleFromChange}
                          />
                          {errors && errors.from && errors.from[i] && (
                            <div className="text-danger ">
                              {errors.from[i].message}
                            </div>
                          )}
                        </div>

                        <div
                          className={`btn-flip-icon mt-3 mt-md-0 ${
                            tripType === TRIP_TYPES.MULTI_CITY ||
                            (tripType === TRIP_TYPES.ROUND_TRIP &&
                              windowSize?.width >= 820 &&
                              windowSize?.width <= 1300)
                              ? "arrow-placing"
                              : ""
                          }`}
                          onClick={() => handleFlipDestination(i)}
                        >
                          <button
                            className="btn btn-white shadow btn-round mb-0 "
                            type="button"
                          >
                            {/* <i className="fa-solid fa-right-left" /> */}
                            <Image
                              src="/assets/images/homeIcon/ArrowsLeftRight.svg"
                              alt="left-right-icon"
                              className="right-left-arrow"
                              width={20}
                              height={20}
                            />
                          </button>
                        </div>
                      </div>

                      <div
                        className={`${
                          tripType === TRIP_TYPES.ONE_WAY
                            ? "col-lg-3"
                            : "col-lg-3"
                        }`}
                      >
                        <div
                          className={`form-border-transparent form-fs-lg  rounded-3 
                            ${
                              tripType === TRIP_TYPES.MULTI_CITY ||
                              tripType === TRIP_TYPES.ROUND_TRIP
                                ? "multi-city-destination"
                                : "h-100"
                            } 
                          p-3 au-search-details`}
                        >
                          <label className="mb-1 search-label">
                            <Image
                              src="/assets/images/homeIcon/toIcon.svg"
                              alt="to-image"
                              className="me-2"
                              width={20}
                              height={20}
                            />
                            To
                          </label>
                          <AuCitySelect
                            name={`to[${i}]`}
                            data={airports.map((a) => ({
                              ...a,
                              value: a.IATA
                            }))}
                            register={register}
                            errors={errors}
                            defaultValue={
                              parsedSearchParams.originDestinations &&
                              parsedSearchParams.originDestinations.length &&
                              parsedSearchParams.originDestinations[
                                tripType === TRIP_TYPES.ROUND_TRIP ? i * 2 : i
                              ]
                                ? parsedSearchParams.originDestinations[
                                    tripType === TRIP_TYPES.ROUND_TRIP
                                      ? i * 2
                                      : i
                                  ].destinationLocationCode
                                : ""
                            }
                            // value={toValue}
                            value={watch(`to[${i}]`)}

                            // onChange={handleToChange}
                          />
                          {errors && errors.to && errors.to[i] && (
                            <div className="text-danger ">
                              {errors.to[i].message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-lg-4 ">
                        <div className="row g-2 justify-content-center date-for-mobile">
                          <div
                            className={`${
                              tripType === TRIP_TYPES.ONE_WAY
                                ? "col-lg-10 date-section-one"
                                : tripType === TRIP_TYPES.ROUND_TRIP
                                ? "col-lg-5 col-xl-6  date-section"
                                : "col-lg-10 date-section-one"
                            }`}
                          >
                            <div className="form-border-transparent form-fs-lg  rounded-3 h-100 au-search-details">
                              <label className="mb-1 search-label">
                                <Image
                                  src="assets/images/homeIcon/CalendarBlank.svg"
                                  alt="from-image"
                                  className="me-2"
                                  width={20}
                                  height={20}
                                />
                                Departure
                              </label>
                              <div className="search_to_datepicker">
                                <AuDatePicker
                                  name={`departure[${i}]`}
                                  register={register}
                                  errors={errors}
                                  defaultDate={
                                    parsedSearchParams.originDestinations &&
                                    parsedSearchParams.originDestinations
                                      .length &&
                                    parsedSearchParams.originDestinations[
                                      tripType === TRIP_TYPES.ROUND_TRIP
                                        ? i * 2
                                        : i
                                    ]
                                      ? parsedSearchParams.originDestinations[
                                          tripType === TRIP_TYPES.ROUND_TRIP
                                            ? i * 2
                                            : i
                                        ].departureDateTimeRange.date
                                      : moment()
                                          .add(3, "days")
                                          .format("YYYY-MM-DD")
                                  }
                                  minDate={moment().format("YYYY-MM-DD")}
                                  onChange={(e) => {
                                    const value =
                                      e && e.target && e.target.value
                                    if (
                                      value &&
                                      tripType === TRIP_TYPES.ROUND_TRIP
                                    ) {
                                      setDepartureDate(value)
                                    }
                                    departureField.onChange(e)
                                  }}
                                />
                                {errors &&
                                  errors.departure &&
                                  errors.departure[i] && (
                                    <div className="text-danger">
                                      {errors.departure[i].message}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>

                          {tripType === TRIP_TYPES.ROUND_TRIP ? (
                            <div className="col-lg-5 col-xl-6 date-section">
                              <div className="form-border-transparent form-fs-lg  rounded-3 h-100 au-search-details">
                                <label className="mb-1 search-label">
                                  <Image
                                    src="assets/images/homeIcon/CalendarBlank.svg"
                                    alt="from-image"
                                    className="me-2"
                                    width={20}
                                    height={20}
                                  />
                                  Return
                                </label>
                                <div className="search_to_datepicker">
                                  <AuDatePicker
                                    name={`return[${i}]`}
                                    register={register}
                                    errors={errors}
                                    defaultDate={getDefaultDate(
                                      i,
                                      departureDate
                                    )}
                                    // minDate={getDefaultMinDate(i, departureDate)}
                                    minDate={
                                      watchMinDepartureDate
                                        ? watchMinDepartureDate
                                        : getDefaultMinDate(i, departureDate)
                                    }
                                  />
                                  {errors &&
                                    errors.return &&
                                    errors.return[i] && (
                                      <div className="text-danger">
                                        {errors.return[i].message}
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {tripType === TRIP_TYPES.MULTI_CITY ? (
                            <div className="col-lg-5 add-multi-city">
                              {i + 1 === tripCount ? (
                                <div className="form-border-transparent form-fs-lg  rounded-3 h-100 p-3 au-search-details">
                                  <label className="mb-0 float-right">
                                    <i
                                      className="bi bi-x me-2 fa-l cursor-pointer"
                                      onClick={() =>
                                        updateTripCount(
                                          UPDATE_TRIP_TYPE.DECREASE,
                                          1
                                        )
                                      }
                                    />
                                  </label>
                                  {tripCount < 4 ? (
                                    <span
                                      className="btn btn-primary mb-n1 w-100 add-city"
                                      onClick={() =>
                                        updateTripCount(
                                          UPDATE_TRIP_TYPE.INCREASE,
                                          1
                                        )
                                      }
                                    >
                                      Add another city
                                    </span>
                                  ) : (
                                    <span
                                      className="btn btn-primary mb-n4 w-100 mt-1"
                                      onClick={() =>
                                        updateTripCount(
                                          UPDATE_TRIP_TYPE.DECREASE,
                                          3
                                        )
                                      }
                                    >
                                      Clear
                                    </span>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {i == 0 && windowSize?.width <= 820 && (
                        <div className="col-lg-2  col-sm-12  ">
                          <div
                            className={`form-control-bg-light form-fs-md  economy-class ${
                              errors && errors.class !== "" ? "is-invalid" : ""
                            }`}
                          >
                            <AuClassSelect
                              name={"travelClass"}
                              data={[
                                { label: "Economy", value: "ECONOMY" },
                                { label: "Business", value: "BUSINESS" },
                                { label: "First Class", value: "FIRST" }
                              ]}
                              register={register}
                              errors={errors}
                              defaultValue={
                                parsedSearchParams.travelClass || "ECONOMY"
                              }
                            />
                            {errors && errors.class && (
                              <div className="text-danger">
                                {errors.class.message}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {i == 0 && (
                        <div className="col-lg-2 ms-auto  ">
                          <div className="form-border-transparent form-fs-lg  rounded-3  au-search-details mt-0 ">
                            <label className="mb-1 search-label">
                              <Image
                                src="/assets/images/profile-icon.svg"
                                className="me-2"
                                width={20}
                                height={20}
                              />
                              Select travelers
                            </label>
                            <div
                              className={`form-control-bg-light form-fs-md   ${
                                errors && errors.passenger !== ""
                                  ? "is-invalid"
                                  : ""
                              }`}
                            >
                              <AuPassengerSelect
                                name={"passenger"}
                                register={register}
                                errors={errors}
                                passengers={{
                                  adult: parsedSearchParams.adults || 1,
                                  children: parsedSearchParams.children || 0,
                                  infants: parsedSearchParams.infants || 0
                                }}
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
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="row d-flex flex-row-reverse">
                  <div className="col-lg-4 text-end pt-0 mt-4">
                    <button
                      className={`btn btn-primary mb-n4 w-100 check-availability-btn`}
                      type="submit"
                    >
                      Check Availability{" "}
                      <Image
                        src="assets/images/homeIcon/ArrowDown.svg"
                        alt="rightArrow"
                        width={30}
                        height={20}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {openSearch === true && (
        <div className="search-close-btn">
          <button
            className="btn btn-sm btn-primary-soft mb-0 me-2 "
            onClick={openSearchBar}
          >
            Close
          </button>
        </div>
      )}
    </>
  )
}

export default AuSearch
