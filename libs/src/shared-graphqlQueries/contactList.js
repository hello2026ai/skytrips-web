import { gql } from "@apollo/client"

export const GET_CONTACTS = gql`
  query ($limit: Int, $page: Int!) {
    getContactUsQueries(paginationInput: { limit: $limit, page: $page }) {
      data {
        id
        message
        countryCode
        email
        phone
        firstName
        lastName
        createdAt
        updatedAt
      }
      meta {
        limit
        page
        total
      }
    }
  }
`

export const GET_CONTACT = gql`
  query ($id: String!) {
    getContactUsQuery(id: $id) {
      id
      message
      countryCode
      email
      phone
      firstName
      lastName
      createdAt
      updatedAt
    }
  }
`
