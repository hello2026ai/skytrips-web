import React, { Fragment } from "react"
import { Breadcrumb } from "antd"
import Link from "next/link"

import "./styles.scss"

const BreadCrumb = ({ linkItem }) => {
  return (
    <Fragment>
      <Breadcrumb className="breadcrumbs" separator=">">
        {linkItem.map((item, index) => {
          if (item.linkName?.length > 0) {
            const [pathname, queryString] = item.linkUrl.split("?")
            const query = new URLSearchParams(queryString).toString()
            const isLastItem = index === linkItem.length - 1

            return (
              <Breadcrumb.Item
                key={index}
                className={isLastItem ? "breadcrumb-active" : ""}
              >
                {/* <Link
                  style={{ color: "#828282" }}
                  className="bread-link"
                  href={{
                    pathname: pathname,
                    query: query
                      ? Object.fromEntries(new URLSearchParams(query))
                      : {}
                  }}
                  passHref
                  disable={item.disable ? item.disable : ""}
                  onClick={(e) => (item.disable ? e.preventDefault() : "")}
                >
                  {" "}
                  {item.linkName}
                </Link> */}
                {/* {isLastItem ? (
                  <span className="bread-link">{item.linkName}</span>
                ) : ( */}
                <Link
                  className="bread-link"
                  href={{
                    pathname: pathname,
                    query: query
                      ? Object.fromEntries(new URLSearchParams(query))
                      : {}
                  }}
                  passHref
                  disable={item.disable ? item.disable : ""}
                  onClick={(e) => (item.disable ? e.preventDefault() : "")}
                >
                  {item.linkName}
                </Link>
                {/* )} */}
              </Breadcrumb.Item>
            )
          }

          // 👇️ render nothing
          return null
        })}

        {/* <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/favorite-tracks">
          Favorite Tracks
        </Breadcrumb.Item> */}
      </Breadcrumb>
    </Fragment>
  )
}

export default BreadCrumb
