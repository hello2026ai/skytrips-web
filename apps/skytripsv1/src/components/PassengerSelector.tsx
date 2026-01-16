'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}

interface PassengerSelectorProps {
  className?: string;
  initialCount?: PassengerCount;
  onChange: (count: PassengerCount) => void;
  onCabinClassChange?: (cabin: string) => void;
  cabinClass?: string;
  insideBorder?: boolean;
  hasNepaleseCitizenship?: boolean;
  onNepaleseCitizenshipChange?: (value: boolean) => void;
}

export function PassengerSelector({
  className,
  initialCount = { adults: 1, children: 0, infants: 0 },
  onChange,
  onCabinClassChange,
  cabinClass = 'ECONOMY',
  insideBorder = false,
  hasNepaleseCitizenship = false,
  onNepaleseCitizenshipChange,
}: PassengerSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [isNepaleseCitizen, setIsNepaleseCitizen] = React.useState(
    hasNepaleseCitizenship
  );

  const containerRef = React.useRef<HTMLDivElement>(null);

  const updateCount = (type: keyof PassengerCount, value: number) => {
    // Create a new count object instead of using state
    const newValue = Math.max(0, initialCount[type] + value);
    const newCount = { ...initialCount, [type]: newValue };

    // Apply rules
    if (type === 'adults' && newValue === 0) {
      newCount.adults = 1; // Minimum 1 adult
    }

    // Calculate total passengers including the new count
    const totalPassengers =
      newCount.adults + newCount.children + newCount.infants;

    // Maximum 7 passengers total (adults + children + infants)
    if (totalPassengers > 7) {
      // Adjust the count based on which type is being modified
      if (type === 'adults') {
        newCount.adults = 7 - (initialCount.children + initialCount.infants);
      } else if (type === 'children') {
        newCount.children = 7 - (initialCount.adults + initialCount.infants);
      } else if (type === 'infants') {
        newCount.infants = 7 - (initialCount.adults + initialCount.children);
      }
    }

    // Each adult can only take one infant (1:1 ratio)
    if (type === 'adults' && newValue < newCount.infants) {
      newCount.infants = newValue; // Reduce infants if adults are reduced
    }

    if (type === 'infants' && newValue > newCount.adults) {
      newCount.infants = newCount.adults; // Infants cannot exceed adults
    }

    onChange(newCount);
  };

  const handleCabinClassChange = (value: string) => {
    if (onCabinClassChange) {
      onCabinClassChange(value);
    }
  };

  const handleCitizenshipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setIsNepaleseCitizen(newValue);
    if (onNepaleseCitizenshipChange) {
      onNepaleseCitizenshipChange(newValue);
    }
  };

  // Update Nepalese citizenship when prop changes
  React.useEffect(() => {
    setIsNepaleseCitizen(hasNepaleseCitizenship);
  }, [hasNepaleseCitizenship]);

  // Handle clicks outside the dropdown to close it
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const totalPassengers =
    initialCount.adults + initialCount.children + initialCount.infants;

  const toggleDropdown = () => {
    console.log('Toggle dropdown', !open);
    setOpen(!open);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'flex flex-col w-full h-full px-2 md:px-4 py-1.5 cursor-pointer',
            !insideBorder && 'border border-gray-300 rounded-md transition-all',
            'min-h-[4.375rem]'
          )}
        >
          <label className="label-l1 text-neutral-dark">
            Passengers & Class
          </label>
          <div className="flex flex-col flex-grow justify-center">
            <span
              className="title-t4 text-background-on  leading-tight"
              style={{ lineHeight: '1.2' }}
            >
              {totalPassengers}{' '}
              {totalPassengers === 1 ? 'Passenger,' : 'Passengers,'}
            </span>
            <span
              className="text-background-on title-t4"
              style={{ lineHeight: '1.2' }}
            >
              {cabinClass === 'ECONOMY'
                ? 'Economy'
                : cabinClass === 'BUSINESS'
                ? 'Business'
                : 'First'}
            </span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-4"
        align="center"
        side="bottom"
        sideOffset={5}
        avoidCollisions={false}
      >
        {/* Passenger Types */}
        <div className="space-y-5">
          {/* Adults */}
          <div className="flex items-center justify-between">
            <div>
              <div className="label-l1 text-background-on">Adults</div>
              <div className="label-l3 text-neutral-dark">Age 12+</div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full hover:bg-blue-100 active:bg-[#5143d9] active:text-white transition-colors"
                onClick={() => updateCount('adults', -1)}
                disabled={initialCount.adults <= 1}
              >
                <Minus className="h-3 w-3" />
                <span className="sr-only">Decrease adults</span>
              </Button>
              <span className="w-5 text-center label-l1 text-background-on">
                {initialCount.adults}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full hover:bg-blue-100 active:text-primary active:bg-[#5143d9] transition-colors"
                onClick={() => updateCount('adults', 1)}
                disabled={
                  initialCount.adults >= 7 ||
                  initialCount.adults +
                    initialCount.children +
                    initialCount.infants >=
                    7
                }
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">Increase adults</span>
              </Button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <div>
              <div className="label-l1 text-background-on">Children</div>
              <div className="label-l3 text-neutral-dark">Ages 2-11</div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full hover:bg-blue-100 active:bg-[#5143d9] active:text-white transition-colors"
                onClick={() => updateCount('children', -1)}
                disabled={initialCount.children <= 0}
              >
                <Minus className="h-3 w-3" />
                <span className="sr-only">Decrease children</span>
              </Button>
              <span className="w-5 text-center label-l1 text-background-on">
                {initialCount.children}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full hover:bg-blue-100 active:bg-[#5143d9] active:text-white transition-colors"
                onClick={() => updateCount('children', 1)}
                disabled={
                  initialCount.adults +
                    initialCount.children +
                    initialCount.infants >=
                  7
                }
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">Increase children</span>
              </Button>
            </div>
          </div>

          {/* Infants */}
          <div className="flex items-center justify-between">
            <div>
              <div className="label-l1 text-background-on">Infants</div>
              <div className="label-l3 text-neutral-dark">Under 2</div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full hover:bg-blue-100 active:bg-[#5143d9] active:text-white transition-colors"
                onClick={() => updateCount('infants', -1)}
                disabled={initialCount.infants <= 0}
              >
                <Minus className="h-3 w-3" />
                <span className="sr-only">Decrease infants</span>
              </Button>
              <span className="w-5 text-center label-l1 text-background-on">
                {initialCount.infants}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full hover:bg-blue-100 active:bg-[#5143d9] active:text-white transition-colors"
                onClick={() => updateCount('infants', 1)}
                disabled={
                  initialCount.infants >= initialCount.adults ||
                  initialCount.adults +
                    initialCount.children +
                    initialCount.infants >=
                    7
                }
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">Increase infants</span>
              </Button>
            </div>
          </div>

          {/* Cabin Class */}
          <div className="space-y-1">
            <div className="label-l1 text-background-on">Cabin Class</div>
            <Select value={cabinClass} onValueChange={handleCabinClassChange}>
              <SelectTrigger className="w-full label-l1 text-background-on min-h-[48px]">
                <SelectValue placeholder="Select cabin class" />
              </SelectTrigger>
              <SelectContent className="label-l1 text-background-on">
                <SelectItem value="ECONOMY">Economy</SelectItem>
                <SelectItem value="BUSINESS">Business</SelectItem>
                <SelectItem value="FIRST">First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nepalese Citizenship */}
          {/* <div className="pt-2 border-t border-gray-200 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNepaleseCitizen}
                onChange={handleCitizenshipChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium">Nepalese Citizenship?</span>
            </label>
          </div> */}
        </div>

        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            onClick={() => setOpen(false)}
            className="bg-primary hover:bg-primary-variant text-primary-on label-l1 py-1 px-3"
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
