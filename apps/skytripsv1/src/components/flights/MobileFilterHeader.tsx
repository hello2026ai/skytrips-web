import React from 'react';
import { Filter } from 'lucide-react';

interface MobileFilterHeaderProps {
  onClick: () => void;
  // resultsCount: number;
}

const MobileFilterHeader: React.FC<MobileFilterHeaderProps> = ({
  onClick,
  // resultsCount,
}) => {
  return (
    <div className="inline-flex w-auto md:hidden border border-[#0c0073] items-center px-3 py-2 bg-[#E9E8F2] rounded-md shadow-sm">
      <button
        onClick={onClick}
        className="flex items-center justify-center label-l2 text-primary space-x-2 cursor-pointer"
        aria-label="Filter results"
      >
        <Filter className="h-4" />
        <span>Filters</span>
      </button>
      {/* <span className="ml-2 text-sm text-gray-700">
        {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
      </span> */}
    </div>
  );
};

export default MobileFilterHeader;
