"use client"
import React from "react"
import Image from "next/image"
import { useRouter } from "next/router"

const WeekendDestination = ({ weekendDestinations }) => {
  console.log("weekendDestinations", weekendDestinations)
  const router = useRouter()
  const handleWeekendPackage = (selectedTitle) => {
    router.push(`/weekend-package?trek=${encodeURIComponent(selectedTitle)}`)
  }
  return (
    <>
      <div className="d-flex justify-between weekend-destinations-container gap-2">
        {weekendDestinations &&
          weekendDestinations?.map((item, index) => (
            <div className="weekend-card" key={index}>
              <div className="banner">
                <Image
                  src={item?.img}
                  width={400}
                  height={100}
                  alt="ebc-image"
                  unoptimized
                  className="banner-img"
                />
              </div>
              <div className="card-tag">{item.tag}</div>
              <div className="information">
                <h4>{item?.title}</h4>
                <p className="mb-3">{item?.description}</p>
                {index !== 2 && (
                  <div>
                    <Image
                      src="/assets/images/weekendDestinations/calendar.svg"
                      width={16}
                      height={16}
                      alt=""
                      unoptimized
                      className="me-1"
                    />
                    <span>{item?.firstDate}</span>
                  </div>
                )}
                {index === 2 && (
                  <div>
                    <div>
                      <Image
                        src="/assets/images/weekendDestinations/leafIcon.svg"
                        width={16}
                        height={16}
                        alt=""
                        unoptimized
                        className="me-1"
                      />
                      <span>Nature</span>
                    </div>
                    <div>
                      <Image
                        src="/assets/images/weekendDestinations/loveIcon.svg"
                        width={16}
                        height={16}
                        alt=""
                        unoptimized
                        className="me-1"
                      />
                      <span>Healing</span>
                    </div>
                    <div>
                      <Image
                        src="/assets/images/weekendDestinations/groupIcon.svg"
                        width={16}
                        height={16}
                        alt=""
                        unoptimized
                        className="me-1"
                      />
                      <span>Gurung Culture</span>
                    </div>
                  </div>
                )}
                <div>
                  <Image
                    src="/assets/images/weekendDestinations/calendar.svg"
                    width={16}
                    height={16}
                    alt=""
                    unoptimized
                    className="me-1"
                  />
                  <span>{item?.secondDate}</span>
                </div>
              </div>
              <div className="d-flex  justify-content-center mt-auto p-2 mb-2">
                <button
                  type="button"
                  className="book-btn"
                  onClick={(e) => handleWeekendPackage(item?.title)}
                >
                  Talk to our Travel Planner
                </button>
              </div>
            </div>
          ))}
      </div>
    </>
  )
}

export default WeekendDestination
