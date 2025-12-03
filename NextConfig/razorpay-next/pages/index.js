"use client";

import { useEffect, useState } from "react";
// Assuming getPaymentMethods is correctly defined in /services/paymentMethods.service
import { getPaymentMethods } from "@/services/paymentMethods.service";
// Import the new CardConfiguration component
import CardConfiguration from "@/components/CardConfiguration.jsx";

export default function Home() {
  // Store methods available from the API (Card, Netbanking, etc.)
  const [availableMethods, setAvailableMethods] = useState([]);
  // Store methods selected by the user (e.g., ["card", "upi"])
  const [selectedMethods, setSelectedMethods] = useState([]);
  // State to manage loading status
  const [isLoading, setIsLoading] = useState(false);

  // --- State for Card Sub-selections (Complex Config) ---
  const [cardDetails, setCardDetails] = useState(null);
  const [selectedCardTypes, setSelectedCardTypes] = useState([]); // debit_card, credit_card, prepaid_card
  const [selectedCardSubtypes, setSelectedCardSubtypes] = useState([]); // consumer, business
  const [selectedNetworks, setSelectedNetworks] = useState([]); // VISA, MC, RUPAY

  // Load Razorpay script only on component mount
  useEffect(() => {
    loadPaymentScript();
  }, []);

  function loadPaymentScript() {
    if (document.getElementById("razorpay-script")) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.id = "razorpay-script";
    script.async = true;

    document.body.appendChild(script);
  }

  // Fetch methods from API and convert to a simple array of methods
  async function loadMethods() {
    setIsLoading(true);
    setAvailableMethods([]); // Clear previous methods
    setSelectedMethods([]); // Clear previous selections
    setCardDetails(null); // Clear previous card details
    setSelectedCardTypes([]);
    setSelectedCardSubtypes([]);
    setSelectedNetworks([]);

    try {
      // NOTE: Using a timeout here to simulate network delay for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const apiResponse = await getPaymentMethods();
      const methods = [];

      // Function to check if a response value is considered available
      const checkAvailability = (response) => {
        // 1. Check for empty array (e.g., wallet: [])
        if (Array.isArray(response) && response.length === 0) {
          return false;
        }
        // 2. Check for empty object (e.g., paylater: {})
        if (
          typeof response === "object" &&
          response !== null &&
          Object.keys(response).length === 0
        ) {
          return false;
        }
        // 3. General truthiness check (handles true, non-empty arrays/objects)
        return !!response;
      };

      // Only push top-level method names if they pass the availability check
      if (checkAvailability(apiResponse.card)) {
        methods.push({ name: "Card", type: "card" });
        // Store detailed card info for sub-UI rendering
        setCardDetails({
          types: {
            debit_card: apiResponse.debit_card,
            credit_card: apiResponse.credit_card,
            prepaid_card: apiResponse.prepaid_card,
          },
          subtypes: apiResponse.card_subtype,
          networks: apiResponse.card_networks,
        });
      }
      if (checkAvailability(apiResponse.netbanking))
        methods.push({ name: "Netbanking", type: "netbanking" });
      if (checkAvailability(apiResponse.wallet))
        methods.push({ name: "Wallet", type: "wallet" });
      if (checkAvailability(apiResponse.upi))
        methods.push({ name: "UPI", type: "upi" });
      if (checkAvailability(apiResponse.emi))
        methods.push({ name: "EMI", type: "emi" });
      if (checkAvailability(apiResponse.paylater))
        methods.push({ name: "Pay Later", type: "paylater" });
      if (checkAvailability(apiResponse.cardless_emi))
        methods.push({ name: "Cardless EMI", type: "cardless_emi" });

      setAvailableMethods(methods);
    } catch (error) {
      console.error("Failed to load payment methods:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Toggle selection state for a payment method
  function toggleMethod(type) {
    setSelectedMethods((prev) => {
      const isSelected = prev.includes(type);
      const newState = isSelected
        ? prev.filter((m) => m !== type)
        : [...prev, type];

      // If Card is deselected, clear all card sub-selections
      if (type === "card" && isSelected) {
        setSelectedCardTypes([]);
        setSelectedCardSubtypes([]);
        setSelectedNetworks([]);
      }
      return newState;
    });
  }

  // Open Razorpay Checkout with selected methods
  function payNow() {
    if (selectedMethods.length === 0) {
      console.warn("Please select at least one payment method.");
      return;
    }

    // 1. Build dynamic blocks based on selected methods
    const blocks = {};
    selectedMethods.forEach((methodType) => {
      const blockKey = methodType;
      const blockName =
        methodType.charAt(0).toUpperCase() + methodType.slice(1);

      let instruments;

      if (methodType === "card") {
        // --- Complex Card Logic Assembly ---
        const cardConfig = {
          method: "card",
        };

        // Add card types, subtypes, and networks only if they are selected
        if (selectedCardTypes.length > 0) cardConfig.types = selectedCardTypes;
        if (selectedCardSubtypes.length > 0)
          cardConfig.subtypes = selectedCardSubtypes;
        if (selectedNetworks.length > 0) cardConfig.networks = selectedNetworks;

        // If card is selected but NO sub-options are picked, use a default simple block {method: 'card'}
        // If ANY sub-option is picked, use the constructed cardConfig.
        if (
          selectedCardTypes.length === 0 &&
          selectedNetworks.length === 0 &&
          selectedCardSubtypes.length === 0
        ) {
          instruments = [{ method: methodType }];
        } else {
          instruments = [cardConfig];
        }
      } else {
        // --- Simple Logic for Non-Card Methods ---
        instruments = [{ method: methodType }];
      }

      blocks[blockKey] = {
        name: `Pay via ${blockName}`,
        instruments: instruments,
      };
    });

    // 2. Format the sequence as required: ['block.card', 'block.upi', ...]
    const sequence = selectedMethods.map((m) => `block.${m}`);

    // 3. Assemble the final config object in the requested structure
    const config = {
      display: {
        blocks,
        sequence,
        preferences: {
          show_default_blocks: false,
        },
      },
    };

    console.log("Razorpay Config:", JSON.stringify(config, null, 2));

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyHere",
      amount: "1000000",
      currency: "INR",
      name: "Razorpay Demo",
      description: "Custom Payment Flow",
      config: config,
      handler: (response) => {
        console.log("Payment ID: " + response.razorpay_payment_id);
      },
      modal: {
        ondismiss: () => console.log("Checkout closed by user"),
      },
    };

    if (typeof Razorpay !== "undefined") {
      const rzp = new Razorpay(options);
      rzp.open();
    } else {
      console.error("Razorpay script not loaded. Cannot open checkout.");
    }
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2
        style={{
          borderBottom: "2px solid #eee",
          paddingBottom: "10px",
          marginBottom: "20px",
        }}
      >
        Custom Checkout Block Demo
      </h2>

      {availableMethods.length === 0 && (
        <button
          onClick={loadMethods}
          disabled={isLoading}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            background: isLoading ? "#aaa" : "#1976D2", // Blue
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "background 0.3s ease",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          {isLoading
            ? "Fetching Methods..."
            : "Fetch Available Payment Methods"}
        </button>
      )}

      {/* Conditionally render method buttons after fetch */}
      {availableMethods.length > 0 && (
        <>
          <h3 style={{ marginBottom: "15px" }}>
            Step 1: Select Methods to Display
          </h3>
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "10px",
            }}
          >
            {availableMethods.map((method) => (
              <button
                key={method.type}
                style={{
                  padding: "10px 20px",
                  background: selectedMethods.includes(method.type)
                    ? "#4caf50" // Selected: Green
                    : "#2196F3", // Default: Light Blue
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                  boxShadow: selectedMethods.includes(method.type)
                    ? "0 2px 4px rgba(0, 150, 0, 0.4)"
                    : "none",
                }}
                onClick={() => toggleMethod(method.type)}
              >
                {method.name}
              </button>
            ))}
          </div>

          {/* Render Card Sub-configuration UI if 'card' is selected */}
          {selectedMethods.includes("card") && cardDetails && (
            <CardConfiguration
              details={cardDetails}
              selectedTypes={selectedCardTypes}
              setSelectedTypes={setSelectedCardTypes}
              selectedSubtypes={selectedCardSubtypes}
              setSelectedSubtypes={setSelectedCardSubtypes}
              selectedNetworks={selectedNetworks}
              setSelectedNetworks={setSelectedNetworks}
            />
          )}

          <h3 style={{ marginTop: "30px", marginBottom: "15px" }}>
            Step 2: Launch Checkout
          </h3>
          <div>
            <button
              onClick={payNow}
              disabled={selectedMethods.length === 0}
              style={{
                padding: "12px 30px",
                fontSize: "18px",
                background: selectedMethods.length === 0 ? "#aaa" : "#FF5722", // Orange Pay button
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor:
                  selectedMethods.length === 0 ? "not-allowed" : "pointer",
                transition: "background 0.3s ease",
                boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
              }}
            >
              Pay Now (Open Checkout)
            </button>
          </div>
        </>
      )}

      {/* Display current config for debugging */}
      {selectedMethods.length > 0 && (
        <div
          style={{
            marginTop: "40px",
            paddingTop: "20px",
            borderTop: "1px dashed #ddd",
          }}
        >
          <h3 style={{ color: "#333" }}>Generated Config Payload:</h3>
          <pre
            style={{
              background: "#f4f4f4",
              padding: "15px",
              borderRadius: "8px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              maxHeight: "300px",
            }}
          >
            {JSON.stringify(
              {
                display: {
                  blocks: selectedMethods.reduce((acc, m) => {
                    const blockName = m.charAt(0).toUpperCase() + m.slice(1);
                    let instruments = [{ method: m }];

                    if (m === "card") {
                      // Assemble the card config for display only
                      instruments = [
                        {
                          method: "card",
                          ...(selectedCardTypes.length > 0 && {
                            types: selectedCardTypes,
                          }),
                          ...(selectedCardSubtypes.length > 0 && {
                            subtypes: selectedCardSubtypes,
                          }),
                          ...(selectedNetworks.length > 0 && {
                            networks: selectedNetworks,
                          }),
                        },
                      ];
                    }

                    acc[m] = {
                      name: `Pay via ${blockName}`,
                      instruments: instruments,
                    };
                    return acc;
                  }, {}),
                  sequence: selectedMethods.map((m) => `block.${m}`),
                  preferences: { show_default_blocks: false },
                },
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
