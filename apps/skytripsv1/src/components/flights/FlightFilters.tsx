import React from 'react';
import { Checkbox } from '../ui/checkbox';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { DualRangeSlider } from '../ui/dual-range-slider';

interface Airline {
  code: string;
  name: string;
  flightCount: number;
}

interface FlightFiltersProps {
  apiData: any;
  filters: {
    transit: {
      direct: boolean;
      oneStop: boolean;
      twoStops: boolean;
    };
    priceRange: number[];
    airlines: Record<string, { name: string; checked: boolean }>;
    departureTime: number[];
    arrivalTime: number[];
  };
  showAllAirlines: boolean;
  setShowAllAirlines: (show: boolean) => void;
  handleTransitChange: (
    type: 'direct' | 'oneStop' | 'twoStops',
    checked: boolean
  ) => void;
  handlePriceRangeChange: (values: number[]) => void;
  handlePriceRangeChangeComplete: (values: number[]) => void;
  handlePriceRangeChangeStart: () => void;
  handleDepartureTimeChange: (values: number[]) => void;
  handleDepartureTimeChangeComplete: (values: number[]) => void;
  handleDepartureTimeChangeStart: () => void;
  handleArrivalTimeChange: (values: number[]) => void;
  handleArrivalTimeChangeComplete: (values: number[]) => void;
  handleArrivalTimeChangeStart: () => void;
  handleAirlineChange: (airlineCode: string, checked: boolean) => void;
  clearAllFilters: () => void;
  timeStringToHour: (timeStr: string) => number;
  formatTime: (value: number) => string;
  selectedCurrency: string;
}

const FlightFilters: React.FC<FlightFiltersProps> = ({
  apiData,
  filters,
  showAllAirlines,
  setShowAllAirlines,
  handleTransitChange,
  handlePriceRangeChange,
  handlePriceRangeChangeComplete,
  handlePriceRangeChangeStart,
  handleDepartureTimeChange,
  handleDepartureTimeChangeComplete,
  handleDepartureTimeChangeStart,
  handleArrivalTimeChange,
  handleArrivalTimeChangeComplete,
  handleArrivalTimeChangeStart,
  handleAirlineChange,
  clearAllFilters,
  timeStringToHour,
  formatTime,
  selectedCurrency,
}) => {
  return (
    <div className="space-y-6">
      {/* Transit Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="body-b2 text-background-on">TRANSIT</h3>
          <button onClick={clearAllFilters} className="label-l2 text-error">
            Clear All
          </button>
        </div>

        <div className="space-y-3">
          {(apiData?.dictionaries?.transitOptions?.direct || 0) > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="direct"
                  checked={filters.transit.direct}
                  onCheckedChange={(checked) => {
                    if (typeof checked === 'boolean') {
                      handleTransitChange('direct', checked);
                    }
                  }}
                />
                <label
                  htmlFor="direct"
                  className="ml-2 label-l2 text-background-on cursor-pointer"
                >
                  Direct
                </label>
              </div>
              <span className="label-l2 text-background-on">
                {apiData?.dictionaries?.transitOptions?.direct || 0}
              </span>
            </div>
          )}

          {(apiData?.dictionaries?.transitOptions?.oneStop || 0) > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="oneStop"
                  checked={filters.transit.oneStop}
                  onCheckedChange={(checked) => {
                    if (typeof checked === 'boolean') {
                      handleTransitChange('oneStop', checked);
                    }
                  }}
                />
                <label
                  htmlFor="oneStop"
                  className="ml-2 label-l2 text-background-on cursor-pointer"
                >
                  One Stop
                </label>
              </div>
              <span className="label-l2 text-background-on">
                {apiData?.dictionaries?.transitOptions?.oneStop || 0}
              </span>
            </div>
          )}

          {(apiData?.dictionaries?.transitOptions?.twoPlusStops || 0) > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="twoStops"
                  checked={filters.transit.twoStops}
                  onCheckedChange={(checked) => {
                    if (typeof checked === 'boolean') {
                      handleTransitChange('twoStops', checked);
                    }
                  }}
                />
                <label
                  htmlFor="twoStops"
                  className="ml-2 label-l2 text-background-on cursor-pointer"
                >
                  2+ Stops
                </label>
              </div>
              <span className="label-l2 text-background-on">
                {apiData?.dictionaries?.transitOptions?.twoPlusStops || 0}
              </span>
            </div>
          )}

          {/* Show message when no transit options are available */}
          {(apiData?.dictionaries?.transitOptions?.direct || 0) === 0 &&
            (apiData?.dictionaries?.transitOptions?.oneStop || 0) === 0 &&
            (apiData?.dictionaries?.transitOptions?.twoPlusStops || 0) ===
              0 && (
              <div className="label-l2 text-background-on italic">
                No transit options available
              </div>
            )}
        </div>
      </div>

      {/* Price Range Section */}
      <div>
        <h3 className="body-b2 text-background-on mb-4">Price Range</h3>
        <div>
          <DualRangeSlider
            min={apiData?.dictionaries?.priceRange?.min || 0}
            max={apiData?.dictionaries?.priceRange?.max || 1000}
            step={10}
            value={filters.priceRange}
            onValueChange={handlePriceRangeChange}
            onValueChangeComplete={handlePriceRangeChangeComplete}
            onValueChangeStart={handlePriceRangeChangeStart}
            formatValue={(value: number) =>
              `${selectedCurrency} ${value.toFixed(2)}`
            }
            className="mb-2"
          />
        </div>
      </div>

      {/* Airlines Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="body-b2 text-background-on">Airlines</h3>
        </div>

        <div className="space-y-3">
          {apiData?.dictionaries?.airlines
            ?.slice(0, showAllAirlines ? undefined : 5)
            .map((airline: Airline) => (
              <div
                key={airline.code}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Checkbox
                    id={`airline-${airline.code}`}
                    checked={filters.airlines[airline.code]?.checked}
                    onCheckedChange={(checked) => {
                      if (typeof checked === 'boolean') {
                        handleAirlineChange(airline.code, checked);
                      }
                    }}
                  />
                  <label
                    htmlFor={`airline-${airline.code}`}
                    className="ml-2 label-l2 text-background-on cursor-pointer"
                  >
                    {airline.name}
                  </label>
                </div>
                <span className="label-l2 text-background-on">
                  {airline.flightCount}
                </span>
              </div>
            ))}

          {apiData?.dictionaries?.airlines &&
            apiData.dictionaries.airlines.length > 5 && (
              <button
                onClick={() => setShowAllAirlines(!showAllAirlines)}
                className="text-blue-600 label-l2 text-primary mt-2 flex items-center"
              >
                {showAllAirlines ? (
                  <>
                    Show less <ChevronUp className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    See more ({apiData.dictionaries.airlines.length - 5} more){' '}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </>
                )}
              </button>
            )}
        </div>
      </div>

      {/* Departure Times Section */}
      <div>
        <h3 className="body-b2 text-background-on mb-4">Departure Times</h3>
        <div>
          <DualRangeSlider
            min={
              apiData?.dictionaries?.departureTimes?.min
                ? timeStringToHour(apiData.dictionaries.departureTimes.min)
                : 0
            }
            max={
              apiData?.dictionaries?.departureTimes?.max
                ? timeStringToHour(apiData.dictionaries.departureTimes.max)
                : 24
            }
            step={1}
            value={filters.departureTime}
            onValueChange={handleDepartureTimeChange}
            onValueChangeComplete={handleDepartureTimeChangeComplete}
            onValueChangeStart={handleDepartureTimeChangeStart}
            formatValue={formatTime}
            className="mb-2"
          />
        </div>
      </div>

      {/* Arrival Times Section */}
      <div>
        <h3 className="body-b2 text-background-on mb-4">Arrival Times</h3>
        <div>
          <DualRangeSlider
            min={
              apiData?.dictionaries?.arrivalTimes?.min
                ? timeStringToHour(apiData.dictionaries.arrivalTimes.min)
                : 0
            }
            max={
              apiData?.dictionaries?.arrivalTimes?.max
                ? timeStringToHour(apiData.dictionaries.arrivalTimes.max)
                : 24
            }
            step={1}
            value={filters.arrivalTime}
            onValueChange={handleArrivalTimeChange}
            onValueChangeComplete={handleArrivalTimeChangeComplete}
            onValueChangeStart={handleArrivalTimeChangeStart}
            formatValue={formatTime}
            className="mb-2"
          />
        </div>
      </div>
    </div>
  );
};

export default FlightFilters;
