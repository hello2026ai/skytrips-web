import { gql } from "@apollo/client"

export const STORE_TRIP_INQUIRY = gql`
  mutation (
    $fullName: String!
    $email: String!
    $phoneCountryCode: String!
    $phone: String!
    $timeZone: String!
    $isTermsAccepted: Boolean!
    $comment: String!
    $preferedTime: String!
    $tripName: String!
  ) {
    storeTripInquiry(
      tripInquiryInput: {
        fullName: $fullName
        email: $email
        phoneCountryCode: $phoneCountryCode
        phone: $phone
        timeZone: $timeZone
        isTermsAccepted: $isTermsAccepted
        comment: $comment
        preferedTime: $preferedTime
        tripName: $tripName
      }
    )
  }
`
