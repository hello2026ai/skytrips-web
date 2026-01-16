import React, { useEffect, useState } from "react"
import PaymentDetail from "../PaymentDetail"

const PaymentModal = (props) => {
  const { data, id } = props

  return (
    <>
      <div className="modal fade" id={id} aria-hidden="true">
        <PaymentDetail data={data} />
      </div>
    </>
  )
}

export default PaymentModal
