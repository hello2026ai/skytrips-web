import { gql } from "@apollo/client"

export const GET_CUSTOMERS = gql`
  query ($limit: Int!, $page: Int!) {
    getCustomers(paginationInput: { limit: $limit, page: $page }) {
      data {
        email
        country
        createdAt
        dateOfBirth
        firstName
        lastName
        middleName
        id
        updatedAt
        gender
        phone
      }
      meta {
        limit
        page
        total
      }
    }
  }
`
