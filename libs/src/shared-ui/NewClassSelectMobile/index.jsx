import React, { forwardRef } from "react"
import { Controller } from "react-hook-form"
import WindowedSelect, { components } from "react-windowed-select"
import "./styles.scss"
import Image from "next/image"

const SelectWithRef = forwardRef((props, ref) => {
  const {
    placeholder,
    name,
    data,
    register,
    errors,
    onBlur,
    defaultValue,
    control
  } = props

  const customDropdownIndicator = (props) => (
    <components.DropdownIndicator {...props}>
      <Image
        src="/assets/images/icons/mobDropdown.svg"
        alt="dropdown icon"
        width={20}
        height={20}
      />
    </components.DropdownIndicator>
  )

  return (
    <div className="class-select-container-mobile">
      <Controller
        name={name}
        control={control}
        render={({
          field: { onChange: fieldOnChange, onBlur, value, ref }
        }) => (
          <WindowedSelect
            placeholder={"Economy "}
            options={data}
            className="select-input"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "",
                // borderRadius: "8px !important",
                padding: "2px 4px",
                fontSize: "14px",
                fontWeight: "400",
                fontFamily: "Inter",
                border: "none",
                boxShadow: "unset",
                overflow: "hidden"
              }),
              menu: (base) => ({ ...base, zIndex: "9991" }),
              option: (base) => ({
                ...base,
                backgroundColor: "unset",
                color: "#000000",
                "&:hover": {
                  backgroundColor: "#907ae2"
                }
              }),
              indicatorSeparator: () => ({ display: "none" })
            }}
            components={{ DropdownIndicator: customDropdownIndicator }}
            ref={ref}
            value={data.find((o) => o.value === value)}
            onChange={(selected) => {
              fieldOnChange(selected.value)
            }}
            onBlur={onBlur}
          />
        )}
      />
    </div>
  )
})

export default SelectWithRef
