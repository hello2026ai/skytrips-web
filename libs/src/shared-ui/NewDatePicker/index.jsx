import React, { forwardRef, useEffect } from "react"
import Flatpickr from "react-flatpickr"
import moment from "moment"
import { Controller } from "react-hook-form"

import "flatpickr/dist/flatpickr.css"
import "./styles.scss"
import { useRouter } from "next/router"
import Image from "next/image"

const DatePickerWithRef = forwardRef((props, ref) => {
  const {
    placeholder,
    name,
    errors,
    type,
    onChange,
    defaultDate,
    minDate,
    maxDate,
    onValueUpdate
  } = props

  const router = useRouter()
  const currentRoute = router.pathname

  const isDefaultDateInitialized = React.useRef(false)

  useEffect(() => {
    //restrict multi render
    if (
      !isDefaultDateInitialized.current &&
      defaultDate &&
      defaultDate !== ""
    ) {
      onChange({ target: { name, value: defaultDate } })
      isDefaultDateInitialized.current = true
    }
  }, [defaultDate, onChange, name])

  const returnDate = name.substring(0, 6)

  console.log("defaultDate", defaultDate)
  return (
    <>
      {" "}
      <h6 className="field-name">
        {name.startsWith("return") ? "Return Date" : "Departure Date"}
      </h6>
      <div className={`date-picker-container mt-0`}>
        <span className="departure-return-icon">
          {name.startsWith("return") ? (
            <Image
              src="/assets/images/icons/calenderIn.svg"
              alt="Icon"
              style={{ marginLeft: "5px" }}
              width={22}
              height={22}
            />
          ) : (
            <Image
              src="/assets/images/icons/calendarOut.svg"
              alt="Icon"
              style={{ marginLeft: "5px" }}
              width={22}
              height={22}
            />
          )}
        </span>
        <Flatpickr
          placeholder={placeholder || "Select date"}
          name={name}
          type={type}
          className={errors && errors[name] ? "error" : "date-input"}
          ref={ref}
          onChange={([date]) => {
            const formattedDate = moment(date).format("YYYY-MM-DD")

            onChange({ target: { name, value: formattedDate } })
            if (onValueUpdate) {
              onValueUpdate({ target: { name, value: formattedDate } })
            }
          }}
          options={{
            defaultDate:
              returnDate === "return" && currentRoute !== "/available-flights"
                ? ""
                : defaultDate
                ? moment.utc(defaultDate).format("DD-MM-YYYY")
                : "",
            minDate: minDate || "",
            maxDate: maxDate || "",
            dateFormat: "d-m-Y",
            monthSelectorType: "dropdown",
            yearSelectorType: "dropdown",
            disableMobile: true
          }}
        />
      </div>
    </>
  )
})

const NewDatePicker = ({
  name,
  control,
  setValue,
  errors,
  defaultDate,
  ...rest
}) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultDate || ""}
      render={({ field: { onChange, value } }) => (
        <DatePickerWithRef
          {...rest}
          name={name}
          errors={errors}
          defaultDate={defaultDate}
          onChange={(e) => {
            const formattedDate = e.target.value
            setValue(name, formattedDate, { shouldValidate: true })
            onChange(e)
          }}
          value={value}
        />
      )}
    />
  )
}

export default NewDatePicker
