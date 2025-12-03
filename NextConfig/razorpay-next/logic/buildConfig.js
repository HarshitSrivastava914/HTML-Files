import { buildWalletConfig } from "./wallet.logic";
import { buildUpiConfig } from "./upi.logic";
import { buildNetbankingConfig } from "./netbanking.logic";
import { buildCardConfig } from "./card.logic";
import { buildEmiConfig } from "./emi.logic";
import { buildPayLaterConfig } from "./paylater.logic";
import { buildCardlessEmiConfig } from "./cardlessEmi.logic";

export function buildConfigFromUI() {
  // get all selected checkboxes
  const selected = Array.from(
    document.querySelectorAll("input[type='checkbox']:checked")
  ).map((cb) => ({
    method: cb.dataset.method,
    type: cb.dataset.type,
  }));

  // get BIN inputs
  const cardBins = document.querySelector('input[data-bin-for="cards"]')?.value;
  const netBins = document.querySelector(
    'input[data-bin-for="netbanking"]'
  )?.value;

  // get card type + network
  const cardType = document.querySelector(
    "input[name='cardType']:checked"
  )?.value;
  const cardTypes = cardType === "both" ? ["debit", "credit"] : [cardType];

  const networks = Array.from(
    document.querySelectorAll("input[data-method='card']:checked")
  ).map((n) => n.dataset.type);

  // assemble
  const instruments = [
    buildWalletConfig(selected),
    buildUpiConfig(selected),
    buildNetbankingConfig(selected, netBins),
    buildCardConfig(selected, cardBins, cardTypes, networks),
    buildEmiConfig(selected),
    buildPayLaterConfig(selected),
    buildCardlessEmiConfig(selected),
  ].filter(Boolean);

  return {
    display: {
      blocks: {
        custom: {
          name: "Payment Methods",
          instruments,
        },
      },
      sequence: ["block.custom"],
      preferences: { show_default_blocks: false },
    },
  };
}
