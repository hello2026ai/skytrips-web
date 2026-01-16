import { gql } from "@apollo/client"

export const STORE_FLIGHT_SEARCH_QUERY = gql`
  mutation (
    $locations: [FlightSearchQueryDateLocationInput!]!
    $travelClass: TravelClass!
    $travelerCount: Float!
    $tripType: FlightTripType!
    $preferedTime: String!
    $phone: String!
    $phoneCountryCode: String!
    $travelerDetail: FlightSearchQueryPassengerInput!
    $timeZone: String!
  ) {
    storeFlightSearchQuery(
      searchQueryInput: {
        locations: $locations
        travelClass: $travelClass
        travelerCount: $travelerCount
        tripType: $tripType
        preferedTime: $preferedTime
        phone: $phone
        phoneCountryCode: $phoneCountryCode
        travelerDetail: $travelerDetail
        timeZone: $timeZone
      }
    )
  }
`
