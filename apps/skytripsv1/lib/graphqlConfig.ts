import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  createHttpLink
} from "@apollo/client"

import { onError } from "@apollo/client/link/error"
import { createUploadLink } from "apollo-upload-client"

let appUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL

const httpLink = createHttpLink({
  uri: appUrl,
  headers: {
    "content-type": "application/json"
  }
})
const uploadLink = createUploadLink({
  uri: appUrl,
  headers: {
    "content-type": "multipart/form-data"
  }
})

const authLink = new ApolloLink((operation, forward) => {
  // Get the user's unique ID
  const userUniqueId = sessionStorage.getItem('skytrips_client_ref')
  // Define your custom header parameters
  const customHeaders: any = {
    "content-type": "application/json",
    "Apollo-Require-Preflight": "true",
    // authorization:
    //   typeof window !== "undefined" && getValueOf(STORAGE_KEYS.ACCESS_TOKEN)
    //     ? `Bearer ${getValueOf(STORAGE_KEYS.ACCESS_TOKEN)}`
    //     : "",
    devicetype: "web",
  }

  // If userUniqueId is available, add the custom header parameter
  if (userUniqueId) {
    customHeaders["ama-client-ref"] = userUniqueId
  }

  operation.setContext(({ headers }: { headers: any }) => ({
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
          // Perform storage clear
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
    httpLink,
    // uploadLink
  ]),
  cache: new InMemoryCache()
})
