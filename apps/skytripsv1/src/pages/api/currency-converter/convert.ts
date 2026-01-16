import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fromCurrency, toCurrency, amount } = req.body;

    if (!fromCurrency || !toCurrency || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Call your currency conversion API here
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_REST_API}/currency-converter/convert`,
      {
        params: {
          fromCurrency,
          toCurrency,
          amount,
        },
      }
    );

    if (response.data) {
      return res.status(200).json({
        convertedAmount: response.data.convertedAmount,
      });
    }

    return res
      .status(400)
      .json({ message: 'Invalid response from currency API' });
  } catch (error) {
    console.error('Error converting currency:', error);
    return res.status(500).json({ message: 'Error converting currency' });
  }
}
