// import { fetchAndActivate, getValue } from "firebase/remote-config"
// import { remoteConfig } from "../firebaseConfig"

// const RATE_CACHE_KEY = "findRatesValue"
// const BANNER_CACHE_KEY = "homepageBanner"
// const SIMPLE_FLOW_CACHE_KEY = "simpleFlow"
// const SPEAK_NEPALI_CACHE_KEY = "speakNepali"
// const EXCLUSIVE_OFFER_CASH_KEY = "exclusiveOffer"

// const CACHE_EXPIRATION_KEY = "findRatesValueExpiration"
// const CACHE_DURATION = 3600 * 1000 // 1 hour in milliseconds

// //homepage banner helper

// const getCachedHomepageBanner = () => {
//   const homepageBanner = localStorage.getItem(BANNER_CACHE_KEY)
//   const expiration = localStorage.getItem(CACHE_EXPIRATION_KEY)

//   if (homepageBanner && expiration && Date.now() < parseInt(expiration, 10)) {
//     return JSON.parse(homepageBanner)
//   }
//   return null
// }

// const setCachedHomepageBanner = (homepageBanner) => {
//   localStorage.setItem(BANNER_CACHE_KEY, JSON.stringify(homepageBanner))
//   localStorage.setItem(CACHE_EXPIRATION_KEY, Date.now() + CACHE_DURATION)
// }

// export const fetchRemoteConfig = async () => {
//   if (typeof window !== "undefined") {
//     const cachedHomepageBanner = getCachedHomepageBanner()
//     if (cachedHomepageBanner) {
//       return cachedHomepageBanner
//     }
//     try {
//       await fetchAndActivate(remoteConfig)

//       const homepageValue = getValue(remoteConfig, "homepage_banner").asString()

//       if (!homepageValue) {
//         console.error("Homepage banner value not found in remote config")
//         return null
//       }

//       const parsedValue = JSON.parse(homepageValue)
//       setCachedHomepageBanner(parsedValue)
//       return parsedValue
//     } catch (error) {
//       console.error("Error fetching remote config:", error)
//       throw error
//     }
//   } else {
//     console.error("Remote Config can only be fetched in a browser environment.")
//     return { parsedValue: {} }
//   }
// }

// //simple flow helper

// const getCachedSimpleFlow = () => {
//   const simpleFlow = localStorage.getItem(SIMPLE_FLOW_CACHE_KEY)
//   const expiration = localStorage.getItem(CACHE_EXPIRATION_KEY)

//   if (simpleFlow && expiration && Date.now() < parseInt(expiration, 10)) {
//     return JSON.parse(simpleFlow)
//   }
//   return null
// }

// const setCachedSimpleFlow = (simpleFlow) => {
//   localStorage.setItem(SIMPLE_FLOW_CACHE_KEY, JSON.stringify(simpleFlow))
//   localStorage.setItem(CACHE_EXPIRATION_KEY, Date.now() + CACHE_DURATION)
// }

// export const fetchSimpleProcessConfig = async () => {
//   if (typeof window !== "undefined") {
//     const cachedSimpleFlow = getCachedSimpleFlow()
//     if (cachedSimpleFlow) {
//       return cachedSimpleFlow
//     }

//     try {
//       await fetchAndActivate(remoteConfig)

//       const simpleProcessValue = getValue(
//         remoteConfig,
//         "simple_process"
//       ).asString()

//       if (!simpleProcessValue) {
//         console.error("Simple process value not found in remote config")
//         return null
//       }

//       const parsedSimpleProcessValue = JSON.parse(simpleProcessValue)
//       setCachedSimpleFlow(parsedSimpleProcessValue)
//       return parsedSimpleProcessValue
//     } catch (error) {
//       console.error("Error fetching remote config:", error)
//       throw error
//     }
//   } else {
//     console.error("Remote Config can only be fetched in a browser environment.")
//     return { parsedSimpleProcessValue: {} }
//   }
// }

// //Flow exclusive offer helper

// const getCachedExclusiveOffer = () => {
//   const exclusiveOffer = localStorage.getItem(EXCLUSIVE_OFFER_CASH_KEY)
//   const expiration = localStorage.getItem(CACHE_EXPIRATION_KEY)

//   if (exclusiveOffer && expiration && Date.now() < parseInt(expiration, 10)) {
//     return JSON.parse(exclusiveOffer)
//   }
//   return null
// }

// const setCachedExclusiveOffer = (exclusiveOffer) => {
//   localStorage.setItem(EXCLUSIVE_OFFER_CASH_KEY, JSON.stringify(exclusiveOffer))
//   localStorage.setItem(CACHE_EXPIRATION_KEY, Date.now() + CACHE_DURATION)
// }

// export const fetchExclusiveOfferConfig = async () => {
//   if (typeof window !== "undefined") {
//     const cachedExclusiveOffer = getCachedExclusiveOffer()
//     if (cachedExclusiveOffer) {
//       return cachedExclusiveOffer
//     }
//     try {
//       await fetchAndActivate(remoteConfig)

//       const exclusiveOfferValue = getValue(
//         remoteConfig,
//         "exclusive_offer"
//       ).asString()

//       if (!exclusiveOfferValue) {
//         console.error("Exclusive offer value not found in remote config")
//         return null
//       }

//       const parsedExclusiveOfferValue = JSON.parse(exclusiveOfferValue)
//       setCachedExclusiveOffer(parsedExclusiveOfferValue)
//       return parsedExclusiveOfferValue
//     } catch (error) {
//       console.error("Error fetching remote config:", error)
//       throw error
//     }
//   } else {
//     console.error("Remote Config can only be fetched in a browser environment.")
//     return { parsedExclusiveOfferValue: {} }
//   }
// }

// //Flow Speak nepali
// const getCachedSpeakNepali = () => {
//   const speakNepali = localStorage.getItem(SPEAK_NEPALI_CACHE_KEY)
//   const expiration = localStorage.getItem(CACHE_EXPIRATION_KEY)

//   if (speakNepali && expiration && Date.now() < parseInt(expiration, 10)) {
//     return JSON.parse(speakNepali)
//   }
//   return null
// }

// const setCachedSpeakNepali = (speakNepali) => {
//   localStorage.setItem(SPEAK_NEPALI_CACHE_KEY, JSON.stringify(speakNepali))
//   localStorage.setItem(CACHE_EXPIRATION_KEY, Date.now() + CACHE_DURATION)
// }

// export const fetchSpeakNepaliConfig = async () => {
//   if (typeof window !== "undefined") {
//     const cachedSpeakNepali = getCachedSpeakNepali()
//     if (cachedSpeakNepali) {
//       return cachedSpeakNepali
//     }
//     try {
//       await fetchAndActivate(remoteConfig)

//       const speakNepaliValue = getValue(remoteConfig, "speak_nepali").asString()

//       if (!speakNepaliValue) {
//         console.error("Speak nepali value not found in remote config")
//         return null
//       }

//       const parsedSpeakNepaliValue = JSON.parse(speakNepaliValue)
//       setCachedSpeakNepali(parsedSpeakNepaliValue)
//       return parsedSpeakNepaliValue
//     } catch (error) {
//       console.error("Error fetching remote config:", error)
//       throw error
//     }
//   } else {
//     console.error("Remote Config can only be fetched in a browser environment.")
//     return { parsedSpeakNepaliValue: {} }
//   }
// }

// // without cache implementation code for reference

// // export const fetchRatesConfig = async () => {
// //   if (typeof window !== "undefined") {
// //     try {
// //       await fetchAndActivate(remoteConfig)

// //       const findRatesValue = getValue(remoteConfig, "find_rates").asString()

// //       if (!findRatesValue) {
// //         console.error("Find rates value not found in remote config")
// //         return null
// //       }

// //       const parsedFindRatesValue = JSON.parse(findRatesValue)
// //       return parsedFindRatesValue
// //     } catch (error) {
// //       console.error("Error fetching remote config:", error)
// //       throw error
// //     }
// //   } else {
// //     console.error("Remote Config can only be fetched in a browser environment.")
// //     return { parsedFindRatesValue: {} }
// //   }
// // }

// const getCachedFindRatesValue = () => {
//   const findRatesValue = localStorage.getItem(RATE_CACHE_KEY)
//   const expiration = localStorage.getItem(CACHE_EXPIRATION_KEY)

//   if (findRatesValue && expiration && Date.now() < parseInt(expiration, 10)) {
//     return JSON.parse(findRatesValue)
//   }
//   return null
// }

// const setCachedFindRatesValue = (findRatesValue) => {
//   localStorage.setItem(RATE_CACHE_KEY, JSON.stringify(findRatesValue))
//   localStorage.setItem(CACHE_EXPIRATION_KEY, Date.now() + CACHE_DURATION)
// }

// export const fetchRatesConfig = async () => {
//   if (typeof window !== "undefined") {
//     const cachedFindRatesValue = getCachedFindRatesValue()
//     if (cachedFindRatesValue) {
//       return cachedFindRatesValue
//     }

//     try {
//       await fetchAndActivate(remoteConfig)

//       const findRatesValue = getValue(remoteConfig, "find_rates").asString()

//       if (!findRatesValue) {
//         console.error("Find rates value not found in remote config")
//         return null
//       }

//       const parsedFindRatesValue = JSON.parse(findRatesValue)
//       setCachedFindRatesValue(parsedFindRatesValue)
//       return parsedFindRatesValue
//     } catch (error) {
//       console.error("Error fetching remote config:", error)
//       throw error
//     }
//   } else {
//     console.error("Remote Config can only be fetched in a browser environment.")
//     return { parsedFindRatesValue: {} }
//   }
// }
