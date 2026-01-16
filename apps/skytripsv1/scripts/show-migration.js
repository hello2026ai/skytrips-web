const fs = require('fs');
const path = require('path');

const migrationFile = path.join(__dirname, '../supabase/migrations/20240129_create_company_info.sql');

try {
  const sql = fs.readFileSync(migrationFile, 'utf8');
  console.log('\n\x1b[36m%s\x1b[0m', '=== SUPABASE MIGRATION SQL ===');
  console.log('\x1b[33m%s\x1b[0m', 'Please copy and run the following SQL in your Supabase Dashboard SQL Editor:');
  console.log('\x1b[36m%s\x1b[0m', '==============================\n');
  console.log(sql);
  console.log('\n\x1b[36m%s\x1b[0m', '==============================\n');
} catch (err) {
  console.error('Could not read migration file:', err.message);
}
