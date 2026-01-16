import { gql } from "@apollo/client"

export const GET_COUPONS = gql`
  query ($limit: Int!, $page: Int) {
    getCoupons(paginationInput: { limit: $limit, page: $page }) {
      data {
        id
        createdAt
        expiryDate
        code
        startDate
        updatedAt
        value
      }
      meta {
        limit
        page
        total
      }
    }
  }
`
export const DELETE_COUPONS = gql`
  mutation ($id: String!) {
    deleteCoupon(id: $id)
  }
`

export const CREATE_COUPONS = gql`
  mutation (
    $code: String!
    $expiryDate: String!
    $startDate: String!
    $value: String!
  ) {
    createCoupon(
      createCouponInput: {
        code: $code
        expiryDate: $expiryDate
        startDate: $startDate
        value: $value
      }
    ) {
      id
      code
      createdAt
      expiryDate
      referral
      startDate
      updatedAt
      value
    }
  }
`
export const UPDATE_COUPON = gql`
  mutation (
    $id: String!
    $code: String!
    $expiryDate: String!
    $startDate: String!
    $value: String!
  ) {
    updateCoupon(
      id: $id
      updateCouponInput: {
        code: $code
        expiryDate: $expiryDate
        startDate: $startDate
        value: $value
      }
    ) {
      id
      code
      createdAt
      expiryDate
      referral
      startDate
      updatedAt
      value
    }
  }
`

export const GET_COUPON = gql`
  query ($id: String!) {
    getCoupon(id: $id) {
      id
      code
      createdAt
      expiryDate
      referral
      startDate
      type
      updatedAt
      value
    }
  }
`
