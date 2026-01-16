import { STORAGE_KEYS, getValueOf } from "../../shared-service/storage"
import axios from "axios"

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REST_API,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    authorization: getValueOf(STORAGE_KEYS.ACCESS_TOKEN)!==undefined
      ? `Bearer ${getValueOf(STORAGE_KEYS.ACCESS_TOKEN)}`
      : "",

  }

}

)

export default axiosClient
