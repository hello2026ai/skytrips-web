import React, { useEffect, useState, forwardRef } from "react"

import WindowedSelect from "react-windowed-select"

import "./styles.scss"

const SelectWithRef = forwardRef((props, ref) => {
  const {
    placeholder,
    name,
    data,
    register,
    errors,
    onChange,
    onBlur,
    defaultValue
  } = props

  useEffect(() => {
    if (defaultValue && defaultValue !== "") {
      onChange({ target: { name, value: defaultValue } })
    }
  }, [defaultValue])

  return (
    <div className="class-select-conatiner-au">
      <WindowedSelect
        placeholder={placeholder || "Select Class"}
        name={name}
        options={data}
        className="select-input"
        styles={{
          control: (base, state) => ({
            ...base,
            backgroundColor: "#EAEAEA",
            borderRadius: "8px !important",
            padding: "2px 4px",
            fontSize: "14px",
            border: "none",
            boxShadow: "unset"
          }),
          menu: (base) => ({ ...base, zIndex: "9991" }),
          option: (base) => ({
            ...base,
            backgroundColor: "unset",
            fontSize: "14px",
            color: "#000000",
            "&:hover": {
              backgroundColor: "#907ae2"
            }
          }),
          indicatorSeparator: () => ({ display: "none" })
        }}
        ref={ref}
        defaultValue={data.find((o) => o.value === defaultValue)}
        onChange={({ value }) => onChange({ target: { name, value } })}
        onBlur={onBlur}
      />
    </div>
  )
})

const AuClassSelect = ({ register, name, ...rest }) => (
  <SelectWithRef name={name} {...register(name)} {...rest} />
)

export default AuClassSelect
