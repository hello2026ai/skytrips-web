import moment from "moment"
import "moment-duration-format"

// export const calculateTimeDifference = (startTime, endTime) => {
//   const format = "YYYY-MM-DDTHH:mm:ss"
//   const start = moment(startTime, format)
//   const end = moment(endTime, format)
//   const duration = moment.duration(end.diff(start))
//   const formattedDuration = duration.format("HH:mm:ss")

//   return formattedDuration
// }

export const calculateTimeDifference = (startDateTime, endDateTime) => {
  // const startTime = new Date(startDateTime)
  // const endTime = new Date(endDateTime)

  // // Calculate the time difference in milliseconds
  // const timeDiff = Math.abs(endTime - startTime)

  // // Convert milliseconds to days, hours, minutes, and seconds
  // const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  // const hours = Math.floor(
  //   (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  // )
  // const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
  // const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
  // console.log("minutes", minutes)

  const timeDifference = moment.duration(
    moment(endDateTime).diff(moment(startDateTime))
  )

  const days = timeDifference.days()
  const hours = timeDifference.hours()
  const minutes = timeDifference.minutes()

  // Return the formatted time difference
  return `${days ? days + "d" : ""} ${hours ? hours + "h" : ""} ${
    minutes ? minutes + "m" : ""
  }`
}

export const formattedTime = (times) => {
  const time = moment(times, "HH:mm:ss")
  const hours = time.hours()
  const minutes = time.minutes()

  const formattedTime = `${hours}h ${minutes}min`

  return formattedTime
}

// Usage
// const startTime = "2023-05-21T13:30:00"
// const endTime = "2023-05-22T07:10:00"
// const difference = calculateTimeDifference(startTime, endTime)
// console.log(difference) // Output: 17:40:00
