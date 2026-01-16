import { gql } from "@apollo/client"

export const GET_FLIGHT_CANCELLATION = gql`
  query ($limit: Int!, $page: Int!) {
    getFlightCancellations(paginationInput: { limit: $limit, page: $page }) {
      data {
        id
        email
        bookingId
        passengerNameRecord
        paymentId
        status
        type
        createdAt
        updatedAt
      }
      meta {
        total
      }
    }
  }
`
