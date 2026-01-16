import React from 'react';
import { CustomTextField } from './ui/CustomTextField';
import Image from 'next/image';

// Define the props type for the Payment component
interface PaymentProps {
  cardHolderName: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  onCardHolderNameChange: (value: string) => void;
  onCardNumberChange: (value: string) => void;
  onExpiryDateChange: (value: string) => void;
  onCvcChange: (value: string) => void;
  isProcessing: boolean;
  onPaymentSubmit: () => void;
  error?: string;
  validationErrors?: {
    cardHolderName?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvc?: string;
  };
  showValidationErrors?: boolean;
  bookingResponse?: any; // Booking response data from the backend
}

/**
 * Payment component that receives card details as props
 * This component can be imported and used in the book page
 */
const Payment: React.FC<PaymentProps> = ({
  cardHolderName,
  cardNumber,
  expiryDate,
  cvc,
  onCardHolderNameChange,
  onCardNumberChange,
  onExpiryDateChange,
  onCvcChange,
  isProcessing,
  onPaymentSubmit,
  error,
  validationErrors = {},
  showValidationErrors = false,
  bookingResponse,
}) => {
  // Helper function to check if a field has an error
  const hasError = (field: string) => {
    return (
      validationErrors[field as keyof typeof validationErrors] !== undefined
    );
  };

  return (
    <div className="bg-white rounded-md  mb-5 shadow-sm">
      <h3 className="title-t4 bg-dark text-background-on mb-5 px-5 py-3 rounded-t-md">
        Payment
      </h3>
      <div className="flex  items-center justify-between pr-4">
        <div className="flex items-center p-3 mb-5 border border-[#12e848] rounded mx-4 md:w-auto w-[50%]">
          <span className="mr-2 text-green-600">
            <Image
              src="/assets/icons/lock.svg"
              width={20}
              height={20}
              alt="lock-icon"
            />
          </span>
          <p className="label-l3 text-success m-0">
            This payment is secure and protected by SSL encryption
          </p>
        </div>
        <div className="mb-5">
          <div className="flex flex-col items-end text-right label-l3 text-primary  py-1 px-2 rounded-md">
            <h4 className="text-[7px] md:text-[10px] text-background-on">
              Trusted by{' '}
              {/* <span className="text-[9px] text-background-on"> */}
              Australians all over the world.
              {/* </span> */}
            </h4>
            <Image
              src="/assets/images/payment/commonwealthImage.webp"
              alt="Payment Secure"
              width={130}
              height={100}
            />
          </div>
        </div>
      </div>

      <div className="mb-5 px-5 pb-5">
        <div className="mb-4">
          <CustomTextField
            label="Cardholder's Name"
            fullWidth
            value={cardHolderName}
            onChange={(e) => onCardHolderNameChange(e.target.value)}
            required
            placeholder="Name on card"
            error={
              (showValidationErrors || hasError('cardHolderName')) &&
              !!validationErrors.cardHolderName
            }
            errorMessage={validationErrors.cardHolderName}
            className={
              (showValidationErrors || hasError('cardHolderName')) &&
              validationErrors.cardHolderName
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-900'
            }
          />
        </div>

        <div className="mb-4">
          <CustomTextField
            label="Card Number"
            fullWidth
            value={cardNumber}
            onChange={(e) => onCardNumberChange(e.target.value)}
            required
            placeholder="Card number"
            maxLength={16}
            error={
              (showValidationErrors || hasError('cardNumber')) &&
              !!validationErrors.cardNumber
            }
            errorMessage={validationErrors.cardNumber}
            className={
              (showValidationErrors || hasError('cardNumber')) &&
              validationErrors.cardNumber
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-900'
            }
          />
        </div>

        <div className="flex flex-wrap -mx-2 mb-4">
          <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
            <CustomTextField
              label="Expiry Date"
              fullWidth
              value={expiryDate}
              onChange={(e) => onExpiryDateChange(e.target.value)}
              required
              placeholder="MM/YY"
              maxLength={5}
              error={
                (showValidationErrors || hasError('expiryDate')) &&
                !!validationErrors.expiryDate
              }
              errorMessage={validationErrors.expiryDate}
              className={
                (showValidationErrors || hasError('expiryDate')) &&
                validationErrors.expiryDate
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-900'
              }
            />
          </div>

          <div className="w-full md:w-1/2 px-2">
            <CustomTextField
              label="CVC"
              fullWidth
              value={cvc}
              onChange={(e) => onCvcChange(e.target.value)}
              required
              placeholder="3-digit code"
              maxLength={3}
              error={
                (showValidationErrors || hasError('cvc')) &&
                !!validationErrors.cvc
              }
              errorMessage={validationErrors.cvc}
              className={
                (showValidationErrors || hasError('cvc')) &&
                validationErrors.cvc
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-900'
              }
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex flex-col md:flex-row md:items-center mt-5">
            <p className="title-t4 text-background-on mr-3 mb-2 md:mb-0">
              We Accept:{' '}
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="border border-gray-300 rounded flex items-center justify-center h-7 w-12">
                <img
                  src="/assets/images/payment/visa.webp"
                  alt="Visa"
                  className="w-full h-full"
                />
              </span>
              <span className="border border-gray-300 rounded flex items-center justify-center h-7 w-12">
                <img
                  src="/assets/images/payment/mastercard.webp"
                  alt="Mastercard"
                  className="w-full h-full"
                />
              </span>
              <span className="border border-gray-300 rounded flex items-center justify-center h-7 w-12">
                <img
                  src="/assets/images/payment/american-express.webp"
                  alt="American Express"
                  className="w-full h-full"
                />
              </span>
              <span className="border border-gray-300 rounded flex items-center justify-center h-7 w-12">
                <img
                  src="/assets/images/payment/jcb.webp"
                  alt="JCB"
                  className="w-full h-full"
                />
              </span>

              {/* <span className="border border-gray-300 rounded flex items-center justify-center h-7 w-12">
                <img
                  src="/assets/images/payment/american-express.webp"
                  alt="American Express"
                  className="w-full h-full"
                />
              </span>
              <span className="border border-gray-300 rounded flex items-center justify-center h-7 w-12">
                <img
                  src="/assets/images/payment/jcb.webp"
                  alt="JCB"
                  className="w-full h-full"
                />
              </span>
              <span className="border border-gray-300 rounded flex items-center justify-center h-7 w-12">
                <img
                  src="/assets/images/payment/discover.webp"
                  alt="Discover"
                  className="w-full h-full"
                />
              </span> */}
            </div>
          </div>

          <button
            className={`flex justify-center items-center px-7 py-2.5 md:py-1 ${
              isProcessing ? 'bg-gray-500' : 'bg-primary hover:bg-blue-800'
            } text-primary-on rounded title-t3 mt-5 transition-colors ml-auto`}
            onClick={onPaymentSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
