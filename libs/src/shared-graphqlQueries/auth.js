import { gql } from "@apollo/client"

export const REGISTER = gql`
  mutation ($registerParams: RegisterInput!) {
    register(registerParams: $registerParams) {
      id
      email
      phone
      country
    }
  }
`

// export const REGISTER = gql`
//   mutation ($email: String, $phone: String, $country: String) {
//     register(
//       registerParams: { email: $email, phone: $phone, country: $country }
//     ) {
//       id
//       email
//       phone
//       country
//     }
//   }
// `

export const VERIFY = gql`
  mutation ($verifyParams: VerifyInput!) {
    verify(verifyParams: $verifyParams)
  }
`

export const SET_PROFILE = gql`
  mutation ($setProfileParams: SetProfileInput!) {
    setProfile(setProfileParams: $setProfileParams)
  }
`
export const OAUTH_LOGIN = gql`
  query {
    OauthLogin {
      accessToken
      refreshToken
    }
  }
`

export const ME = gql`
  query {
    me {
      id
      email
      phone
      address
      country
      gender
      firstName
      middleName
      lastName
      dateOfBirth
      profileImage
    }
  }
`
export const LOGIN = gql`
  query ($loginParams: LoginInput!) {
    login(loginParams: $loginParams) {
      accessToken
      refreshToken
      user {
        id
        email
        phone
      }
    }
  }
`

export const FORGOT_PASSWORD = gql`
  mutation ($email: String, $phone: String) {
    forgotPassword(email: $email, phone: $phone)
  }
`

export const RESET_PASSWORD = gql`
  mutation ($resetPasswordParams: ResetPasswordInput!) {
    resetPassword(resetPasswordParams: $resetPasswordParams)
  }
`
