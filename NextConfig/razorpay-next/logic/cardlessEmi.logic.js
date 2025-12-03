// /logic/cardlessEmi.logic.js

/**
 * Builds the Razorpay config instrument block for Cardless EMI.
 * @param {Array<{method: string, type: string}>} selected - Array of selected checkboxes.
 * @returns {object | null} The Cardless EMI config object or null.
 */
export function buildCardlessEmiConfig(selected) {
  const providers = selected
    .filter((s) => s.method === "cardless_emi")
    .map((s) => s.type);

  // Return null if no providers are selected
  if (!providers.length) return null;

  return { method: "cardless_emi", providers };
}
