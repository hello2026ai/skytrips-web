import { gql } from "@apollo/client"

export const STORE_FLIGHT_SEARCH_HISTORY = gql`
  mutation (
    $locations: [FlightSearchHistoryLocationInput!]!
    $travelClass: TravelClass!
    $travelerCount: Float!
    $tripType: FlightTripType!
    $travelers: FlightSearchHistoryTravelerInput
    $timeZone: String
  ) {
    storeFlightSearchHistory(
      searchHistoryInput: {
        locations: $locations
        travelClass: $travelClass
        travelerCount: $travelerCount
        tripType: $tripType
        travelers: $travelers
        timeZone: $timeZone
      }
    )
  }
`
