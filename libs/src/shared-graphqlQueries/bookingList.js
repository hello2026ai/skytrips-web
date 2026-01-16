import { gql } from "@apollo/client"

export const GET_FLIGHT_BOOKINGS = gql`
  query ($limit: Int!, $page: Int!, $couponCode: String) {
    getFlightBookings(
      paginationInput: { limit: $limit, page: $page }
      flightBookingFilterInput: { couponCode: $couponCode }
    ) {
      data {
        id
        bookingId
        passengerNameRecord
        user {
          email
        }
        arrivalDate
        bookedDate
        departureDate
        createdAt

        status
        couponApplied {
          code
        }
      }
      meta {
        total
      }
    }
  }
`
export const UPDATE_BOOKING_STATUS = gql`
  mutation ($id: String!, $status: FlightBookingStatus!) {
    updateFlightBookingStatus(id: $id, status: $status) {
      status
      id
    }
  }
`
