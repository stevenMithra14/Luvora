/**
 * Utility functions for identifying occasion types and calculating occasion-specific metrics.
 */

export interface FriendshipCountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isAnniversaryToday: boolean;
  isMissingOrInvalid: boolean;
  yearsKnown?: number;
  targetAnniversary?: Date;
  formattedAnniversaryDate?: string;
  formattedFirstMetDate?: string;
}

/**
 * Returns true strictly if the given occasion corresponds to Friendship Celebration.
 */
export const isFriendshipOccasion = (occasion?: string | null): boolean => {
  if (!occasion) return false;
  const o = occasion.trim().toLowerCase();
  return (
    o === 'friendship' ||
    o === 'friendship_celebration' ||
    o === 'friendship celebration' ||
    o.includes('friendship')
  );
};

/**
 * Safely formats a stored date string for display in the UI.
 */
export const formatFirstMetDate = (
  dateStr?: string | null,
  dontKnowYear: boolean = false
): string | null => {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) {
    return null;
  }
  try {
    const cleanStr = dateStr.trim();
    const match = cleanStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    let dateObj: Date;

    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      dateObj = new Date(year, month, day);
    } else {
      dateObj = new Date(cleanStr);
    }

    if (isNaN(dateObj.getTime())) return null;

    if (dontKnowYear) {
      return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
};

/**
 * Calculates the next yearly anniversary of the date the friends first met.
 * Handles leap years (Feb 29), varying month lengths, and uses the recipient's local timezone.
 */
export const calculateFriendshipAnniversary = (
  dateStr?: string | null
): FriendshipCountdownResult => {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isAnniversaryToday: false,
      isMissingOrInvalid: true,
    };
  }

  const cleanStr = dateStr.trim();
  const match = cleanStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);

  let year: number;
  let month: number; // 1-12
  let day: number;   // 1-31

  if (match) {
    year = parseInt(match[1], 10);
    month = parseInt(match[2], 10);
    day = parseInt(match[3], 10);
  } else {
    const d = new Date(cleanStr);
    if (isNaN(d.getTime())) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isAnniversaryToday: false,
        isMissingOrInvalid: true,
      };
    }
    year = d.getFullYear();
    month = d.getMonth() + 1;
    day = d.getDate();
  }

  // Recipient local time
  const now = new Date();
  const currentYear = now.getFullYear();

  // Helper to get maximum valid days in the given month and year (handles leap years!)
  const getSafeDayInMonth = (y: number, m: number, targetDay: number): number => {
    // day 0 of month (m is 1-indexed) gets last day of month m
    const maxDays = new Date(y, m, 0).getDate();
    return Math.min(targetDay, maxDays);
  };

  const safeDayThisYear = getSafeDayInMonth(currentYear, month, day);

  // Check if today is the anniversary day
  const isAnniversaryToday =
    now.getFullYear() >= year &&
    now.getMonth() === month - 1 &&
    now.getDate() === safeDayThisYear;

  const firstMetObj = new Date(year, month - 1, day);
  const formattedFirstMetDate = !isNaN(firstMetObj.getTime())
    ? firstMetObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : undefined;

  if (isAnniversaryToday) {
    const yearsKnown = Math.max(1, currentYear - year);
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isAnniversaryToday: true,
      isMissingOrInvalid: false,
      yearsKnown,
      formattedFirstMetDate,
    };
  }

  // Target anniversary calculation
  const thisYearMidnight = new Date(currentYear, month - 1, safeDayThisYear, 0, 0, 0, 0);
  let targetYear = currentYear;

  // If this year's anniversary midnight is already in the past, target next year
  if (now.getTime() > thisYearMidnight.getTime()) {
    targetYear = currentYear + 1;
  }

  const safeDayTargetYear = getSafeDayInMonth(targetYear, month, day);
  const targetAnniversary = new Date(targetYear, month - 1, safeDayTargetYear, 0, 0, 0, 0);

  const diffMs = Math.max(0, targetAnniversary.getTime() - now.getTime());
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  const yearsKnown = Math.max(1, targetYear - year);

  return {
    days,
    hours,
    minutes,
    seconds,
    isAnniversaryToday: false,
    isMissingOrInvalid: false,
    yearsKnown,
    targetAnniversary,
    formattedAnniversaryDate: targetAnniversary.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    formattedFirstMetDate,
  };
};
