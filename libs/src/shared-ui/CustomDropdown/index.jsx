import React, { useState, useEffect, useRef } from "react"
import "./styles.scss"
import Image from "next/image"

const CustomDropdown = ({
  options,
  selectedOption,
  setSelectedOption,
  extraClassName
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const dropdownRef = useRef(null)

  const handleSelectOption = (option) => {
    setSelectedOption(option)
    setIsOpen(false)
    setSearchInput("")
  }

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const filteredOptions = Object.entries(options).filter(
    ([code, details]) =>
      details.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      details.phone.includes(searchInput.toLowerCase())
  )

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div
        className={`${
          extraClassName !== "contact-input"
            ? "custom-dropdown__selected"
            : "custom-dropdown__selected-contact"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? (
          <div className="custom-dropdown__option">
            <Image
              src={selectedOption.image}
              alt={`${selectedOption.name} flag`}
              width={20}
              height={15}
            />
            <span>{selectedOption.phone.join(", ")}</span>
          </div>
        ) : (
          <div
            className={
              extraClassName !== "contact-input"
                ? "custom-dropdown__option"
                : "custom-dropdown__option-contact"
            }
          >
            <Image
              src="https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/AU.svg"
              alt="nepal flag"
              width={20}
              height={15}
            />
            <span>+61</span>
          </div>
        )}
        <Image
          src="/assets/images/dropIcon.svg"
          className="drop-icon ml-0 pr-2"
          width={20}
          height={15}
        />
      </div>
      {isOpen && (
        <div className="custom-dropdown__options">
          <div className="custom-dropdown__filter_search">
            <Image
              src="/assets/images/searchIcon.svg"
              alt="search_icon"
              width={20}
              height={20}
            />
            <input
              type="text"
              className="custom-dropdown__search"
              placeholder="Country Name or Code"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          {filteredOptions.map(([code, details]) => (
            <div
              key={code}
              className="custom-dropdown__option"
              onClick={() => handleSelectOption(details)}
            >
              <ul>
                <li>
                  <Image
                    src={details.image}
                    alt={`${details.name} flag`}
                    width={20}
                    height={20}
                  />
                  <span className="country-code">
                    {details.phone.join(", ")} {details.name} ({code})
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomDropdown
