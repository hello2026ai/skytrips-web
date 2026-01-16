import React, { useEffect, useState } from "react"
import SEOHead from "../SEOHead"
import { useMutation } from "@apollo/client"
import { yupResolver } from "@hookform/resolvers/yup"
import * as Yup from "yup"
import { useForm } from "react-hook-form"
import { TextInput } from ".."
import TimePicker from "../TimePicker"
import { STORE_TRIP_INQUIRY } from "@/src/graphqlQueries/tripInquiry"
import { toast } from "react-toastify"
import Image from "next/image"

const WeekendDestinationForm = ({ trekName }) => {
  const [selectedOption, setSelectedOption] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState("Australia")
  const [selectedPhoneCode, setSelectedPhoneCode] = useState("+61")
  const [hourValue, setHourValue] = useState("12")
  const [minuteValue, setMinuteValue] = useState("00")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  useEffect(() => {
    if (selectedOption) {
      setSelectedPhoneCode(selectedOption.phone[0])
    }
  }, [selectedOption])

  const [tripInquiryFunc, { loading, tripInquiryError: error, data }] =
    useMutation(STORE_TRIP_INQUIRY, { fetchPolicy: "network-only" })

  const TripFormSchema = Yup.object().shape({
    email: Yup.string().email().required("Email is required"),
    fullName: Yup.string().required("Full name is required"),
    comment: Yup.string()
      .required("Comment is required")
      .max(300, "Comment must be at most 300 characters long"),
    phone: Yup.string().required("Contact number is required"),
    hour: Yup.string()
      .matches(/^(0?[1-9]|1[0-2])$/, "Hour must be between 1 and 12")
      .required("Hour is required!"),

    period: Yup.string()
      .oneOf(["AM", "PM"], "Must be AM or PM")
      .required("Time format is required!")
  })
  // react hook form
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    clearErrors,
    watch,
    formState: { errors }
  } = useForm({ resolver: yupResolver(TripFormSchema) })

  const onSubmit = async (tripData) => {
    // console.log("tripData", tripData)
    try {
      const variable = {
        fullName: tripData?.fullName,
        email: tripData?.email,
        phoneCountryCode: selectedPhoneCode,
        phone: tripData.phone,
        timeZone: userTimeZone,
        isTermsAccepted: agreeToTerms,
        comment: tripData.comment,
        preferedTime: tripData.preferedTime,
        tripName: trekName
      }

      // console.log("variable", variable)
      const response = await tripInquiryFunc({ variables: variable })
      if (response && response?.data) {
        toast.success("Inquiry sent successfully", {
          onClose: () => window.location.reload() // Reload after toast disappears
        })
      }
    } catch (error) {
      toast.error(error)
    }
  }

  const goToPrivacyPolicy = () => {
    window.open("/privacy-policy")
  }

  // console.log("tripInquiryError", tripInquiryError)

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="contact_wrapper_right mt-6">
          <div className="row g-2">
            <div className="col-md-12">
              <label className="weekend-form-label">Full Name*</label>
              <TextInput
                type="text"
                name="fullName"
                extraClassName="contact-input"
                register={register}
                placeholder="Full name"
                errors={errors.fullName?.message}
              />

              {errors?.fullName?.message && (
                <div className="text-danger error">
                  {errors.fullName?.message}
                </div>
              )}
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-12">
              <label className="weekend-form-label">Email Address*</label>
              <TextInput
                type="text"
                name="email"
                register={register}
                placeholder="Email"
                extraClassName="contact-input"
                errors={errors.email?.message}
              />

              {errors?.email?.message && (
                <div className="text-danger error">{errors.email?.message}</div>
              )}
            </div>
          </div>
          <div className="row">
            {/* <div className="col-md-6 mt-3">
                      <CountryCodeSelect
                        type="text"
                        name={"countryCode"}
                        options={countryCodes}
                        register={register}
                        extraClassName="contact-input"
                        placeholder="Country Code"
                        errors={errors?.countryCode?.message}
                      />
                      {errors?.countryCode?.message && (
                        <div className="text-danger error">
                          {errors.countryCode?.message}
                        </div>
                      )}
                    </div> */}

            <div className="col-md-12 mt-3">
              <label className="weekend-form-label">Contact Number*</label>
              <TextInput
                key="phone-input"
                type="number"
                placeholder=""
                extraClassName="booking-form-input"
                name={"phone"}
                register={register}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                errors={errors && errors.phone}
              />
              {errors?.phone && (
                <div className="text-danger error">{errors.phone?.message}</div>
              )}
            </div>
            <div className="col-md-12 mt-3">
              <label className="weekend-form-label">Select Time*</label>
              <TimePicker
                register={register}
                setValue={setValue}
                watch={watch}
                error={errors}
                clearErrors={clearErrors}
                setHourValue={setHourValue}
                hourValue={hourValue}
                minuteValue={minuteValue}
                setMinuteValue={setMinuteValue}
              />
            </div>
          </div>
          <div className="row">
            <div className="mt-3 col-md-12 ">
              <label className="weekend-form-label">Additional Comments*</label>
              <textarea
                type="textarea"
                name="comment"
                className={
                  errors.comment?.message
                    ? "textarea form-control textareaerror"
                    : "textarea form-control weekend-textarea"
                }
                // rows="6"
                placeholder="Tell us about your travel preferences..."
                cols="56"
                rows="3"
                errors={errors.comment?.message}
                {...register("comment")}
              />
              {errors?.comment && (
                <div className="text-danger error">
                  {errors.comment?.message}
                </div>
              )}
            </div>
          </div>
          <div className="d-flex mt-0 ">
            <div class="form-check book-checkbox">
              <label class="form-check-label text-dark">
                <input
                  class="form-check-input"
                  type="checkbox"
                  onChange={({ target: { checked } }) =>
                    setAgreeToTerms(checked)
                  }
                />
              </label>
            </div>

            <div className="weekend-form_agree_text">
              I agree to receive travel updates and promotional offers. You can
              unsubscribe at any time. Read our{" "}
              <span onClick={goToPrivacyPolicy} className="cursor-pointer">
                Privacy Policy
              </span>
            </div>
          </div>
          <div className="w-100 mt-3 btn-wrapper">
            <button
              type="submit"
              className="w-100 btn btn-primary  mb-0 custom-submit-btn"
              disabled={!agreeToTerms}
            >
              {loading && (
                <Image
                  className="me-3"
                  src="/assets/images/loading-gif.gif"
                  alt="loader"
                  width="20"
                  height="20"
                />
              )}{" "}
              Submit Inquiry
            </button>
          </div>
        </div>
      </form>
    </>
  )
}

export default WeekendDestinationForm
