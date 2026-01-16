import { gql } from "@apollo/client"

export const CONTACT_US = gql`
  mutation(
    $firstName: String
    $lastName: String
    $email: String!
    $message: String!
    $countryCode: String
    $phone: String
  ) {
    storeContactUs(
      contactUsInput: {
        email: $email
        firstName: $firstName
        lastName: $lastName
        message: $message
        countryCode: $countryCode
        phone: $phone
      }
    ) {
      id
    }
  }
`
