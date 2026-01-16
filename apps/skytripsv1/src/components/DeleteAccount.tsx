import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { authFetch } from '../utils/authFetch';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteAccountProps {
  me: any;
  loading: boolean;
}

const DeleteAccount: React.FC<DeleteAccountProps> = ({ me, loading }) => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [step, setStep] = useState<'initial' | 'password' | 'confirm'>(
    'initial'
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePasswordVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_REST_API}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: me.email,
            password: password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Invalid password');
      }

      setStep('confirm');
      toast.success('Password verified');
    } catch (error: any) {
      toast.error('Invalid password');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_REST_API}/user-profile`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete account');
      }

      toast.success('Account deleted successfully');
      localStorage.clear();
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setStep('initial');
    setPassword('');
  };

  const handleDeleteClick = () => {
    setIsModalOpen(true);
    if (me.socialProvider === 'google') {
      setStep('confirm');
    } else {
      setStep('password');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-500 mt-[0.4rem]" size={24} />
          <div>
            <h1 className="h4 text-error mb-2">Delete Account</h1>
            <div className="text-error space-y-2">
              <ul className="list-disc pl-4">
                <li>Once your account is deleted, it cannot be recovered.</li>
                <li>
                  All associated data, including booking history, saved
                  preferences, and personal details, will be permanently erased.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-6">
        <button
          onClick={handleDeleteClick}
          className="flex items-center gap-2 px-6 py-3 bg-error bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <Trash2 size={20} />
          <span>Delete Account</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={24} />
            </button>

            <div className="p-6">
              {step === 'password' && (
                <form
                  onSubmit={handlePasswordVerification}
                  className="space-y-6"
                >
                  <h2 className="h4 text-background-on mb-2">
                    Verify Your Password
                  </h2>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-neutral-dark label-l2 mb-1"
                    >
                      Enter your password to continue
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying || !password}
                    className="w-full bg-error text-primary-on py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? 'Verifying...' : 'Continue'}
                  </button>
                </form>
              )}

              {step === 'confirm' && (
                <div className="space-y-6">
                  <h2 className="h4 text-background-on mb-2">
                    Confirm Deletion
                  </h2>
                  <p className="text-background-on label-l2 mb-4">
                    Are you sure you want to delete your account? This action
                    cannot be undone.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="w-full bg-error text-primary-on py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting
                      ? 'Deleting Account...'
                      : 'Yes, Delete My Account'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;
