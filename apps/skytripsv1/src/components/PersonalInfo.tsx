import React, { useState, useEffect } from 'react';
import countries from '../../../../libs/src/shared-utils/constants/countries.json';
import { CustomSelectField } from './ui/CustomSelectField';
import { toast } from 'sonner';
import { authFetch } from '../utils/authFetch';
import EnglishNameExample from './EnglishNameExample';
import { X, Mail, CheckCircle2 } from 'lucide-react';

const genders = ['Male', 'Female', 'Other'];

// Email verification modal component
const EmailVerificationModal = ({
  isOpen,
  onClose,
  userEmail,
}: {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}) => {
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(47);
  const [canResend, setCanResend] = useState(false);
  const [codeSent, setCodeSent] = useState(false); // Initially false - code not sent yet
  const [showOtpInput, setShowOtpInput] = useState(false); // Show OTP input only after sending code

  useEffect(() => {
    if (codeSent && resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [codeSent, resendTimer]);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp('');
      setCodeSent(false);
      setShowOtpInput(false);
      setResendTimer(47);
      setCanResend(false);
    }
  }, [isOpen]);

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setVerifying(true);
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_REST_API}/auth/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: otp }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Invalid or expired code');
        throw new Error(data.message || 'Invalid or expired code');
      }
      toast.success(data.message || 'Email verified successfully!');
      onClose();
      // Trigger a page refresh to update verification status
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Invalid or expired code');
    }
    setVerifying(false);
  };

  const handleSendVerificationCode = async () => {
    setSending(true);
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_REST_API}/auth/resend-verification-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userEmail }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Failed to send verification code');
        throw new Error(data.message || 'Failed to send verification code');
      }
      toast.success(data.message || 'Verification code sent successfully!');
      setCodeSent(true);
      setShowOtpInput(true);
      setResendTimer(47);
      setCanResend(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send verification code');
    }
    setSending(false);
  };

  const handleResendOtp = async () => {
    setSending(true);
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_REST_API}/auth/resend-verification-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userEmail }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Failed to resend OTP');
        throw new Error(data.message || 'Failed to resend OTP');
      }
      toast.success(data.message || 'OTP resent successfully!');
      setCodeSent(true);
      setResendTimer(47);
      setCanResend(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend OTP');
    }
    setSending(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Email Icon */}
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Mail size={32} className="text-blue-500" />
          </div>

          {/* Title */}
          <h2 className="h4 text-background-on mb-2">
            Verify Your Email Address
          </h2>

          {/* Description */}
          <p className="label-l2 text-neutral-dark mb-4 max-w-sm">
            Please verify your email address to access all features of your
            account.
          </p>

          {/* Email Display */}
          <div className="bg-gray-50 rounded-lg px-4 py-2 mb-6">
            <p className="label-l1 text-background-on opacity-80">
              Verification will be sent to:
            </p>
            <p className="title-t4 text-background-on">{userEmail}</p>
          </div>

          {/* Initial Message - Show before sending code */}
          {!showOtpInput && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 w-full">
              <p className="label-l2 text-primary-bright-variant">
                We'll send a 6-digit code to your email. Enter the code to
                verify your account.
              </p>
            </div>
          )}

          {/* Send Verification Code Button - Show initially */}
          {!showOtpInput && (
            <button
              onClick={handleSendVerificationCode}
              disabled={sending}
              className="w-full bg-primary text-primary-on py-3 px-4 rounded-lg  mb-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5143d9] transition-colors flex items-center justify-center gap-2"
            >
              {sending ? 'Sending Code...' : 'Send Verification Code'}
              {!sending && <span>→</span>}
            </button>
          )}

          {/* Success Message (when code is sent) */}
          {codeSent && showOtpInput && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 w-full flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-600" />
              <p className="text-green-700 label-l2">
                Verification code sent! Please check your inbox and enter the
                6-digit code below.
              </p>
            </div>
          )}

          {/* OTP Input - Show only after code is sent */}
          {showOtpInput && (
            <div className="mb-4">
              <p className="label-l2 text-neutral-dark mb-3">
                Enter 6-digit verification code
              </p>
              <div className="flex gap-2 justify-center">
                {[...Array(6)].map((_, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={otp[idx] || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setOtp(
                        otp.substring(0, idx) + val + otp.substring(idx + 1)
                      );
                      if (val && idx < 5) {
                        const next = document.getElementById(
                          `otp-input-${idx + 1}`
                        );
                        if (next) (next as HTMLInputElement).focus();
                      }
                    }}
                    id={`otp-input-${idx}`}
                    className="w-12 h-12 text-center border-2 border-gray-300 rounded-lg text-lg font-semibold focus:border-blue-500 focus:outline-none"
                    autoFocus={idx === 0}
                    onPaste={
                      idx === 0
                        ? (e) => {
                            const paste = e.clipboardData
                              .getData('text')
                              .replace(/[^0-9]/g, '');
                            if (paste.length === 6) {
                              setOtp(paste);
                              setTimeout(() => {
                                const last =
                                  document.getElementById('otp-input-5');
                                if (last) (last as HTMLInputElement).focus();
                              }, 0);
                              e.preventDefault();
                            }
                          }
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Verify Button - Show only after code is sent */}
          {showOtpInput && (
            <button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || verifying}
              className="w-full bg-primary text-primary-on py-3 px-4 rounded-lg font-medium mb-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5143d9] transition-colors flex items-center justify-center gap-2"
            >
              {verifying ? 'Verifying...' : 'Verify'}
              {!verifying && <span>→</span>}
            </button>
          )}

          {/* Resend Link - Show only after code is sent */}
          {showOtpInput && (
            <div className="label-l2 text-neutral-dark">
              Didn't receive the code?{' '}
              {canResend ? (
                <button
                  onClick={handleResendOtp}
                  disabled={sending}
                  className="text-primary label-l2 hover:underline font-medium"
                >
                  {sending ? 'Sending...' : 'Resend OTP'}
                </button>
              ) : (
                <span className="label-l2 text-neutral-dark opacity-80">
                  Resend in {resendTimer}s
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PersonalInfoProps {
  me: any;
  loading: boolean;
  refreshMe?: () => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({
  me,
  loading,
  refreshMe,
}) => {
  const [form, setForm] = useState<Record<string, string>>({
    givenName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    phoneCountryCode: '',
    dob: '',
    gender: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    passportIssueDate: '',
    passportIssueCountry: '',
    street: '',
    city: '',
    state: '',
    postal: '',
    country: '',
  });
  const [initialForm, setInitialForm] = useState<Record<string, string>>({
    givenName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    phoneCountryCode: '',
    dob: '',
    gender: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    passportIssueDate: '',
    passportIssueCountry: '',
    street: '',
    city: '',
    state: '',
    postal: '',
    country: '',
  });
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Email verification modal state
  const [showEmailVerificationModal, setShowEmailVerificationModal] =
    useState(false);

  const today = new Date().toISOString().slice(0, 10);

  console.log('me in personal info', me);

  useEffect(() => {
    if (me) {
      // Convert dateOfBirth to YYYY-MM-DD
      let dob = '';
      if (me.dateOfBirth) {
        const d = new Date(me.dateOfBirth);
        if (!isNaN(d.getTime())) {
          dob = d.toISOString().slice(0, 10);
        }
      }

      // Map gender to match form options
      let gender = '';
      if (me.gender) {
        if (me.gender.toLowerCase() === 'male') gender = 'Male';
        else if (me.gender.toLowerCase() === 'female') gender = 'Female';
        else gender = 'Other';
      }

      const formObj = {
        givenName: me.firstName || '',
        middleName: me.middleName || '',
        lastName: me.lastName || '',
        email: me.email || '',
        phone: me.phone || '',
        phoneCountryCode: me.phoneCountryCode || '',
        dob,
        gender,
        nationality: me.country || '',
        passportNumber: me.passport?.passportNumber || '',
        passportExpiry: me.passport?.passportExpiryDate || '',
        passportIssueDate: me.passport?.passportIssueDate || '',
        passportIssueCountry: me.passport?.passportIssueCountry || '',
        street: me.address?.street || '',
        city: me.address?.city || '',
        state: me.address?.state || '',
        postal: me.address?.postalCode || '',
        country: me.address?.country || me.country || '',
      };
      setForm(formObj);
      setInitialForm(formObj);

      // Show email verification modal if email is not verified
      if (me.email && !me.isVerified) {
        setShowEmailVerificationModal(true);
      }
    }
  }, [me]);

  const countryOptions = countries.countries
    .map((country) => ({
      value: country.label,
      label: country.label,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const nationalityOptions = [
    { value: '', label: 'Select nationality' },
    ...countryOptions,
  ];

  const countrySelectOptions = [
    { value: '', label: 'Select country' },
    ...countryOptions,
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => {
      if (prev[name]) {
        const { [name]: removed, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  };

  const buildUpdatePayload = () => {
    const payload: Record<string, any> = {};
    // Flat fields
    const flatFields = [
      ['firstName', 'givenName'],
      ['middleName', 'middleName'],
      ['lastName', 'lastName'],
      ['email', 'email'],
      ['phone', 'phone'],
      ['phoneCountryCode', 'phoneCountryCode'],
      ['dateOfBirth', 'dob'],
      ['gender', 'gender'],
      ['country', 'nationality'],
    ];
    flatFields.forEach(([apiField, formField]) => {
      if (form[formField] !== initialForm[formField]) {
        payload[apiField] = form[formField];
      }
    });
    // Address object
    const addressFields = ['street', 'city', 'state', 'country', 'postal'];
    let addressChanged = false;
    const address: Record<string, string> = {};
    addressFields.forEach((field) => {
      address[field === 'postal' ? 'postalCode' : field] = form[field];
      if (form[field] !== initialForm[field]) addressChanged = true;
    });
    if (addressChanged) payload.address = address;
    // Passport object
    const passportFields = [
      ['passportNumber', 'passportNumber'],
      ['passportExpiryDate', 'passportExpiry'],
      ['passportIssueDate', 'passportIssueDate'],
      ['passportIssueCountry', 'passportIssueCountry'],
    ];
    let passportChanged = false;
    const passport: Record<string, string> = {};
    passportFields.forEach(([apiField, formField]) => {
      passport[apiField] = form[formField];
      if (form[formField] !== initialForm[formField]) passportChanged = true;
    });
    if (passportChanged) payload.passport = passport;
    return payload;
  };

  const handleSave = async () => {
    setSaving(true);
    setValidationErrors({});

    // Validation
    const errors: Record<string, string> = {};
    // Required fields
    if (!form.givenName) errors.givenName = 'Given name is required.';
    if (!form.lastName) errors.lastName = 'Last name is required.';
    if (!form.gender) errors.gender = 'Gender is required.';
    if (!form.passportNumber)
      errors.passportNumber = 'Passport number is required.';
    // 1. Date of birth must be in the past
    if (!form.dob) {
      errors.dob = 'Date of birth is required.';
    } else if (form.dob >= new Date().toISOString().slice(0, 10)) {
      errors.dob = 'Date of birth must be in the past.';
    }
    // 2. Passport expiry must be today or in the future
    if (!form.passportExpiry) {
      errors.passportExpiry = 'Passport expiry date is required.';
    } else if (form.passportExpiry < today) {
      errors.passportExpiry =
        'Passport expiry date must be today or in the future.';
    }
    // 3. All address fields required
    const addressFields = [
      { key: 'street', label: 'Street Address' },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State/Province' },
      { key: 'postal', label: 'Postal Code' },
      { key: 'country', label: 'Country' },
    ];
    addressFields.forEach(({ key, label }) => {
      if (!form[key]) {
        errors[key] = `${label} is required.`;
      }
    });
    if (!form.nationality) errors.nationality = 'Nationality is required.';
    if (!form.country) errors.country = 'Country is required.';
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setSaving(false);
      return;
    }

    const payload = buildUpdatePayload();
    if (Object.keys(payload).length === 0) {
      toast('No changes to update.', { duration: 2000 });
      setSaving(false);
      return;
    }

    toast('Saving... Updating your profile, please wait.', { duration: 2000 });
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_REST_API}/user-profile`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error('Failed to update profile');
      toast.success('Profile updated successfully!');
      window.dispatchEvent(new Event('profileUpdated'));
      if (typeof refreshMe === 'function') refreshMe();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      <div className="bg-container rounded-xl  p-4 md:p-8  mx-auto text-background-on">
        <h2 className="h4  mb-1">Personal Information</h2>
        <p className="text-neutral-dark label-l2 mb-6">
          Provide your personal details and passport information as they appear
          on your travel documents.
        </p>

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* <div className="flex flex-col items-center gap-2">
            <img
              src="/assets/icons/avatar.jpg"
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border"
            />
            <button className="mt-2 px-4 py-2 bg-gray-100 rounded shadow  label-l2">
              Change Photo
            </button>
          </div> */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
              <div>
                <label className="block label-l2 mb-1">
                  Given Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="givenName"
                  value={form.givenName}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 ${
                    validationErrors.givenName ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter given name"
                />
                {validationErrors.givenName && (
                  <div className="text-red-500 text-xs mt-1">
                    {validationErrors.givenName}
                  </div>
                )}
              </div>
              {/* <div>
                <label className="block label-l2 mb-1">Middle Name</label>
                <input
                  name="middleName"
                  value={form.middleName}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter middle name"
                />
              </div> */}
              <div>
                <label className="block label-l2 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 ${
                    validationErrors.lastName ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter last name"
                />
                {validationErrors.lastName && (
                  <div className="text-red-500 text-xs mt-1">
                    {validationErrors.lastName}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
              <div>
                <label className="block label-l2 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 ${
                    validationErrors.dob ? 'border-red-500' : ''
                  }`}
                  placeholder="mm/dd/yyyy"
                  max={new Date().toISOString().slice(0, 10)}
                />
                {validationErrors.dob && (
                  <div className="text-red-500 text-xs mt-1">
                    {validationErrors.dob}
                  </div>
                )}
              </div>
              <div>
                <label className="block label-l2 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-3 ${
                    validationErrors.gender ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select gender</option>
                  {genders.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
                {validationErrors.gender && (
                  <div className="text-red-500 text-xs mt-1">
                    {validationErrors.gender}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
              <div>
                <label className="block label-l2 mb-1">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <CustomSelectField
                  // label="Nationality"
                  options={nationalityOptions}
                  value={form.nationality}
                  onChange={(value) => {
                    setForm({ ...form, nationality: value });
                    setValidationErrors((prev) => {
                      if (prev.nationality) {
                        const { nationality, ...rest } = prev;
                        return rest;
                      }
                      return prev;
                    });
                  }}
                  fullWidth
                  className={
                    validationErrors.nationality ? 'border-red-500' : ''
                  }
                  error={!!validationErrors.nationality}
                />
                {validationErrors.nationality && (
                  <div className="text-red-500 text-xs mt-1">
                    {validationErrors.nationality}
                  </div>
                )}
              </div>
              <div>
                <label className="block label-l2 mb-1">
                  Passport Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="passportNumber"
                  value={form.passportNumber}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 ${
                    validationErrors.passportNumber ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter passport number"
                />
                {validationErrors.passportNumber && (
                  <div className="text-red-500 text-xs mt-1">
                    {validationErrors.passportNumber}
                  </div>
                )}
              </div>
              <div>
                <label className="block label-l2 mb-1">
                  Passport Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="passportExpiry"
                  value={form.passportExpiry}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 ${
                    validationErrors.passportExpiry ? 'border-red-500' : ''
                  }`}
                  placeholder="mm/dd/yyyy"
                  min={today}
                />
                {validationErrors.passportExpiry && (
                  <div className="text-red-500 text-xs mt-1">
                    {validationErrors.passportExpiry}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <hr className="my-6" />
        <h3 className="title-t2 mb-4">Current Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block label-l2 mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              name="street"
              value={form.street}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${
                validationErrors.street ? 'border-red-500' : ''
              }`}
            />
            {validationErrors.street && (
              <div className="text-red-500 text-xs mt-1">
                {validationErrors.street}
              </div>
            )}
          </div>
          <div>
            <label className="block label-l2 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${
                validationErrors.city ? 'border-red-500' : ''
              }`}
            />
            {validationErrors.city && (
              <div className="text-red-500 text-xs mt-1">
                {validationErrors.city}
              </div>
            )}
          </div>
          <div>
            <label className="block label-l2 mb-1">
              State/Province <span className="text-red-500">*</span>
            </label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${
                validationErrors.state ? 'border-red-500' : ''
              }`}
            />
            {validationErrors.state && (
              <div className="text-red-500 text-xs mt-1">
                {validationErrors.state}
              </div>
            )}
          </div>
          <div>
            <label className="block label-l2 mb-1">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              name="postal"
              value={form.postal}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${
                validationErrors.postal ? 'border-red-500' : ''
              }`}
            />
            {validationErrors.postal && (
              <div className="text-red-500 text-xs mt-1">
                {validationErrors.postal}
              </div>
            )}
          </div>
          <div>
            <label className="block label-l2 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <CustomSelectField
              // label="Country"
              options={countrySelectOptions}
              value={form.country}
              onChange={(value) => {
                setForm({ ...form, country: value });
                setValidationErrors((prev) => {
                  if (prev.country) {
                    const { country, ...rest } = prev;
                    return rest;
                  }
                  return prev;
                });
              }}
              fullWidth
              className={validationErrors.country ? 'border-red-500' : ''}
              error={!!validationErrors.country}
            />
            {validationErrors.country && (
              <div className="text-red-500 text-xs mt-1">
                {validationErrors.country}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {/* <button
            className="px-4 py-2 label-l2 text-background-on hover:bg-[#d9d9d9] rounded border"
            type="button"
            disabled={saving}
          >
            Cancel
          </button> */}
          <button
            className="px-4 py-2 rounded bg-primary label-l2  text-secondary-on hover:bg-[#5143d9]"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      <EnglishNameExample />
      {showEmailVerificationModal && (
        <EmailVerificationModal
          isOpen={showEmailVerificationModal}
          onClose={() => setShowEmailVerificationModal(false)}
          userEmail={form.email}
        />
      )}
    </form>
  );
};

export default PersonalInfo;
