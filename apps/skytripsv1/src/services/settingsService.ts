import axiosInstance from '../../lib/axiosConfig';

export interface CompanyDetail {
  countryName: string;
  country: string;
  state: string;
  street: string;
  zipCode: string;
  mapUrl: string;
  contactNumber: string;
  emailAddress: string;
}

export interface SocialMedium {
  title: string;
  link: string;
}

export interface AirportData {
  id: string;
  createdAt: string;
  updatedAt: string;
  popularity: number;
  name: string;
  type: string;
  elevationFt: number;
  continent: string;
  isoCountry: string;
  isoRegion: string;
  municipality: string;
  gpsCode: string;
  iataCode: string;
  coordinates: string;
  publishedStatus: boolean;
}

export interface Airline {
  id: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  position: number;
  airlineName: string;
  airlineCode: string;
  country: string;
  alliance?: string;
  airlineType?: string;
  yearOfEstablishment?: string;
  totalDestination?: string;
  totalFleet?: string;
  publishedStatus: boolean;
  logoUrl: string | null;
}

export interface DealCategory {
  id: string;
  title: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  deals: any[];
  subCategories: any[];
}

export interface HomePage {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  key: string;
  airline: Airline;
  metaTitle: string;
  metaDescription: string;
  dealCategoryIds: string[];
  pageTemplate: string;
  originAirport: AirportData;
  destinationAirport: AirportData;
  dealCategories: DealCategory[];
}

export interface GeneralSettings {
  id: string;
  createdAt: string;
  updatedAt: string;
  siteTitle: string;
  tagline: string;
  socialMediums: SocialMedium[];
  homePageId: string;
  companyDetails: CompanyDetail[];
  homePage?: HomePage;
}

export interface SettingsResponse {
  data: GeneralSettings[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

/**
 * Fetch general settings from the API
 * @param page - Page number (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Promise with settings data
 */
export const fetchGeneralSettings = async (
  page: number = 1,
  limit: number = 10
): Promise<SettingsResponse> => {
  try {
    const response = await axiosInstance.get<SettingsResponse>(
      `/setting/general`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching general settings:', error);
    throw error;
  }
};

/**
 * Get the homepage configuration from settings with full settings data
 * @returns Promise with GeneralSettings data or null if not configured
 */
export const getHomePageConfig = async (): Promise<GeneralSettings | null> => {
  try {
    const settings = await fetchGeneralSettings();
    if (settings.data && settings.data.length > 0) {
      return settings.data[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching homepage config:', error);
    return null;
  }
};
