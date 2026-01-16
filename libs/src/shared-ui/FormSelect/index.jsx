import React, { useEffect, useRef, useState } from "react"
import "./styles.scss"

const FormSelect = (props) => {
  const { options, placeholder, name, register, errors } = props

  // const [countryValue, setCountryValue] = useState("")

  // useEffect(() => {
  //   if (placeholder) {
  //     const findCountry = () => {
  //       const meCountry = options.find((item) => item.label === placeholder)
  //       return meCountry ? meCountry.value : ""
  //     }
  //     setCountryValue(findCountry())
  //   }
  // }, [placeholder])

  return (
    // <div className="choice-radius-0">
    <select
      className={` form-select ${
        errors ? "errorCountry" : ""
      }   choice-radius-0 js-choice z-index-9 border-0 bg-light`}
      data-search-enabled="true"
      name={name}
      {...register(name)}
    >
      <option value="" className="select-placeholder" aria-readonly>
        {placeholder}
      </option>
      {options?.map((item, i) => (
        <option value={item?.value ? item?.value : ""}>{item.label}</option>
      ))}
    </select>
    // </div>
  )
}

export default FormSelect
