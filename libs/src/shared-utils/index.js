import { menu } from "./constants/menu"
import { client } from "./graphqlConfig"
import axiosClient from "./axiosConfig"
import { airports } from "./constants/airports"
import { genderTitleOptions } from "./constants/options"
import { countries } from "./constants/countries"
import { countryCodes } from "./constants/countryCodes"
import {
  getItemFromIatacode,
  getAirlineFromIatacode,
  getCountryName,
  getCountryCode
} from "./helpers/dataFromIata"
import {
  calculateTimeDifference,
  formattedTime
} from "./helpers/timeDifference"

import { getLocalStorage, setLocalStorage, removeLocalStorage } from "./paymentStorage";


export {
  menu,
  client,
  axiosClient,
  airports,
  getItemFromIatacode,
  calculateTimeDifference,
  getAirlineFromIatacode,
  formattedTime,
  genderTitleOptions,
  countries,
  countryCodes,
  getCountryName,
  getCountryCode,
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage
}
