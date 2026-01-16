import React from "react"
import "./styles.scss"

const CountryCodeSelect = (props) => {
  const { options, placeholder, name, register, errors, extraClassName } = props

  return (
    <select
      className={
        errors
          ? `errorCountry form-select  choice-radius-0 js-choice z-index-9 border-0 bg-light ${extraClassName}`
          : `form-select choice-radius-0 js-choice z-index-9 border-0 bg-light ${extraClassName}`
      }
      data-search-enabled="true"
      name={name}
      {...register(name)}
      placeholder={placeholder}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options?.map((item, i) => (
        <option value={item.dial_code} key={i}>
          {/* {item.name} */}
          {item.dial_code}
        </option>
      ))}
    </select>
    // </div>
  )
}

export default CountryCodeSelect
