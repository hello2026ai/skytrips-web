import React, { forwardRef, useEffect, useState } from "react"
import Flatpickr from "react-flatpickr"
import moment from "moment"

import "flatpickr/dist/flatpickr.css"
import "./styles.scss"
import { useRouter } from "next/router"
import Image from "next/image"

const DatePickerWithRef = forwardRef((props, ref) => {
  const {
    placeholder,
    name,
    errors,
    register,
    type,
    onChange,
    onBlur,
    defaultDate,
    minDate,
    maxDate,
    onValueUpdate
  } = props

  const router = useRouter()
  const currentRoute = router.pathname

  useEffect(() => {
    if (defaultDate && defaultDate !== "") {
      onChange({ target: { name, value: defaultDate } })
    }
  }, [defaultDate])
  // console.log("defaultDate", defaultDate)

  const returnDate = name.substring(0, 6)

  return (
    <div className="date-picker-contianer-au">
      <Flatpickr
        placeholder={placeholder || "Select date"}
        name={name}
        type={type}
        className={errors && errors[name] ? "error" : ""}
        ref={ref}
        onChange={([date]) => {
          onChange({ target: { name, value: date } })
          if (onValueUpdate) {
            onValueUpdate({ target: { name, value: date } })
          }
        }}
        // onValueUpdate={onValueUpdate}
        // onBlur={onBlur}

        options={{
          defaultDate:
            returnDate === "return" && currentRoute !== "/available-flights"
              ? ""
              : moment(defaultDate).format("DD-MM-YYYY"),
          minDate: minDate,
          maxDate: maxDate,
          dateFormat: "d-m-Y",
          monthSelectorType: "dropdown", // Use dropdown for month selection
          yearSelectorType: "dropdown", // Use dropdown for year selection
          disableMobile: true
        }}
      />

      <Image
        src="/assets/images/homeIcon/CalendarPlus.svg"
        width={20}
        height={20}
        className="right-image"
      />
    </div>
  )
})

const AuDatePicker = ({ register, name, ...rest }) => (
  <DatePickerWithRef name={name} {...register(name)} {...rest} />
)

export default AuDatePicker
