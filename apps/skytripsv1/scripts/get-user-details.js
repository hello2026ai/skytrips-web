require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing Supabase environment variables.');
  console.error('Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in apps/skytripsv1/.env');
  process.exit(1);
}

// Initialize Supabase Admin Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function getUserDetails(uid) {
  if (!uid) {
    console.error('Error: UID is required.');
    return;
  }

  // Basic UID validation (UUID format)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uid)) {
    console.error('Error: Invalid UID format.');
    return;
  }

  console.log(`Fetching details for UID: ${uid}...`);

  try {
    const { data: { user }, error } = await supabase.auth.admin.getUserById(uid);

    if (error) {
      console.error(`Error fetching user: ${error.message}`);
      return;
    }

    if (!user) {
      console.error('Error: User not found.');
      return;
    }

    // Extract email and phone
    const email = user.email || 'N/A';
    const phone = user.phone || 'N/A';

    // Display formatted output
    console.log('\n--- User Contact Details ---');
    console.log(`Email: ${email}`);
    console.log(`Contact Number: ${phone}`);
    console.log('----------------------------\n');

  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

// Get UID from command line args or use default from prompt
const targetUid = process.argv[2] || '103eee57-c8ce-4f71-a7f6-825dbf79b238';

getUserDetails(targetUid);
