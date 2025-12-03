// /logic/card.logic.js

/**
 * Builds the Razorpay config instrument block for Card payments.
 * @param {Array<string>} selectedCardTypes - Array of selected card types (e.g., ["debit_card", "credit_card", "prepaid_card"]).
 * @param {Array<string>} selectedCardSubtypes - Array of selected card subtypes (e.g., ["consumer", "business"]).
 * @param {Array<string>} selectedNetworks - Array of selected card networks (e.g., ["VISA", "MC"]).
 * @param {string} cardBins - Comma-separated BINs string.
 * @returns {object | null} The card config object or null.
 */
export function buildCardConfig(
  selectedCardTypes,
  selectedCardSubtypes,
  selectedNetworks,
  cardBins = ""
) {
  // If no specific types or networks are selected, we skip generating the custom card block.
  if (selectedCardTypes.length === 0 && selectedNetworks.length === 0)
    return null;

  const config = {
    method: "card",
    // 'types' in the config corresponds to card types (debit_card, credit_card, etc.)
    types: selectedCardTypes,
  };

  // Add networks if selected
  if (selectedNetworks && selectedNetworks.length > 0) {
    config.networks = selectedNetworks;
  }

  // Add subtypes (consumer, business, etc.)
  if (selectedCardSubtypes && selectedCardSubtypes.length > 0) {
    config.subtypes = selectedCardSubtypes;
  }

  // Add IINs (BINs) if provided and valid
  if (cardBins) {
    const binList = cardBins
      .split(",")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);
    if (binList.length > 0) {
      config.iins = binList;
    }
  }

  return config;
}
