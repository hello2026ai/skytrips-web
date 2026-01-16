import { countryCodes } from "../constants/countryCodes"
import { countries } from "../constants/countries"
import { airlinecodes, airportcodes } from "../constants/airline"
import { airports } from "../constants/airports"

export const getItemFromIatacode = (iataCode) => {
  const data = airportcodes?.filter((item) => item.IATA === iataCode)

  return data[0]
}

export const getAirlineFromIatacode = (iataCode) => {
  const data = airlinecodes?.filter((item) => item.iata === iataCode)

  return data[0]
}

export const getCountryName = (code) => {
  const data = countries?.filter(
    (item) => item.value?.toLowerCase() === code.toLowerCase()
  )

  return data[0]
}

export const getCountryCode = (code) => {
  const data = countryCodes?.filter(
    (item) => item.code.toLowerCase() === code.toLowerCase()
  )

  return data[0]
}

export const getAiportData = (code) => {
  const dat = airports
}
