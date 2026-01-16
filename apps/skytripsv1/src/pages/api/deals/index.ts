import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { page = 1, limit = 10 } = req.query;
  
  // Use environment variables for credentials or fallback to provided defaults (for dev/demo)
  // In production, ALWAYS use environment variables.
  const username = process.env.DEALS_API_USERNAME || 'skytrips';
  const password = process.env.DEALS_API_PASSWORD || 'Skytrips@123';
  const apiBaseUrl = process.env.NEXT_PUBLIC_REST_API || 'https://api.skytrips.com.au';

  try {
    const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    
    const response = await axios.get(`${apiBaseUrl}/deals`, {
      params: {
        page,
        limit,
      },
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error in /api/deals proxy:', error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Internal Server Error';
    res.status(status).json({ message, error: error.message });
  }
}
