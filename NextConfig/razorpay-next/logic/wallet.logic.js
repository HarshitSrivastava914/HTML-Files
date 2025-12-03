// /logic/wallet.logic.js

/**
 * Builds the Razorpay config instrument block for Wallet.
 * @param {Array<{method: string, type: string}>} selected - Array of selected checkboxes.
 * @returns {object | null} The wallet config object or null.
 */
export function buildWalletConfig(selected) {
  const wallets = selected
    .filter((s) => s.method === "wallet")
    .map((s) => s.type);

  // Return null if no wallets are selected
  if (!wallets.length) return null;

  return { method: "wallet", wallets };
}
