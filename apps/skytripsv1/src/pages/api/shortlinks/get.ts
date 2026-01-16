import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'shortlinks-data.json');

// Simple in-file storage for shortlinks
const getStoredLinks = (): Record<string, {params: string, expiry: number}> => {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading shortlinks data:', error);
  }
  return {};
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { hash } = req.query;
    
    if (!hash || typeof hash !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid hash parameter' });
    }

    const links = getStoredLinks();
    const linkData = links[hash];

    if (!linkData || linkData.expiry < Date.now()) {
      return res.status(404).json({ message: 'Link not found or expired' });
    }

    res.status(200).json({ 
      success: true, 
      params: linkData.params 
    });
  } catch (error) {
    console.error('Error retrieving shortlink:', error);
    res.status(500).json({ message: 'Server error' });
  }
} 