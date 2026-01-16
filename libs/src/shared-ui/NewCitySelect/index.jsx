import React, { useEffect, forwardRef, useState } from "react"
import { TreeSelect } from "antd"
import "./styles.scss"
import { useDebounce } from "@/hooks/useDebounce"
import { axiosClient } from "@/utils"

const SelectWithRef = forwardRef((props, ref) => {
  const {
    placeholder,
    name,
    register,
    errors,
    onChange,
    onBlur,
    defaultValue,
    value
  } = props

  // Use defaultValue as initial input text if provided.
  const [inputValue, setInputValue] = useState(
    (defaultValue && typeof defaultValue === "object"
      ? defaultValue.label
      : defaultValue) || ""
  )
  const [treeData, setTreeData] = useState([])
  const [expandedKeys, setExpandedKeys] = useState([])
  const debouncedInput = useDebounce(inputValue, 100)

  // Toggle expand/collapse of a node.
  const toggleExpand = (key) => {
    setExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  // Fetch airports when the debounced input changes.
  useEffect(() => {
    if (debouncedInput.trim().length >= 1) {
      fetchAirports(debouncedInput)
    } else {
      setTreeData([]) // Clear options if input is less than 1 character.
    }
  }, [debouncedInput])

  // When treeData updates, force the first parent's key to be expanded.
  useEffect(() => {
    if (treeData.length > 0) {
      setExpandedKeys([treeData[0].key])
    } else {
      setExpandedKeys([])
    }
  }, [treeData])

  // Ensure the first parent's key is always present even if user collapses it.
  const handleExpand = (keys) => {
    if (treeData.length > 0 && !keys.includes(treeData[0].key)) {
      keys = [treeData[0].key, ...keys]
    }
    setExpandedKeys(keys)
  }

  // Fetch and format airports data.
  const fetchAirports = async (query) => {
    try {
      const response = await axiosClient.get(
        `flight-search/airports?symbol=${query}`
      )
      const formattedData = response.data.data.map((city, index) => ({
        title: (
          <span
            onClick={(e) => {
              e.stopPropagation()
              toggleExpand(city.region + index)
            }}
            style={{ cursor: "pointer" }}
          >
            {city.region}
          </span>
        ),
        text: `${city.municipality} ${city.country}`,
        value: city.region + index,
        key: city.region + index,
        selectable: false, // Parent nodes are not selectable.
        switcherIcon: null,
        children: (city.airports || []).map((airport) => ({
          title: (
            <>
              {name.includes("from") ? (
                <img
                  src="/assets/images/icons/AirplaneTakeoff.svg"
                  alt="Takeoff Icon"
                  style={{
                    width: "25px",
                    marginLeft: "4px",
                    marginRight: "4px"
                  }}
                />
              ) : (
                <img
                  src="/assets/images/icons/AirplaneLanding.svg"
                  alt="Landing Icon"
                  style={{ marginLeft: "5px", marginRight: "4px" }}
                />
              )}
              {`${airport.name} (${airport.iata_code})`}
            </>
          ),
          text: `${airport.name} (${airport.iata_code})`,
          value: airport.iata_code,
          key: airport.iata_code,
          selectable: true
        }))
      }))
      setTreeData(formattedData)
    } catch (error) {
      console.error("Error fetching airports:", error)
    }
  }

  // Update input value as the user types.
  const handleInputChange = (value) => {
    setInputValue(value)
  }

  // When a selection is made:
  // - If a non-selectable (parent) node is clicked, toggle its expansion.
  // - Otherwise, update the field using the full object.
  const handleSelectChange = (selectedValue, label, extra) => {
    if (extra.triggerNode && extra.triggerNode.props.selectable === false) {
      toggleExpand(extra.triggerNode.props.value)
      return
    }
    onChange({ target: { name, value: selectedValue } })
  }

  // Helper to search treeData for a child option matching a given value.
  const getOptionByValue = (val) => {
    let foundOption
    treeData.forEach((city) => {
      if (city.children) {
        city.children.forEach((child) => {
          if (child.value === val) {
            // Return full object with value and the descriptive text as label.
            foundOption = { value: child.value, label: child.text }
          }
        })
      }
    })
    return foundOption
  }

  // onBlur: if the current value is not a full object (with a label),
  // try to find the matching option and update the field.
  const handleBlur = () => {
    let newValue = value
    if (value) {
      if (typeof value === "object") {
        if (!value.label) {
          const option = getOptionByValue(value.value || value)
          if (option) {
            newValue = option
            onChange({ target: { name, value: option } })
          }
        }
      } else if (typeof value === "string") {
        const option = getOptionByValue(value)
        if (option) {
          newValue = option
          onChange({ target: { name, value: option } })
        }
      }
    }
  }

  // When treeData loads or changes, check the current/default value.
  // If it's a bare string or an object missing a label, update it to the full object.
  useEffect(() => {
    if (treeData.length > 0) {
      const current =
        value && typeof value === "object"
          ? value.value
          : typeof value === "string"
            ? value
            : typeof defaultValue === "object"
              ? defaultValue.value
              : defaultValue
      if (current) {
        const option = getOptionByValue(current)
        // If we find a match and the current value is not a full object, update.
        if (
          option &&
          (typeof value === "string" ||
            (typeof value === "object" && !value.label))
        ) {
          onChange({ target: { name, value: option } })
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeData])

  // If a default value exists (and is not empty), trigger onChange.
  useEffect(() => {
    if ((value || defaultValue) && (value || defaultValue) !== "") {
      onChange({ target: { name, value: value || defaultValue } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, value])

  return (
    <div className="city-select-container w-100">
      <TreeSelect
        showSearch
        placeholder={placeholder || "Type to search"}
        treeData={treeData}
        // Use labelInValue and treeNodeLabelProp so the selected value is an object.
        labelInValue
        treeNodeLabelProp="text"
        value={value}
        defaultValue={defaultValue}
        onSearch={handleInputChange}
        onChange={handleSelectChange}
        onBlur={handleBlur}
        treeExpandedKeys={expandedKeys}
        onTreeExpand={handleExpand}
        treeDefaultExpandAll
        filterTreeNode={(input, node) => {
          const normalizedInput = input.toLowerCase().replace(/\s+/g, "")
          const normalizedText = node.text.toLowerCase().replace(/\s+/g, "")
          return normalizedText.includes(normalizedInput)
        }}
        defaultExpandedKeys={treeData.length > 0 ? [treeData[0].key] : []}
        style={{
          width: "100%",
          color: "black",
          display: "flex",
          alignItems: "center",
          paddingRight: "12px",
          border: "unset",
          backgroundColor: "unset"
        }}
        ref={ref}
        dropdownStyle={{ zIndex: 9999 }}
        suffixIcon={null}
      />
    </div>
  )
})

const NewCitySelect = ({ register, name, value, ...rest }) => {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  if (!isMounted) return null // Prevent rendering until mounted.
  return (
    <SelectWithRef name={name} value={value} {...register(name)} {...rest} />
  )
}

export default NewCitySelect
