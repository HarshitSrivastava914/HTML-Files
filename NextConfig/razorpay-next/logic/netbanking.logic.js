// /logic/netbanking.logic.js

/**
 * Builds the Razorpay config instrument block for Netbanking.
 * @param {Array<{method: string, type: string}>} selected - Array of selected checkboxes.
 * @param {string} bins - Comma-separated BINs string.
 * @returns {object | null} The netbanking config object or null.
 */
export function buildNetbankingConfig(selected, bins = "") {
  const banks = selected
    .filter((s) => s.method === "netbanking")
    .map((s) => s.type);

  // Return null if no banks are selected
  if (!banks.length) return null;

  const config = { method: "netbanking", banks };

  // Add IINs (BINs) if provided
  if (bins) {
    config.iins = bins
      .split(",")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);
  }

  return config;
}
