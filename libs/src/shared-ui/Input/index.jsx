import React, { useContext, useEffect, useState } from 'react';
import './styles.scss';
import { useRouter } from 'next/router';

import CustomDropdown from '../CustomDropdown';
// import { AuthContext } from "@/context/AuthContext"

const Input = (props) => {
  const {
    name,
    errors,
    register,
    type,
    placeholder,
    extraClassName,
    maxLength,
    max,
    min,
    defaultValue,
    id,
    setTimer,
    timer,
    timeLeft,
    selectedOption,
    setSelectedOption,
    selectedCountry,
  } = props;

  const [inputType, setInputType] = useState(type);
  const [isFocused, setIsFocused] = useState(false);
  const [countryData, setCountryData] = useState({});
  const [dataerror, setError] = useState(null);

  const router = useRouter();
  const currentPath = router.pathname;

  const isMobileNumber = name === 'mobileNumber';

  const handleKeyPress = (e) => {
    if (name === 'items[0].passportNumber' || 'email') {
      return;
    }
    if (isMobileNumber) {
      if (!/^\d+$/.test(e.key)) {
        e.preventDefault();
      }
    } else if (type === 'text' && !/^[A-Za-z]+$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const inputStyle = {
    flex: 1, // Fill remaining space
    paddingRight: type === 'password' ? 30 : '1rem',
    backgroundColor: '#E3E4EF',
  };

  const handleFocus = () => {
    setIsFocused(true);
  };
  const handleBlur = () => {
    setIsFocused(false);
  };

  useEffect(() => {
    // Fetch the JSON data
    if (name === 'phone') {
      fetch('/phoneNumberCode.json')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => setCountryData(data))
        .catch((error) => {
          console.error('Error fetching country data:', error);
          setError(error);
        });
    }
  }, []);

  if (dataerror) {
    return <div>Error: {dataerror.message}</div>;
  }

  return (
    <>
      <div
        className={
          extraClassName === 'booking-form-input'
            ? 'text-input-container-booking'
            : 'text-input-container'
        }
      >
        {name === 'phone' ? (
          <>
            <CustomDropdown
              options={countryData}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              extraClassName={extraClassName}
            />
            {extraClassName !== 'contact-input' ? '|' : ''}
          </>
        ) : null}
        <input
          type={inputType}
          className={`form-control ${extraClassName ? extraClassName : ''} ${
            errors ? 'is-invalid' : ''
          }`}
          placeholder={placeholder}
          maxLength={maxLength ? maxLength : ''}
          min={min}
          max={max ? max : ''}
          id={id ? id : ''}
          {...register(name)}
          // style={{ paddingRight: type === "password" ? 30 : "1rem" }}
          style={inputStyle}
          onKeyPress={handleKeyPress}
          defaultValue={defaultValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {extraClassName === 'authentication-input otp-resend' ? (
          <div
            className="text-input-icon"
            onClick={timeLeft === 0 ? handleResendOtp : null}
            // disabled={timeLeft === 0}
          >
            <span
              className={`mt-3 ${timer ? 'resend-btn-disabled' : 'resend-btn'}`}
            >
              Resend OTP
            </span>
          </div>
        ) : (
          ''
        )}

        {type == 'password' ? (
          <div
            className={`${
              currentPath === '/profile'
                ? 'text-input-icon'
                : 'text-input-icon-auth'
            }`}
          >
            <i
              className="fa-solid fa-eye"
              onClick={() =>
                setInputType(inputType === 'password' ? 'text' : 'password')
              }
            />
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Input;
