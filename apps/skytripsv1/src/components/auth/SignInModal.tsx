import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInSuccess?: (userData: any) => void;
}

const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSignInSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp'>('email');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setEmailError('');
      setEmailChecked(false);
      setIsNewUser(false);
      setPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setShowForgotPassword(false);
      setRegisterSuccess(false);
      setShowForgotModal(false);
      setForgotEmail('');
      setForgotLoading(false);
      setForgotStep('email');
      setForgotOtp('');
      setForgotPassword('');
    }
  }, [isOpen]);

  const validateEmail = (email: string): boolean => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError('');
    setEmailChecked(false);

    if (!newEmail.trim()) {
      setEmailError('');
    } else if (!validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const checkIfUserExists = async (email: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_REST_API}/auth/check-user`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase() }),
        }
      );
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data.isUserExist;
    } catch (error) {
      setEmailError('Failed to check user. Please try again.');
      return null;
    }
  };

  const loginUser = async (email: string, password: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_REST_API}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase(), password }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Login failed: ' + (errorData.message || 'Unknown error'));
        return;
      }
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem(
        'user',
        JSON.stringify({ email: email.toLowerCase() })
      );
      toast.success('Login successful!');

      // Dispatch a custom event for login success
      const loginEvent = new CustomEvent('userLoggedIn', { detail: data });
      window.dispatchEvent(loginEvent);

      if (onSignInSuccess) {
        onSignInSuccess(data);
      }
      onClose();
    } catch (error) {
      toast.error('Login error: ' + error);
    }
  };

  const registerUser = async (email: string, password: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_REST_API}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase(), password }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(
          'Registration failed: ' + (errorData.message || 'Unknown error')
        );
        return;
      }
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem(
        'user',
        JSON.stringify({ email: email.toLowerCase() })
      );
      toast.success('Registration successful!');
      setRegisterSuccess(true);
    } catch (error) {
      toast.error('Registration error: ' + error);
    }
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || emailError) return;
    const userExists = await checkIfUserExists(email);
    if (userExists === null) return;
    setIsNewUser(!userExists);
    setEmailChecked(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setPasswordError('');
    await loginUser(email, password);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    await registerUser(email, password);
  };

  const handleForgotPasswordStart = () => {
    setShowForgotModal(true);
    setForgotStep('email');
    setForgotEmail(email); // Pre-fill with the email from main form
    setForgotOtp('');
    setForgotPassword('');
  };

  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_REST_API}/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail.toLowerCase() }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || 'Network response was not ok');
      toast.success('Reset instructions sent!');
      setForgotStep('otp');
    } catch (error) {
      toast.error('Error sending reset instructions: ' + error);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_REST_API}/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: forgotEmail.toLowerCase(),
            token: forgotOtp,
            password: forgotPassword,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || 'Failed to reset password');
      toast.success('Password reset successful!');
      setShowForgotModal(false);
      setForgotStep('email');
      setForgotEmail('');
      setForgotOtp('');
      setForgotPassword('');
    } catch (error) {
      toast.error('Error resetting password: ' + error);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendForgotOtp = async () => {
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_REST_API}/auth/resend-forgot-password-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail.toLowerCase() }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to resend OTP');
      toast.success('OTP resent successfully!');
    } catch (error) {
      toast.error('Error resending OTP: ' + error);
    } finally {
      setForgotLoading(false);
    }
  };

  // Google OAuth login handler
  const handleGoogleLogin = async (credentialResponse: any) => {
    if (!credentialResponse?.credential) {
      toast.error('Google login failed.');
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_REST_API}/auth/oauth-login`,
        {
          method: 'POST',
          headers: {
            'token-type': 'google',
            token: credentialResponse.credential,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Google login failed');
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify({ email: 'Google User' }));
      toast.success('Login successful!');

      // Dispatch a custom event for login success
      const loginEvent = new CustomEvent('userLoggedIn', { detail: data });
      window.dispatchEvent(loginEvent);

      if (onSignInSuccess) {
        onSignInSuccess(data);
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
    }
  };

  if (!isOpen) return null;

  if (registerSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 w-full max-w-md relative text-center">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="title-t1 text-background-on mb-4">Success</h2>
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <svg
                className="h-8 w-8 text-green-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <div className="mb-2 title-t3 text-background-on">
            Welcome to SkyTrips!
          </div>
          <div className="mb-6 label-l1 text-neutral-on">
            You have successfully signed in to your account.
          </div>
          <button
            className="bg-primary label-l1 text-primary-on px-6 py-2 rounded-md "
            onClick={() => {
              onClose();
              // router.push('/account');
            }}
          >
            {/* Continue to Your Profile */}
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start sm:items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative mt-12 sm:mt-0">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="title-t2 text-background-on mb-2 text-center">
          Sign in / Register
        </h2>
        <p className="text-center label-l2 text-neutral-dark mb-4">
          Manage your bookings with ease
        </p>
        {/* Google login only on first modal view */}
        {!emailChecked && !showForgotModal && (
          <>
            <GoogleOAuthProvider
              clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
            >
              <div className="flex items-center justify-center mb-2">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => toast.error('Google login failed.')}
                  width="100%"
                  shape="pill"
                  text="continue_with"
                  logo_alignment="left"
                  useOneTap
                />
              </div>
            </GoogleOAuthProvider>
            <div className="text-center text-neutral-dark label-l3 mb-4">
              Quick, secure, and seamless authentication
            </div>
            <div className="flex items-center mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="mx-3 text-gray-400 text-xs">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          </>
        )}

        {/* Show forgot password modal if active, otherwise show main form */}
        {showForgotModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotStep('email');
                  setForgotEmail('');
                  setForgotOtp('');
                  setForgotPassword('');
                }}
                className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="title-t2  text-background-on mb-3">
                Reset Password
              </h2>
              {forgotStep === 'email' && (
                <form onSubmit={handleForgotEmailSubmit}>
                  <div className="mb-4">
                    <label className="block label-l2 text-background-on mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full p-2 border rounded-sm outline-[#5143d9]"
                      placeholder="Enter your email address"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                    {/* {email && forgotEmail === email && (
                      <p className="mt-1 text-xs text-green-600">
                        ✓ Using email from login form
                      </p>
                    )}
                    {email && forgotEmail !== email && forgotEmail !== '' && (
                      <p className="mt-1 text-xs text-blue-600">
                        Email updated for password reset
                      </p>
                    )} */}
                  </div>
                  <button
                    className="w-full py-2 rounded-lg bg-primary text-white"
                    type="submit"
                    disabled={forgotLoading || !forgotEmail.trim()}
                  >
                    {forgotLoading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </form>
              )}
              {forgotStep === 'otp' && (
                <form onSubmit={handleForgotResetPassword}>
                  <div className="mb-4">
                    <label className="block label-l2 text-background-on mb-2">
                      Enter 6-digit verification code
                    </label>
                    <div className="flex gap-2 mb-2 justify-start">
                      {[...Array(6)].map((_, idx) => (
                        <input
                          key={idx}
                          type="text"
                          maxLength={1}
                          value={forgotOtp[idx] || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setForgotOtp(
                              forgotOtp.substring(0, idx) +
                                val +
                                forgotOtp.substring(idx + 1)
                            );
                            // Move to next input if value entered
                            if (val && idx < 5) {
                              const next = document.getElementById(
                                `forgot-otp-input-${idx + 1}`
                              );
                              if (next) (next as HTMLInputElement).focus();
                            }
                          }}
                          id={`forgot-otp-input-${idx}`}
                          className="w-10 h-12 text-center border rounded text-lg focus:border-primary focus:outline-none"
                          autoFocus={idx === 0}
                          onPaste={
                            idx === 0
                              ? (e) => {
                                  const paste = e.clipboardData
                                    .getData('text')
                                    .replace(/[^0-9]/g, '');
                                  if (paste.length === 6) {
                                    setForgotOtp(paste);
                                    setTimeout(() => {
                                      const last =
                                        document.getElementById(
                                          'forgot-otp-input-5'
                                        );
                                      if (last)
                                        (last as HTMLInputElement).focus();
                                    }, 0);
                                    e.preventDefault();
                                  }
                                }
                              : undefined
                          }
                        />
                      ))}
                    </div>
                    <div className="text-sm text-left text-neutral-dark">
                      Didn't receive the code?{' '}
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={handleResendForgotOtp}
                        disabled={forgotLoading}
                      >
                        {forgotLoading ? 'Sending...' : 'Resend OTP'}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block label-l2 text-background-on mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showForgotPassword ? 'text' : 'password'}
                        className={`w-full p-2 pr-10 border rounded-sm outline-[#5143d9] ${
                          forgotOtp.length !== 6
                            ? 'bg-gray-100 cursor-not-allowed opacity-50'
                            : 'bg-white'
                        }`}
                        placeholder={
                          forgotOtp.length !== 6
                            ? 'Enter OTP first to enable password field'
                            : 'Enter new password'
                        }
                        value={forgotPassword}
                        onChange={(e) => setForgotPassword(e.target.value)}
                        disabled={forgotOtp.length !== 6}
                        required
                      />
                      <button
                        type="button"
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                          forgotOtp.length !== 6
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                        onClick={() =>
                          forgotOtp.length === 6 &&
                          setShowForgotPassword((prev) => !prev)
                        }
                        disabled={forgotOtp.length !== 6}
                        tabIndex={-1}
                      >
                        {showForgotPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {forgotOtp.length !== 6 && (
                      <p className="mt-1 text-xs text-gray-500">
                        Complete the 6-digit code above to set your new password
                      </p>
                    )}
                  </div>

                  <button
                    className={`w-full py-2 rounded-lg transition-colors ${
                      forgotLoading ||
                      forgotOtp.length !== 6 ||
                      !forgotPassword.trim()
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-[#5143d9]'
                    }`}
                    type="submit"
                    disabled={
                      forgotLoading ||
                      forgotOtp.length !== 6 ||
                      !forgotPassword.trim()
                    }
                  >
                    {forgotLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
        {!showForgotModal && (
          <form
            onSubmit={
              emailChecked
                ? isNewUser
                  ? handleRegister
                  : handleLogin
                : handleContinue
            }
          >
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block label-l1 text-background-on">
                    Email
                  </label>
                  {emailChecked && (
                    <button
                      type="button"
                      className="text-primary hover:underline label-l2"
                      onClick={() => {
                        setEmailChecked(false);
                        setPassword('');
                        setConfirmPassword('');
                        setPasswordError('');
                      }}
                    >
                      Change
                    </button>
                  )}
                </div>
                {emailChecked ? (
                  <input
                    type="email"
                    className="w-full p-2 border rounded-sm outline-[#5143d9] bg-gray-100 cursor-not-allowed"
                    value={email}
                    disabled
                  />
                ) : (
                  <input
                    type="email"
                    className={`w-full p-2 border rounded-sm outline-[#5143d9] ${
                      emailError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                  />
                )}
                {emailError && (
                  <p className="mt-1 text-sm text-red-500">{emailError}</p>
                )}
              </div>
              {/* Show password fields if email checked */}
              {emailChecked && !isNewUser && (
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block label-l1 text-background-on">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-primary hover:underline label-l2"
                      onClick={handleForgotPasswordStart}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full p-2 border rounded-sm outline-[#5143d9] pr-10"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-12 transform -translate-y-1/2"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {passwordError && (
                    <p className="mt-1 label-l3  text-red-500">
                      {passwordError}
                    </p>
                  )}
                </div>
              )}
              {emailChecked && isNewUser && (
                <>
                  <div className="relative">
                    <label className="block label-l1 text-background-on mb-1">
                      Create Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full p-2 border rounded-sm outline-[#5143d9] pr-10"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-12 transform -translate-y-1/2"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="block label-l1 text-background-on mb-1">
                      Confirm Password
                    </label>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full p-2 border rounded-sm outline-[#5143d9] pr-10"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordError && e.target.value === password) {
                          setPasswordError('');
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-12 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                    {passwordError && (
                      <p className="mt-1 text-sm text-red-500">
                        {passwordError}
                      </p>
                    )}
                  </div>
                </>
              )}
              <button
                className={`w-full py-2 rounded-lg ${
                  emailChecked
                    ? isNewUser
                      ? password && confirmPassword && !passwordError
                        ? 'bg-primary label-l1 text-secondary-on hover:bg-[#5143d9]'
                        : 'bg-dark label-l1 text-background-on cursor-not-allowed'
                      : password && !passwordError
                      ? 'bg-primary label-l1 text-secondary-on hover:bg-[#5143d9]'
                      : 'bg-dark label-l1 text-background-on cursor-not-allowed'
                    : email.trim() && !emailError
                    ? 'bg-primary label-l1 text-secondary-on hover:bg-[#5143d9]'
                    : 'bg-dark label-l1 text-background-on cursor-not-allowed'
                }`}
                disabled={
                  emailChecked
                    ? isNewUser
                      ? !password || !confirmPassword || !!passwordError
                      : !password || !!passwordError
                    : !email.trim() || !!emailError
                }
                type="submit"
              >
                {emailChecked ? (isNewUser ? 'Register' : 'Login') : 'Continue'}
              </button>
              <p className="label-l3 text-background-on">
                By continuing, you agree to our{' '}
                <a
                  className="text-primary"
                  href="/terms-and-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a
                  className="text-primary"
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy.
                </a>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignInModal;
