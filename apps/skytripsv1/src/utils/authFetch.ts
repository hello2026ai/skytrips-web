import { toast } from 'sonner';

export const authFetch: (
  url: string,
  options?: RequestInit
) => Promise<Response> = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok && response.status === 401) {
    // Clear all auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Show error toast
    toast.error('Unauthorized');

    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  return response;
};
