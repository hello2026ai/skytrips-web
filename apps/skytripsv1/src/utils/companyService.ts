import { supabase } from './supabaseClient';

export interface CompanyInfo {
  company_name: string;
  email: string;
  phone_number: string;
}

export interface FetchCompanyInfoResult {
  data: CompanyInfo | null;
  error: Error | null;
}

/**
 * Fetches contact information for a specific company from Supabase.
 * @param companyName The name of the company to fetch (e.g., "Skytrips").
 * @returns An object containing the data or error.
 */
export const getCompanyInfo = async (companyName: string): Promise<FetchCompanyInfoResult> => {
  try {
    if (!companyName) {
      throw new Error('Company name is required');
    }

    const { data, error } = await supabase
      .from('company_info')
      .select('company_name, email, phone_number')
      .eq('company_name', companyName)
      .single();

    if (error) {
      // Supabase returns an error object, we can wrap it or return it directly
      // If code is PGRST116, it means 0 rows found when .single() is used
      if (error.code === 'PGRST116') {
         return { data: null, error: new Error(`Company "${companyName}" not found`) };
      }
      // Check for missing table error
      if (error.message && error.message.includes('Could not find the table')) {
        console.warn(`[Supabase] Table 'company_info' missing. Using default values.`);
        // Return no error so the UI falls back to defaults gracefully
        return { data: null, error: null };
      }
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as CompanyInfo, error: null };
  } catch (err: any) {
    return { data: null, error: err instanceof Error ? err : new Error('An unknown error occurred') };
  }
};
