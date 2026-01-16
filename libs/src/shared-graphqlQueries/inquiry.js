import { gql } from "@apollo/client"

export const CREATE_INQUIRY = gql`
  query (
    $firstName: String!
    $lastName: String!
    $isDateFlexible: Boolean
    $email: String!
    $phone: String!
    $originLocation: String!
    $destinationLocation: String!
    $returnDate: String
    $departureDate: String!
    $adults: Float!
    $children: Float
    $infants: Float
    $tripType: FlightTripType!
  ) {
    createFlightInquiry(
      flightInquiryInput: {
        firstName: $firstName
        lastName: $lastName
        isDateFlexible: $isDateFlexible
        email: $email
        phone: $phone
        originLocation: $originLocation
        destinationLocation: $destinationLocation
        departureDate: $departureDate
        returnDate: $returnDate
        tripType: $tripType
        passengers: { adults: $adults, children: $children, infants: $infants }
      }
    )
  }
`
