import Cookies from "universal-cookie"

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "__a_t__",
  CLIENT_UNIQUE_ID: "__client_u_id__",
  REFRESH_TOKEN: "__r_t__",
  USER_DETAIL: "__u_d__",
  REGISTER_EMAIL: "__r_e__",
  REGISTER_PHONE: "__r_p__",
  REGISTER_OTP: "__r_o__",
  FORGOT_PASSWORD_EMAIL: "__f_p_e__",
  FORGOT_PASSWORD_PHONE: "__f_p_p__"
}

const cookies = new Cookies()

/**
 * Uses Cookies.
 *
 * @param {String} key : whose Value to set.
 * @param {*} value : Value to set.
 */
export const setValueOf = (key, value, maxAge, cookieDomain) => {
  // console.log("key", key)

  cookies.set(key, value, {
    path: "/",
    maxAge: maxAge ? maxAge : 60 * 60 // 1 hrs
    // domain: cookieDomain ? cookieDomain : window.location.host,
  })
}

/**
 * Uses Cookies.
 *
 * @param {String} key : whose value to get.
 */
export const getValueOf = (key) => {
  return cookies.get(key)
}

/**
 * Uses Cookies.
 *
 * @param {String} key : whose value to remove.
 */
export const removeValueOf = (key, cookieDomain) => {
  return cookies.remove(key)
  //     path: "/"
  //     // domain: cookieDomain ? cookieDomain : window.location.hostname
  //   })
}
