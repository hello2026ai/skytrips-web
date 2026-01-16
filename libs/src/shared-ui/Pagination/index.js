import React from "react"

import "./styles.scss"

const Pagination = (props) => {
  const { setPage, page, setTotalPages, totalPages } = props

  const handlePageClick = (pageNumber) => {
    if (pageNumber === "prev") {
      setPage(page - 1)
    } else if (pageNumber === "next") {
      setPage(page + 1)
    } else {
      setPage(pageNumber)
    }
  }

  const paginationItems = []

  paginationItems.push(
    <li key="prev" className={`page-item mb-0 ${page === 1 ? "disabled" : ""}`}>
      <p
        className="page-link"
        tabIndex={-1}
        onClick={() => handlePageClick("prev")}
      >
        <i className="fa-solid fa-angle-left" />
      </p>
    </li>
  )

  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(
      <li
        key={i}
        className={`page-item mb-0 ${page === i ? "active" : ""}`}
        onClick={() => handlePageClick(i)}
      >
        <a className="page-link" href="#">
          {i}
        </a>
      </li>
    )
  }

  paginationItems.push(
    <li
      key="next"
      className={`page-item mb-0 ${page === totalPages ? "disabled" : ""}`}
    >
      <p className="page-link" onClick={() => handlePageClick("next")}>
        <i className="fa-solid fa-angle-right" />
      </p>
    </li>
  )

  return (
    <nav className="d-flex justify-content-center" aria-label="navigation">
      <ul className="pagination pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
        {paginationItems}
      </ul>
    </nav>
  )

  //   return (
  //     <div className="pagination-conatiner">

  //       <nav className="d-flex justify-content-center" aria-label="navigation">
  //         <ul className="pagination pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
  //           <li className="page-item mb-0">
  //             <a className="page-link" href="#" tabIndex={-1}>
  //               <i className="fa-solid fa-angle-left" />
  //             </a>
  //           </li>
  //           <li className="page-item mb-0">
  //             <a className="page-link" href="#">
  //               1
  //             </a>
  //           </li>
  //           <li className="page-item mb-0 active">
  //             <a className="page-link" href="#">
  //               2
  //             </a>
  //           </li>
  //           <li className="page-item mb-0">
  //             <a className="page-link" href="#">
  //               ..
  //             </a>
  //           </li>
  //           <li className="page-item mb-0">
  //             <a className="page-link" href="#">
  //               6
  //             </a>
  //           </li>
  //           <li className="page-item mb-0">
  //             <a className="page-link" href="#">
  //               <i className="fa-solid fa-angle-right" />
  //             </a>
  //           </li>
  //         </ul>
  //       </nav>

  //     </div>
  //   )
}

export default Pagination
