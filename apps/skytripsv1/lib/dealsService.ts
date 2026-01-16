import axios from 'axios';

export interface Deal {
  id: string;
  [key: string]: any;
}

interface DealsResponse {
  data: Deal[];
  meta: {
    total: number;
    page: number;
    limit: number;
    [key: string]: any;
  };
}

class DealsService {
  private static instance: DealsService;
  private cache: { [key: string]: { data: Deal[]; timestamp: number } } = {};
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): DealsService {
    if (!DealsService.instance) {
      DealsService.instance = new DealsService();
    }
    return DealsService.instance;
  }

  /**
   * Fetch all deals with pagination handling via internal proxy
   */
  async fetchAllDeals(useCache = true): Promise<Deal[]> {
    const cacheKey = 'all_deals';

    // Check in-memory cache
    if (useCache && this.cache[cacheKey]) {
      const { data, timestamp } = this.cache[cacheKey];
      if (Date.now() - timestamp < this.CACHE_DURATION) {
        console.log('Returning cached deals data');
        return data;
      }
    }

    let allDeals: Deal[] = [];
    let page = 1;
    const limit = 50; // Fetch 50 at a time
    let hasMore = true;

    try {
      console.log('Starting deals fetch via internal proxy...');
      while (hasMore) {
        console.log(`Fetching deals page ${page}...`);
        
        // Call internal API route
        const response = await axios.get<DealsResponse>(`/api/deals`, {
          params: {
            page,
            limit,
          },
        });

        const { data, meta } = response.data;
        
        if (data && Array.isArray(data)) {
          allDeals = [...allDeals, ...data];
        }

        // Check if we've fetched all pages
        if (meta && meta.total && allDeals.length < meta.total) {
          page++;
        } else {
          hasMore = false;
        }
      }

      console.log(`Successfully fetched ${allDeals.length} deals.`);

      // Update cache
      if (useCache) {
        this.cache[cacheKey] = {
          data: allDeals,
          timestamp: Date.now(),
        };
      }

      return allDeals;
    } catch (error: any) {
      console.error('Error fetching deals:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
            throw new Error('Unauthorized: Invalid credentials configured on server.');
        }
        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
      }
      throw error;
    }
  }
}

export const dealsService = DealsService.getInstance();
export default dealsService;
