import { gql } from "@apollo/client"

export const GET_USER_BOOKINGS = gql`
  query ($status: FlightBookingStatus, $paginationInput: PaginationInput) {
    getUserBookings(
      filter: { status: $status }
      paginationInput: $paginationInput
    ) {
      data {
        id
        bookingId

        passengerNameRecord
        arrivalDate
        departureDate

        bookedDate
        status
        couponApplied {
          value
        }
        user {
          email
          firstName
          middleName
          lastName
        }
      }
      meta {
        limit
        page
        total
      }
    }
  }
`
export const FLIGHT_CANCELLATION = gql`
  mutation ($flightCancellationInput: FlightCancellationInput!) {
    flightCancellation(flightCancellationInput: $flightCancellationInput)
  }
`

export const UPDATE_PROFILE = gql`
  mutation ($updateProfileInput: UpdateProfileInput!, $file: Upload) {
    updateProfile(updateProfileInput: $updateProfileInput, file: $file) {
      firstName
      middleName
      lastName
      email
      gender
      phone
      dateOfBirth
      country
      address
      profileImage
    }
  }
`

export const UPDATE_PASSWORD = gql`
  mutation ($updatePasswordInput: UpdatePasswordInput!) {
    updatePassword(updatePasswordInput: $updatePasswordInput)
  }
`
export const ME = gql`
  query {
    me {
      firstName
      middleName
      lastName
      email
      gender
      phone
      dateOfBirth
      country
      address
      profileImage
    }
  }
`
