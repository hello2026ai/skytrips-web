import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { DateRangePicker } from './DateRangePicker';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  format: (date: Date, fmt: string) => {
    if (fmt === 'dd/MM/yyyy') return '01/01/2024'; // Mock output
    return jest.requireActual('date-fns').format(date, fmt);
  },
}));

// Mock react-day-picker if needed, but we probably want to test interaction with it
// Since we don't have a full DOM environment, we might need to mock some things if they fail.

describe('DateRangePicker', () => {
  it('opens calendar automatically when switching from one-way to round trip', () => {
    const handleChange = jest.fn();
    
    // Initial render: One-way
    const { rerender } = render(
      <DateRangePicker 
        onChange={handleChange} 
        tripType="one-way" 
        defaultToRoundTrip={false}
      />
    );

    // Assert calendar is not visible initially
    // Since it uses portal, we look in document.body
    // The dropdown has text "Round Trip" in the radio button label
    const dropdownText = screen.queryByText('Round Trip');
    expect(dropdownText).not.toBeInTheDocument();

    // Switch to Round Trip
    rerender(
      <DateRangePicker 
        onChange={handleChange} 
        tripType="round" 
        defaultToRoundTrip={false}
      />
    );

    // Assert calendar is now visible
    // We expect the "Round Trip" text (from the radio button inside the dropdown) to be present
    const visibleDropdownText = screen.getByText('Round Trip');
    expect(visibleDropdownText).toBeInTheDocument();
    
    // Also check if the double calendar is visible (by checking a class or element specific to it)
    // The double calendar wrapper has class "visible" when tripType is round
    // But since we are testing visibility via existence in the DOM (because conditional rendering might be involved?)
    // Actually, the portal content is conditionally rendered {open && ...}
    // So if it's in the document, it's open.
  });
});
