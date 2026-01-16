import React, { useEffect, useState } from "react"

function RangeSlider({
  rangeValue,
  setRangeValue,
  min,
  max,
  className,
  handleMaxPriceSlider
}) {
  const [background, setBackground] = useState(
    `linear-gradient(to right, #0c0073 ${
      ((rangeValue - min) / (max - min)) * 100
    }%, #e0e0e0 ${((rangeValue - min) / (max - min)) * 100}%)`
  )

  useEffect(() => {
    const percent = ((rangeValue - min) / (max - min)) * 100
    setBackground(
      `linear-gradient(to right, #0c0073 ${percent}%, #e0e0e0 ${percent}%)`
    )
  }, [rangeValue, min, max])

  // Function to update the slider background dynamically
  const handleInput = (e) => {
    const newValue = e.target.value
    setRangeValue(newValue)

    const percent =
      ((newValue - e.target.min) / (e.target.max - e.target.min)) * 100
    console.log({ percent })
    setBackground(
      `linear-gradient(to right, #0c0073 ${percent}%, #e0e0e0 ${percent}%)`
    )

    // e.target.style.background = `linear-gradient(to right, #0c0073 ${percent}%, #e0e0e0 ${percent}%)`
  }

  const handleChange = (e) => {
    handleMaxPriceSlider(e.target.value)
  }

  return (
    <div className={`slider-container ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        value={rangeValue}
        onInput={handleInput}
        onMouseUp={handleChange} //desktop
        onTouchEnd={handleChange} //mobile
        className="slider"
        style={{ background }}
      />
      <div className="max-price">${parseInt(rangeValue).toLocaleString()}</div>
    </div>
  )
}

export default RangeSlider
