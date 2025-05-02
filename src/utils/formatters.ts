
/**
 * Format a number as currency (USD)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format a number as square footage
 */
export const formatSquareFeet = (sqft: number): string => {
  return `${sqft.toLocaleString()} sq ft`;
};
