import { gql } from "@apollo/client"

export const GET_FLIGHT_PAYMENTS = gql`
  query ($limit: Int!, $page: Int!, $airlineName: String) {
    getFlightPayments(
      filterInput: { airlineName: $airlineName }
      paginationInput: { limit: $limit, page: $page }
    ) {
      data {
        id
        paymentId
        bookingId
        currencyCode
        paymentPrice
        paymentDate
        paymentStatus
        updatedAt
        createdAt
        airline
      }
      meta {
        total
        limit
        page
      }
    }
  }
`

export const GET_FLIGHT_PAYMENT = gql`
  query ($id: String!) {
    getFlightPayment(id: $id) {
      id
      paymentId
      bookingId
      currencyCode
      paymentPrice
      paymentDate
      paymentStatus
      updatedAt
      createdAt
      airline
    }
  }
`
