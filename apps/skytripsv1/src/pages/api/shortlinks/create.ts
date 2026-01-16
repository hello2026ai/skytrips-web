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

const saveLinks = (data: Record<string, {params: string, expiry: number}>): void => {
  try {
    // Clean expired links before saving
    const now = Date.now();
    const cleaned = Object.entries(data).reduce((acc, [key, value]) => {
      if (value.expiry > now) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, {params: string, expiry: number}>);

    fs.writeFileSync(STORAGE_FILE, JSON.stringify(cleaned));
  } catch (error) {
    console.error('Error saving shortlinks data:', error);
  }
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { shortHash, params } = req.body;
    
    if (!shortHash || !params) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Store with 30-day expiry
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const links = getStoredLinks();
    links[shortHash] = { params, expiry };
    saveLinks(links);

    res.status(200).json({ success: true, shortHash });
  } catch (error) {
    console.error('Error creating shortlink:', error);
    res.status(500).json({ message: 'Server error' });
  }
} 