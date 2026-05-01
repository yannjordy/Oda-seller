'use client';

/**
 * Utility for handling the Badge API to show counts on the app icon
 * Supported in Chrome, Edge, Opera on Android and desktop
 * Not supported in Firefox or Safari (as of 2024)
 */

/**
 * Sets the badge count on the app icon
 * @param {number|null} count - The number to show, or null to clear the badge
 */
export function setBadgeCount(count) {
  if (!('setAppBadge' in navigator)) {
    // Badge API not supported in this browser
    return false;
  }

  try {
    if (count === null || count === 0) {
      navigator.clearAppBadge();
    } else {
      // Cap the count at 99 for better UX (common practice)
      const displayCount = count > 99 ? 99 : count;
      navigator.setAppBadge(displayCount);
    }
    return true;
  } catch (error) {
    console.warn('Failed to set app badge:', error);
    return false;
  }
}

/**
 * Gets the current badge count (not widely supported, mainly for completeness)
 * @returns {Promise<number>} The current badge count
 */
export async function getBadgeCount() {
  if (!('getAppBadge' in navigator)) {
    return 0;
  }

  try {
    return await navigator.getAppBadge();
  } catch (error) {
    console.warn('Failed to get app badge:', error);
    return 0;
  }
}

export default {
  setBadgeCount,
  getBadgeCount
};