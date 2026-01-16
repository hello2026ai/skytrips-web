
// Mock the storage service to avoid universal-cookie issues during test
jest.mock('../../shared-service/storage', () => ({
  STORAGE_KEYS: {
    ACCESS_TOKEN: "__a_t__",
  },
  getValueOf: jest.fn().mockReturnValue('mock-token'),
}));

// Set env var before import
process.env.NEXT_PUBLIC_REST_API = 'http://test-api.com';

import axiosInstance from '../axiosConfig';

describe('axiosConfig headers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has correct baseURL', () => {
    expect(axiosInstance.defaults.baseURL).toBe('http://test-api.com');
  });

  it('adds authorization header', () => {
    const authHeader = axiosInstance.defaults.headers['authorization'];
    expect(authHeader).toBe('Bearer mock-token');
  });
});
