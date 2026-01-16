import React from "react"

const RefreshModal = ({ id, closeModal, btnText, text, handleRefresh }) => {
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal")) {
      closeModal()
    }
  }
  return (
    <div>
      <div className="modal-backdrop fade show" />
      <div
        className="modal fade show"
        id={id}
        style={{ display: "block" }}
        aria-modal="true"
        role="dialog"
        onClick={handleBackdropClick}
      >
        <div className="modal-dialog modal-lg refresh-modal-container ">
          <div className="modal-content py-0 ">
            {/* Title */}
            {/* <div className="modal-header">
              <h6 className="modal-text pt-2">refresh modal</h6>
              <button
                type="button"
                className="btn-close"
                onClick={closeModal}
                //   data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div> */}
            {/* Body */}
            <div className="modal-bg-image"></div>
            <div className="modal-body btn-modal-groups  text-center py-4 refresh-modal ">
              {" "}
              <p>{text}</p>
              <div
                className="refresh-btn cursor-pointer"
                onClick={handleRefresh}
              >
                <button className="btn btn-primary mb-0 refresh-btn-custom ">
                  {btnText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RefreshModal
