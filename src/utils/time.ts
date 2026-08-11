/**
 * Checks if a restaurant is currently open based on an opening hours string.
 * Supports formats like "08:00 - 22:00", "08:00–22:00", "18:00 ás 02:00", "24h", etc.
 */
export function isRestaurantOpenNow(openingHoursStr: string, customDate?: Date): boolean {
  if (!openingHoursStr) return false;
  
  const cleanStr = openingHoursStr.toLowerCase().trim();
  if (cleanStr.includes('24h') || cleanStr.includes('24 horas')) return true;

  // Extract time patterns like 08:00 or 8:00
  const timeRegex = /(\d{1,2})[:h](\d{2})/g;
  const matches = [...cleanStr.matchAll(timeRegex)];

  if (matches.length < 2) {
    return false; // Unable to parse open/close time
  }

  const startHour = parseInt(matches[0][1], 10);
  const startMin = parseInt(matches[0][2], 10);
  const endHour = parseInt(matches[1][1], 10);
  const endMin = parseInt(matches[1][2], 10);

  if (
    isNaN(startHour) || isNaN(startMin) ||
    isNaN(endHour) || isNaN(endMin) ||
    startHour < 0 || startHour > 23 || startMin < 0 || startMin > 59 ||
    endHour < 0 || endHour > 23 || endMin < 0 || endMin > 59
  ) {
    return false;
  }

  const now = customDate || new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = startHour * 60 + startMin;
  const closeMinutes = endHour * 60 + endMin;

  if (openMinutes === closeMinutes) {
    // 24 hours
    return true;
  }

  if (openMinutes < closeMinutes) {
    // Standard daytime range (e.g., 08:00 - 22:00)
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  } else {
    // Overnight range (e.g., 18:00 - 02:00)
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }
}

/**
 * Formats currency values nicely in BRL (R$)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}
