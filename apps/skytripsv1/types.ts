export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}

export interface SearchFormData {
  fromAirport?: Airport;
  toAirport?: Airport;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  passengerCount: PassengerCount;
  cabinClass: string;
  hasNepaleseCitizenship: boolean;
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  associatedAdultId?: string;
  price: {
    currency: string;
    total: string;
    base: string;
  };
  fareDetailsBySegment: Array<{
    segmentId: string;
    cabin: string;
    fareBasis: string;
    brandedFare: string;
    brandedFareLabel: string;
    class: string;
    includedCheckedBags?: {
      weight?: number;
      weightUnit?: string;
      quantity?: number;
    };
    includedCabinBags?: {
      quantity?: number;
    };
    amenities?: Array<{
      description: string;
      isChargeable: boolean;
      amenityType: string;
      amenityProvider: {
        name: string;
      };
    }>;
  }>;
}

export interface SearchParams {
  originLocationCode?: string;
  destinationLocationCode?: string;
  fromAirport?: Airport;
  toAirport?: Airport;
  adults: number;
  children: number;
  infants: number;
  infantCount?: string;
  childCount?: string;
  travelClass: string;
  // hasNepaleseCitizenship: boolean;
  currencyCode: string;
  maxResults: number;
  tripType?: 'one_way' | 'round_trip';
  originDestinations?: Array<{
    id: number;
    departureDateTimeRange: { date: string };
    originLocationCode?: string;
    destinationLocationCode?: string;
  }>;
  departureDate: string;
  returnDate: string;
  airline?: {
    airlineCode: string;
  };
  manualFilter?: {
    airlines?: string[];
    priceRange?: {
      highPrice: number;
      lowPrice: number;
    };
    numberOfStops?: number;
    departureTime?: {
      min: number;
      max: number;
    };
    arrivalTime?: {
      min: number;
      max: number;
    };
  };
}
