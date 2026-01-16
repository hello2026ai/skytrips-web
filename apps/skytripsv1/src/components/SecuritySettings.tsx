import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { authFetch } from '../utils/authFetch';

interface SecuritySettingsProps {
  me: any;
  loading: boolean;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ me, loading }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_REST_API}/auth/update-password`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            // Add Authorization header if needed
          },
          body: JSON.stringify({
            oldPassword: currentPassword,
            newPassword,
            confirmNewPassword: confirmPassword,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }
      toast.success(data.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    }
  };

  return (
    <div className="bg-container p-4 md:p-8 rounded-md">
      <h4 className="h4 text-background-on mb-1">Security Settings</h4>
      <p className="label-l2 text-neutral-dark ">
        Manage your password and security preferences
      </p>

      <form onSubmit={handleUpdatePassword} className="space-y-4 mb-8 mt-3 ">
        <p className="title-t3 text-background-on mb-3">Change Password</p>
        <div>
          <label className="block label-l1 text-background-on mb-1">
            Current Password
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </span>
            <input
              type={showCurrent ? 'text' : 'password'}
              className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder=""
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              tabIndex={-1}
              onClick={() => setShowCurrent((v) => !v)}
            >
              {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block label-l1 text-background-on mb-1">
            New Password
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </span>
            <input
              type={showNew ? 'text' : 'password'}
              className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder=""
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              tabIndex={-1}
              onClick={() => setShowNew((v) => !v)}
            >
              {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block label-l1 text-background-on mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </span>
            <input
              type={showConfirm ? 'text' : 'password'}
              className="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder=""
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              tabIndex={-1}
              onClick={() => setShowConfirm((v) => !v)}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="bg-primary label-l1 text-primary-on px-6 py-2 rounded-md font-semibold mt-2 hover:bg-gray-800 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default SecuritySettings;
