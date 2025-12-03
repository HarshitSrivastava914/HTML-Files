// /logic/upi.logic.js

/**
 * Builds the Razorpay config instrument block for UPI.
 * @param {Array<{method: string, type: string}>} selected - Array of selected checkboxes.
 * @returns {object | null} The UPI config object or null if no UPI methods are selected.
 */
export function buildUpiConfig(selected) {
  const upiItems = selected.filter((s) => s.method === "upi");

  // Return null if no UPI options are selected
  if (!upiItems.length) return null;

  const collectSelected = upiItems.some((item) => item.type === "collect");
  const intentApps = upiItems
    .filter((item) => item.type !== "collect")
    .map((item) => item.type);

  // If only UPI Collect is selected
  if (collectSelected && !intentApps.length) {
    return { method: "upi" };
  }

  // If any UPI intent apps are selected (GPay, PhonePe, etc.)
  if (intentApps.length > 0) {
    return {
      method: "upi",
      flow: "intent",
      apps: intentApps,
    };
  }

  // Fallback for just 'collect' if it wasn't caught by the first check
  if (collectSelected) {
    return { method: "upi" };
  }

  return null;
}
