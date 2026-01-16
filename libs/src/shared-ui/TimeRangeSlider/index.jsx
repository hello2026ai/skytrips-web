import React, { useEffect, useState } from "react"

function TimeRangeSlider({
  rangeValue,
  min,
  max,
  className,
  handleMaxTravelDuration,
  setRangeValue
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
    handleMaxTravelDuration(e.target.value)
  }

  return (
    <div className={`time-slider-container ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        value={rangeValue}
        onInput={handleInput}
        onMouseUp={handleChange} //desktop
        onTouchEnd={handleChange} //mobile
        className="time-slider"
        style={{ background }}
      />
      <div className="time-max-price">
        <p className="mt-4 ">
          {" "}
          {parseInt(rangeValue).toLocaleString()}
          {" hours"}
        </p>
      </div>
    </div>
  )
}

export default TimeRangeSlider
