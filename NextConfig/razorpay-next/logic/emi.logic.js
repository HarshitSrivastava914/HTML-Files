// /logic/emi.logic.js

/**
 * Builds the Razorpay config instrument block for EMI.
 * @param {Array<{method: string, type: string}>} selected - Array of selected checkboxes.
 * @returns {object | null} The EMI config object or null.
 */
export function buildEmiConfig(selected) {
  const issuers = selected.filter((s) => s.method === "emi").map((s) => s.type);

  // Return null if no issuers are selected
  if (!issuers.length) return null;

  return { method: "emi", issuers };
}
