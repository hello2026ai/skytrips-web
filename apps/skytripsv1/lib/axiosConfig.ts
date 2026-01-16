import axios from 'axios';

// Generate a unique client reference
const generateClientRef = (): string => {
  return `skytrips_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 10)}`;
};

// Get or create client reference with 1 hour expiration
const getClientRef = (): string => {
  if (typeof window === 'undefined') return generateClientRef();

  const storedData = sessionStorage.getItem('skytrips_client_ref');

  if (storedData) {
    try {
      const { value, expiry } = JSON.parse(storedData);
      if (expiry > Date.now()) {
        return value;
      }
    } catch (e) {
      // Invalid stored data, will generate new
    }
  }

  // Create new client ref with 1 hour expiration
  const clientRef = generateClientRef();
  const expiry = Date.now() + 60 * 60 * 1000; // 1 hour

  sessionStorage.setItem(
    'skytrips_client_ref',
    JSON.stringify({
      value: clientRef,
      expiry,
    })
  );

  return clientRef;
};

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REST_API || 'https://api.skytrips.com.au', // Replace with your API base URL
  timeout: 30000, // Set a timeout for requests (increased from 10000ms to 30000ms)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the client reference
axiosInstance.interceptors.request.use(
  (config) => {
    // Add client reference header to each request
    config.headers['ama-client-ref'] = getClientRef();

    // Add timezone header
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    config.headers['skytrips-device-timezone'] = timezone;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
