import { STORAGE_KEYS, getValueOf, removeValueOf } from "../../shared-service/storage"
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  createHttpLink
} from "@apollo/client"

import { onError } from "@apollo/client/link/error"

import { createUploadLink } from "apollo-upload-client"

const appUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL

const httpLink = createHttpLink({
  uri: appUrl,
  "content-type": "application/json"
})
const uploadLink = createUploadLink({
  uri: appUrl,
  "content-type": "multipart/form-data"
})

const authLink = new ApolloLink((operation, forward) => {
  // Get the user's unique ID
  const userUniqueId = getValueOf(STORAGE_KEYS.CLIENT_UNIQUE_ID)
  // Define your custom header parameters
  const customHeaders = {
    "content-type": "application/json",
    "Apollo-Require-Preflight": "true",
    authorization:
      typeof window !== "undefined" && getValueOf(STORAGE_KEYS.ACCESS_TOKEN)
        ? `Bearer ${getValueOf(STORAGE_KEYS.ACCESS_TOKEN)}`
        : "",
    devicetype: "web"
  }

  // If userUniqueId is available, add the custom header parameter
  if (userUniqueId) {
    customHeaders["ama-client-ref"] = userUniqueId
  }

  operation.setContext(({ headers }) => ({
    headers: {
      ...headers,
      ...customHeaders
    }
  }))

  return forward(operation)
})

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (err.message === "Unauthorized") {
          removeValueOf(STORAGE_KEYS.ACCESS_TOKEN)
          removeValueOf(STORAGE_KEYS.REFRESH_TOKEN)
          removeValueOf(STORAGE_KEYS.USER_DETAIL)
        }
      }
    }
  }
)

// Create an instance of ApolloClient
export const client = new ApolloClient({
  link: ApolloLink.from([
    errorLink,
    authLink,
    //  httpLink,
    uploadLink
  ]),
  cache: new InMemoryCache()
})
