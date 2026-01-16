//get the first departure and last arrival flight,
// will ignore in between transit

import { calculateTimeDifference } from "./timeDifference"

export const getFirstAndLastIataCodes = (segments) => {
  if (!segments || segments.length === 0) {
    throw new Error("Segments array is empty or undefined.")
  }

  const firstDeparture = segments[0].departure.iataCode
  const lastArrival = segments[segments.length - 1].arrival.iataCode

  return { firstDeparture, lastArrival }
}

export const getHoursAndMinFromDuration = (duration) => {
  if (!duration) return null
  const hoursMatch = duration.match(/(\d+)H/)
  const minutesMatch = duration.match(/(\d+)M/)

  const hours = hoursMatch ? hoursMatch[1] : 0
  const minutes = minutesMatch ? minutesMatch[1] : 0

  return `${hours}h ${minutes}m`
}

export const getHoursFromDuration = (duration) => {
  if (!duration) return null
  const hoursMatch = duration.match(/(\d+)H/)

  const hours = hoursMatch ? hoursMatch[1] : 0

  return `${hours} hours`
}

export const extractFlightInfo = (segments) => {
  if (segments.length < 1) return null

  const firstDeparture = {
    departure: segments[0].departure,
    duration: segments[0].duration,
    carrierCode: segments[0].carrierCode,
    number: segments[0].carrierCode + segments[0].number,
    airCraftCode: segments[0]?.aircraft?.code,
    operatedBy:
      segments[0].carrierCode === segments[0].operating?.carrierCode
        ? ""
        : segments[0].operating?.carrierCode
  }

  const lastArrival = {
    arrival: segments[segments.length - 1].arrival,
    duration: segments[segments.length - 1].duration,
    carrierCode: segments[segments.length - 1].carrierCode,
    operatedBy:
      segments[segments.length - 1].carrierCode ===
      segments[segments.length - 1].operating?.carrierCode
        ? ""
        : segments[segments.length - 1].operating?.carrierCode
  }

  const transits = segments.slice(0, -1).map((segment, index) => {
    const nextSegment = segments[index + 1]
    const layoverTime = calculateTimeDifference(
      segment.arrival.at,
      nextSegment.departure.at
    )

    return {
      arrival: segment.arrival,
      duration: nextSegment.duration,
      carrierCode: nextSegment.carrierCode,
      number: nextSegment.carrierCode + nextSegment.number,
      airCraftCode: nextSegment?.aircraft?.code,
      layoverTime,
      operatedBy:
        nextSegment.carrierCode === nextSegment.operating?.carrierCode
          ? ""
          : nextSegment.operating?.carrierCode
    }
  })
  return {
    firstDeparture,
    lastArrival,
    transits
  }
}

export const getAirCraftDetails = (dictionaries, code) => {
  return dictionaries.aircraft[code]
}
