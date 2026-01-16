// import React, { useEffect, useState } from "react"
// import { useRouter } from "next/router"
// import lzutf8 from "lzutf8"

// import {
//   calculateTimeDifference,
//   formattedTime,
//   getAirlineFromIatacode,
//   getItemFromIatacode
// } from "@utils"
// import moment from "moment"

// import "./styles.scss"
// import Modal from "../Modal"

// const ModalTickets = (props) => {
//   const { data, flightFilter } = props

//   const router = useRouter()
//   const { searchParams } = router.query
//   const [params, setParams] = useState({})

//   useEffect(() => {
//     // Check if searchParams exist and parse the JSON string
//     if (searchParams) {
//       const parsedSearchParams = JSON.parse(
//         lzutf8.decompress(searchParams, { inputEncoding: "Base64" })
//       )
//       setParams(parsedSearchParams)
//     }
//   }, [searchParams])

//   return (
//     <div className="card border ticket-container">
//       {/* Card header */}
//       <div className="card-header">
//         <div className="d-sm-flex justify-content-sm-end align-items-center w-100">
//           <h6 className="fw-normal mb-0 text-capitalize">
//             <span className="text-body">Travel Class:</span>{" "}
//             {params?.travelClass?.toLowerCase().replace("_", " ")}
//           </h6>
//         </div>
//       </div>
//       {/* Card body START */}
//       <div className="card-body px-4 pt-0">
//         {/* Ticket item START */}
//         {data?.map((segments, i) => (
//           <>
//             {segments?.segments?.map((segment, index) => (
//               <>
//                 <div className="row g-4 mb-3">
//                   {/* Airport detail */}
//                   <div className="col-sm-4">
//                     {/* Title */}
//                     <h4>
//                       {
//                         (getItemFromIatacode(segment.departure?.iataCode) ?? {})
//                           .city
//                       }
//                     </h4>
//                     <h6 className="mb-0">
//                       {moment(segment.departure?.at).format(
//                         "ddd, DD MMMM YYYY"
//                       )}
//                       , {moment(segment.departure?.at).format("HH:mm")}
//                     </h6>
//                     <p className="mb-0">
//                       {(getItemFromIatacode(segment.departure?.iataCode) ?? {})
//                         .name + " Airport"}
//                     </p>
//                   </div>
//                   {/* Time */}
//                   <div className="col-sm-4 my-sm-auto text-center pt-4">
//                     {/* Time */}
//                     <h5>
//                       {/* {calculateTimeDifference(
//                         segment.departure?.at,
//                         segment.arrival?.at
//                       )} */}
//                       {segment.duration.slice(2).replace("H", "H  ")}
//                     </h5>
//                     <div className="position-relative my-4">
//                       {/* Line */}
//                       <hr className="bg-primary opacity-5 position-relative" />
//                       {/* Icon */}
//                       <div className="icon-md bg-primary-new text-white rounded-circle position-absolute top-50 start-50 translate-middle">
//                         <i className="fa-solid fa-fw fa-plane rtl-flip" />
//                       </div>
//                     </div>
//                     <div className="d-flex align-items-center justify-content-center mb-2 mb-sm-0 me-3">
//                       <img
//                         src={
//                           (getAirlineFromIatacode(segment?.carrierCode) ?? {})
//                             .logo
//                         }
//                         className="w-30px me-2"
//                         alt=""
//                       />
//                       <h6 className="fw-normal mb-0">
//                         {/* Phillippines Airline (PA - 5620) */}
//                         {flightFilter[segment?.carrierCode].name}
//                       </h6>
//                     </div>
//                   </div>
//                   {/* Airport detail */}
//                   <div className="col-sm-4">
//                     {/* Title */}
//                     <h4>
//                       {
//                         (getItemFromIatacode(segment.arrival?.iataCode) ?? {})
//                           .city
//                       }
//                     </h4>
//                     <h6 className="mb-0">
//                       {" "}
//                       {moment(segment.arrival?.at).format("ddd, DD MMMM YYYY")},
//                       {moment(segment.arrival?.at).format("HH:mm")}
//                     </h6>
//                     <p className="mb-0">
//                       {(getItemFromIatacode(segment.arrival?.iataCode) ?? {})
//                         .name + " Airport"}
//                       {/* {`${
//                         getItemFromIatacode(segment.arrival?.iataCode)[0].city
//                       }, ${
//                         getItemFromIatacode(segment.arrival?.iataCode)[0]
//                           .country
//                       }`} */}
//                     </p>
//                   </div>
//                 </div>
//                 {/* Divider */}
//                 {segments?.segments?.length > 1 &&
//                   segments?.segments?.length - 1 !== index && (
//                     <div className="bg-light text-center fw-normal rounded-2 mt-3 mb-4 p-2">
//                       Change of planes:{" "}
//                       {calculateTimeDifference(
//                         data[i]?.segments[index].arrival?.at,
//                         data[i]?.segments[index + 1]?.departure?.at
//                       )}{" "}
//                       Layover in{" "}
//                       {(
//                         getItemFromIatacode(
//                           data[i]?.segments[index]?.arrival?.iataCode
//                         ) ?? {}
//                       ).city || "Unknown City"}
//                     </div>
//                   )}
//               </>
//             ))}
//             {i % 2 === 0 && <hr className="mb-3 mt-3 border-2" />}
//           </>
//         ))}
//         {/* Ticket item END */}
//       </div>
//       {/* Card body END */}
//     </div>
//   )
// }

// export default ModalTickets
