import { gql } from "@apollo/client"

export const GET_AIRLINES = gql`
  query ($limit: Int!, $page: Int!, $keyword: String) {
    getAirlinesForFilter(
      paginationInput: { limit: $limit, page: $page }
      searchInput: { keyword: $keyword }
    ) {
      data {
        airlineCode
        airlineName
        createdAt
        position
        id
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

export const CREATE_AIRLINE_FILTER = gql`
  mutation ($airlineCode: String!, $airlineName: String!, $position: Int!) {
    createAirlineForFilter(
      createAirlineForFilterInput: {
        airlineCode: $airlineCode
        airlineName: $airlineName
        position: $position
      }
    ) {
      id
      airlineCode
      airlineName
      position
      createdAt

      updatedAt
    }
  }
`

export const DELETE_AIRLINE = gql`
  mutation ($id: String!) {
    deleteAirlineForFilter(id: $id)
  }
`

export const UPDATE_AIRLINE = gql`
  mutation (
    $id: String!
    $airlineCode: String!
    $airlineName: String!
    $position: Int!
  ) {
    updateAirlineForFilter(
      id: $id
      updateAirlineForFilterInput: {
        airlineCode: $airlineCode
        airlineName: $airlineName
        position: $position
      }
    )
  }
`

export const GET_AIRLINE_FOR_FILTER = gql`
  query ($id: String!) {
    getAirlineForFilter(id: $id) {
      airlineCode
      airlineName
      createdAt
      id
      position
      updatedAt
    }
  }
`
