import React, { useEffect, useState } from "react"
import { toast } from "react-toastify"

const ImageUploader = ({ file, setFile, register, name }) => {
  //states
  const [filePreview, setFilePreview] = useState("")

  useEffect(() => {
    if (file && typeof file == "string") {
      setFilePreview(`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${file}`)
    }
  }, [file])

  const handleFileChange = (e) => {
    const newFile = e.target.files[0]
    if (!newFile) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]

    if (!allowedTypes.includes(newFile.type)) {
      toast.error("Only JPG, PNG, and JPEG files are allowed.", {
        position: "top-right"
      })
      return
    }

    setFile(newFile)
    setFilePreview(URL.createObjectURL(e.target.files[0]))
  }
  return (
    <>
      <label className="form-label mt-2">
        Upload your profile photo
        <span className="text-danger"></span>
      </label>
      <div className="d-flex align-items-center">
        <label
          className="position-relative me-4"
          htmlFor="uploadfile-1"
          title="Replace this pic"
        >
          <span className="avatar avatar-xl">
            <img
              id="uploadfile-1-preview"
              className="avatar-img rounded-circle border border-white border-3 shadow"
              src={
                filePreview !== ""
                  ? filePreview
                  : "/assets/images/test-default-profile.png"
              }
              alt=""
            />
          </span>
        </label>

        <label
          className="btn btn-sm btn-primary-soft mb-0"
          htmlFor="uploadfile-1"
        >
          Change
        </label>
        <input
          id="uploadfile-1"
          className="form-control d-none"
          type="file"
          onChange={handleFileChange}
          // name="profileImage"
        />
      </div>
    </>
  )
}

export default ImageUploader
