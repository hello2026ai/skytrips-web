import React from "react"

// import "./styles.scss"

const AdminTablePagination = (props) => {
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

  const renderPaginationNumbers = () => {
    const paginationNumbers = []
    const maxPagesToShow = 5 // Maximum number of pages to show

    // Calculate the start and end page numbers based on the current page
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2))
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    // Adjust start and end page numbers if necessary
    if (totalPages - endPage < Math.floor(maxPagesToShow / 2)) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    // Render page numbers within the range
    for (let i = startPage; i <= endPage; i++) {
      paginationNumbers.push(
        <li
          key={i}
          className={`page-item ${page === i ? "active" : ""}`}
          onClick={() => handlePageClick(i)}
        >
          <a className="page-link" href="#">
            {i}
          </a>
        </li>
      )
    }

    return paginationNumbers
  }

  return (
    <nav className="d-flex justify-content-center" aria-label="navigation">
      <ul className="pagination pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
        {/* Render Previous Button */}
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <p className="page-link" onClick={() => handlePageClick("prev")}>
            <i className="fa-solid fa-angle-left" />
          </p>
        </li>

        {/* Render Pagination Numbers */}
        {renderPaginationNumbers()}

        {/* Render Next Button */}
        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
          <p className="page-link" onClick={() => handlePageClick("next")}>
            <i className="fa-solid fa-angle-right" />
          </p>
        </li>
      </ul>
    </nav>
  )
}

export default AdminTablePagination
