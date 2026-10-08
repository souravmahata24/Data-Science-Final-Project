/**
 * Standard Indian Rupee (₹) Number Formatting Utility.
 * Formats numbers into ₹, Lakhs, and Crores per Indian financial conventions.
 */

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₹0";
  }

  const isNeg = amount < 0;
  const val = Math.abs(amount);

  if (val >= 10000000) {
    const crores = val / 10000000;
    return `${isNeg ? "-" : ""}₹${crores.toFixed(2)} crore`;
  }

  if (val >= 100000) {
    const lakhs = val / 100000;
    return `${isNeg ? "-" : ""}₹${lakhs.toFixed(2)} lakh`;
  }

  // Format integer with standard Indian numbering grouping: last 3 digits, then pairs of 2
  const rounded = Math.round(val);
  const str = rounded.toString();

  if (str.length <= 3) {
    return `${isNeg ? "-" : ""}₹${str}`;
  }

  const lastThree = str.substring(str.length - 3);
  let otherNumbers = str.substring(0, str.length - 3);
  const chunks: string[] = [];

  while (otherNumbers.length > 2) {
    chunks.unshift(otherNumbers.substring(otherNumbers.length - 2));
    otherNumbers = otherNumbers.substring(0, otherNumbers.length - 2);
  }
  if (otherNumbers.length > 0) {
    chunks.unshift(otherNumbers);
  }

  const formatted = chunks.join(",") + "," + lastThree;
  return `${isNeg ? "-" : ""}₹${formatted}`;
}
