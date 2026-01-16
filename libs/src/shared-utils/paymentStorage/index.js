// get a value from local storage
export const getLocalStorage = (key) => {
  try {
    const itemStr = localStorage.getItem(key)
    // Check if item exists in storage
    if (!itemStr) return null
    const item = JSON.parse(itemStr)
    const now = new Date()
    // Check if the item has expired
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key)
      return null
    }
    return item.value
  } catch (error) {
    console.log("error", error)
  }
}

// Function to set a value in local storage with expiry time
export const setLocalStorage = (key, value, expiryDuration) => {
  try {
    const now = new Date()
    const expiry = now.getTime() + expiryDuration * 60 * 1000
    const item = {
      value: value,
      expiry: expiry
    }
    localStorage.setItem(key, JSON.stringify(item))
  } catch (error) {
    console.log("error", error)
  }
}

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.log("error", error)
  }
}
