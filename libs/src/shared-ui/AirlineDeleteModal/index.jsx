import React, { useEffect, useState } from "react"
// import PaymentDetail from "../PaymentDetail"
// import DeleteCoupon from "../DeleteCoupon"
import "./styles.scss"
import { DELETE_COUPONS, GET_COUPONS } from "@/src/graphqlQueries/couponList"
import { useMutation } from "@apollo/client"
import { toast } from "react-toastify"
import { DELETE_AIRLINE, GET_AIRLINES } from "@/src/graphqlQueries/airlinesList"
import { useRouter } from "next/router"

const AirlineDeleteModal = (props) => {
  const { data, id } = props

  const router = useRouter()
  // console.log("deleted id", data)
  const [page, setPage] = useState(1)

  const [limit, setLimit] = useState(10)

  const [
    deleteFunc,
    { loading: deleteLoading, data: deleteData, error: deleteError }
  ] = useMutation(DELETE_AIRLINE, {
    fetchPolicy: "network-only",
    refetchQueries: [
      {
        query: GET_AIRLINES,
        variables: {
          page: page,
          limit: limit
        }
      }
    ]
  })

  const handleDelete = async () => {
    try {
      if (data) {
        await deleteFunc({ variables: { id: data } })
        toast.success("Airline has been deleted", {
          position: "top-right",
          autoClose: true
        })
        router.reload()

        // router.push({ pathname: "/airlines", query: { page, limit } })
      }
    } catch (error) {
      toast.error("Unable to delete", {
        position: "top-right",
        autoClose: true
      })
    }
  }

  return (
    <>
      <div className="modal fade" id={id} aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            {/* Title */}
            <div className="modal-header">
              <h5 className="modal-title">Are you sure you want to delete?</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            {/* Body */}
            <div className="modal-body p-3 delete-row">
              <div>
                <button
                  className="btn btn-primary createBtn"
                  type="submit"
                  onClick={handleDelete}
                  data-bs-dismiss="modal"
                >
                  Delete
                </button>
              </div>
              <div>
                {" "}
                <button
                  className="btn btn-secondary createBtn"
                  aria-label="Close"
                  type="button"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AirlineDeleteModal
