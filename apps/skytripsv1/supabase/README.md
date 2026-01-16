# Supabase Integration for Skytrips

This directory contains the database schema and documentation for the Supabase integration used in the Skytrips application.

## Database Schema

### Table: `company_info`

Stores contact information for companies (e.g., Skytrips).

| Column | Type | Description |
| :--- | :--- | :--- |
| `company_name` | `text` | **Primary Key**. The name of the company (e.g., "Skytrips"). |
| `email` | `text` | The public contact email address. |
| `phone_number` | `text` | The public contact phone number. |
| `created_at` | `timestamptz` | The timestamp when the record was created. |

### Row Level Security (RLS)

- **Enable RLS**: Yes
- **Policies**:
  - `Allow public read access`: Allows any user (authenticated or anonymous) to `SELECT` from the `company_info` table.
  - Write access is restricted to the service role (default deny for others).

## Setup Instructions

1.  **Environment Variables**: Ensure the following variables are set in your `.env` file:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

2.  **Migration**: Apply the SQL migration file located at `migrations/20240129_create_company_info.sql` to your Supabase project using the SQL Editor or Supabase CLI.

## API Usage

### `getCompanyInfo(companyName: string)`

Fetches the contact information for a specific company.

**Location**: `apps/skytripsv1/src/utils/companyService.ts`

**Parameters**:
- `companyName` (string): The name of the company to fetch.

**Returns**:
- `Promise<FetchCompanyInfoResult>`: An object containing either the `data` (CompanyInfo) or an `error`.

**Example**:
```typescript
import { getCompanyInfo } from 'utils/companyService';

const { data, error } = await getCompanyInfo('Skytrips');

if (data) {
  console.log('Email:', data.email);
  console.log('Phone:', data.phone_number);
} else {
  console.error('Error:', error.message);
}
```

## Error Codes

- `PGRST116`: No rows found (Company not found).
- Other errors return the standard Supabase error message.
