// /logic/paylater.logic.js

/**
 * Builds the Razorpay config instrument block for Pay Later.
 * @param {Array<{method: string, type: string}>} selected - Array of selected checkboxes.
 * @returns {object | null} The Pay Later config object or null.
 */
export function buildPayLaterConfig(selected) {
  const providers = selected
    .filter((s) => s.method === "paylater")
    .map((s) => s.type);

  // Return null if no providers are selected
  if (!providers.length) return null;

  return { method: "paylater", providers };
}
