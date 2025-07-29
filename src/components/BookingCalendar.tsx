"use client";

import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
// We no longer need 'format' from date-fns since we are not displaying a selection.

// --- Custom Hook to detect screen size (remains the same) ---
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);

  return matches;
}


// --- Component Starts Here ---

// The list of booked dates remains the same.
const bookedDates = [
  new Date(2025, 7, 8), // August 8, 2025
  new Date(2025, 7, 9),
  new Date(2025, 7, 10),
  { from: new Date(2025, 8, 18), to: new Date(2025, 8, 23) } // A booked range in September
];

export default function BookingCalendar() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const currentYear = new Date().getFullYear();

  return (
    <DayPicker
      // --- HERE ARE THE CHANGES ---
      // By removing the `mode`, `selected`, and `onSelect` props,
      // the calendar becomes display-only. Clicks will do nothing.
      
      // We still disable past dates visually and functionally.
      disabled={{ before: new Date() }}
      
      // We still apply special styling to booked dates.
      modifiers={{ booked: bookedDates }}
      modifiersClassNames={{
        today: 'my-today',
        booked: 'my-booked',
      }}
      
      // All the navigation and display options remain.
      numberOfMonths={isDesktop ? 2 : 1}
      captionLayout="dropdown-years"
      fromYear={currentYear}
      toYear={currentYear + 5}
    />
  );
}
