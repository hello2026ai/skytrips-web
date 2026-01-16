import { gql } from "@apollo/client"

export const CREATE_PAYMENT = gql`
  mutation ($createCardPaymentParams: CreateCardPaymentInput!) {
    createCardPayment(createCardPaymentParams: $createCardPaymentParams)
  }
`

export const VALIDATE_COUPON = gql`
  query ($code: String!) {
    validateCoupon(code: $code) {
      id
      type
      value
    }
  }
`
