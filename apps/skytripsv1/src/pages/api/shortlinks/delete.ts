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
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving shortlinks data:', error);
  }
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { hash } = req.query;
    
    if (!hash || typeof hash !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid hash parameter' });
    }

    // Get current links
    const links = getStoredLinks();
    
    // Check if link exists
    if (!links[hash]) {
      return res.status(404).json({ message: 'Link not found' });
    }
    
    // Delete the link
    delete links[hash];
    
    // Save updated links
    saveLinks(links);

    res.status(200).json({ success: true, message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting shortlink:', error);
    res.status(500).json({ message: 'Server error' });
  }
} 