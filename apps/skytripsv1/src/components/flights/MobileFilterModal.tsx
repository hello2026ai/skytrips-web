import React, { useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import FlightFilters from './FlightFilters';

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiData: any;
  filters: any;
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
  applyFilters: () => void;
  selectedCurrency: string;
}

// Mobile filter button component
export const MobileFilterButton = ({ onClick }: { onClick: () => void }) => (
  <div className="fixed bottom-4 right-4 md:hidden z-20">
    <button
      onClick={onClick}
      className="bg-[#0C0073] text-white p-3 rounded-full shadow-lg flex items-center justify-center"
      aria-label="Open filters"
    >
      <Filter className="h-6 w-6" />
    </button>
  </div>
);

// Mobile filter modal component
const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  isOpen,
  onClose,
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
  applyFilters,
  selectedCurrency,
}) => {
  if (!isOpen) return null;

  // Modified handlers that apply filters but don't close the modal
  const handleTransitChangeAndApply = (
    type: 'direct' | 'oneStop' | 'twoStops',
    checked: boolean
  ) => {
    handleTransitChange(type, checked);
    applyFilters();
  };

  const handleAirlineChangeAndApply = (
    airlineCode: string,
    checked: boolean
  ) => {
    handleAirlineChange(airlineCode, checked);
    applyFilters();
  };

  const handlePriceRangeCompleteAndApply = (values: number[]) => {
    handlePriceRangeChangeComplete(values);
    applyFilters();
  };

  const handleDepartureTimeCompleteAndApply = (values: number[]) => {
    handleDepartureTimeChangeComplete(values);
    applyFilters();
  };

  const handleArrivalTimeCompleteAndApply = (values: number[]) => {
    handleArrivalTimeChangeComplete(values);
    applyFilters();
  };

  const handleClearAllFiltersAndApply = () => {
    clearAllFilters();
    applyFilters();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="bg-white w-[85%] h-full overflow-y-auto flex flex-col absolute right-0 animate-slide-in-right">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={() => {
              applyFilters();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <FlightFilters
            apiData={apiData}
            filters={filters}
            showAllAirlines={showAllAirlines}
            setShowAllAirlines={setShowAllAirlines}
            handleTransitChange={handleTransitChangeAndApply}
            handlePriceRangeChange={handlePriceRangeChange}
            handlePriceRangeChangeComplete={handlePriceRangeCompleteAndApply}
            handlePriceRangeChangeStart={handlePriceRangeChangeStart}
            handleDepartureTimeChange={handleDepartureTimeChange}
            handleDepartureTimeChangeComplete={
              handleDepartureTimeCompleteAndApply
            }
            handleDepartureTimeChangeStart={handleDepartureTimeChangeStart}
            handleArrivalTimeChange={handleArrivalTimeChange}
            handleArrivalTimeChangeComplete={handleArrivalTimeCompleteAndApply}
            handleArrivalTimeChangeStart={handleArrivalTimeChangeStart}
            handleAirlineChange={handleAirlineChangeAndApply}
            clearAllFilters={handleClearAllFiltersAndApply}
            timeStringToHour={timeStringToHour}
            formatTime={formatTime}
            selectedCurrency={selectedCurrency}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileFilterModal;
