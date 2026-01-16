import React, { useEffect, forwardRef, useState } from "react"

import WindowedSelect from "react-windowed-select"

import "./styles.scss"

const SelectWithRef = forwardRef((props, ref) => {
  const {
    placeholder,
    name,
    data = [],
    register,
    errors,
    onChange,
    onBlur,
    defaultValue,
    value
  } = props

  const [filterName, setFilterName] = useState("name")
  const [inputValue, setInputValue] = useState("")
  const [showSearchDestination, setShowSearchDestination] = useState(false)

  useEffect(() => {
    if ((value || defaultValue) && (value || defaultValue) !== "") {
      onChange({ target: { name, value: value || defaultValue } })
    }
  }, [defaultValue, value])

  const filteredOption = ({ data }, text) => {
    if (data[filterName].toLowerCase().includes(text.toLowerCase().trim())) {
      return true
    } else {
      return false
    }
  }

  const formattedOptionLabel = ({ city, name, country }) => (
    <div>
      <span
        className="p-0 m-0 city-select-conatiner-au-heading d-block "
        title={city}
      >
        {city}
      </span>
      <span
        className="p-0 m-0 d-block city-select-conatiner-au-paragraph"
        title={`${name} Airport, ${country}`}
      >{`${name} Airport, ${country}`}</span>
    </div>
  )

  const handleFilterOptions = (filterValue) => {
    // console.log("filterValue", filterValue)
    let filterName = "name"
    const trimmedValue = filterValue.trim()

    if (
      data.find((d) =>
        d.IATA.toLowerCase().includes(trimmedValue.toLowerCase())
      )
    ) {
      filterName = "IATA"
    } else if (
      data.find((d) =>
        d.city.toLowerCase().includes(trimmedValue.toLowerCase())
      )
    ) {
      filterName = "city"
    } else if (
      data.find((d) =>
        d.country.toLowerCase().includes(trimmedValue.toLowerCase())
      )
    ) {
      filterName = "country"
    }

    setFilterName(filterName)
    setInputValue(trimmedValue)

    if (trimmedValue.toLowerCase().startsWith("to")) {
      setShowSearchDestination(true)
    } else {
      setShowSearchDestination(false)
    }
  }


  const handleFocus = () => {
    if (name.toLowerCase().startsWith("to")) {
      setShowSearchDestination(true)
    } else {
      setShowSearchDestination(false)
    }
  }

  //test
  const handleSelectChange = (selectedOption) => {
    if (selectedOption) {
      onChange({ target: { name, value: selectedOption.IATA } })
    }
  }
  return (
    <div className="city-select-conatiner-au">
      <WindowedSelect
        placeholder={placeholder || "Select"}
        name={name}
        // options={
        //   inputValue
        //     ? data
        //     : showSearchDestination === true
        //     ? "Search Destination"
        //     : []
        // }
        options={inputValue ? data : []}
        noOptionsMessage={() =>
          showSearchDestination
            ? "Search to destination"
            : "Search from destination"
        }
        filterOption={filteredOption}
        formatOptionLabel={formattedOptionLabel}
        className="select-input"
        styles={{
          control: (base, state) => ({
            ...base,
            borderRadius: "8px",
            padding: "2px 4px",
            height: "65px",
            // fontSize: "14px",
            border: state.isFocused ? "1px solid #907ae2" : "",
            boxShadow: "unset",
            "&:hover": {
              border: "1px solid #907ae2",
              boxShadow: "unset"
            }
          }),
          menu: (base) => ({ ...base, zIndex: "999" }),
          option: (base) => ({
            ...base,
            backgroundColor: "unset",
            color: "#000000",
            "&:hover": {
              backgroundColor: "#EAEAEA"
            }
          }),
          indicatorSeparator: () => ({ display: "none" }),
          indicatorsContainer: (base) => ({
            ...base,
            pointerEvents: "none"
          })
        }}
        ref={ref}
        defaultValue={data.find((o) => o.value === defaultValue)}
        value={data.find((o) => o.value === value)}
        // onChange={({ IATA }) => onChange({ target: { name, value: IATA } })}
        onChange={handleSelectChange}
        onBlur={onBlur}
        onInputChange={handleFilterOptions}
        onFocus={handleFocus}
      />
    </div>
  )
})

const AuCitySelect = ({ register, name, value, ...rest }) => (
  <SelectWithRef name={name} value={value} {...register(name)} {...rest} />
)

export default AuCitySelect
