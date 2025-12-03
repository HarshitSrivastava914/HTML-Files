"use client";
import React from "react";

/**
 * Renders the sub-selection UI for Card configurations.
 * * @param {object} props
 * @param {object} props.details - The card details (types, subtypes, networks) from the API response.
 * @param {Array<string>} props.selectedTypes - Current array of selected card types (e.g., debit_card).
 * @param {Function} props.setSelectedTypes - Setter for selected card types.
 * @param {Array<string>} props.selectedSubtypes - Current array of selected card subtypes (e.g., consumer).
 * @param {Function} props.setSelectedSubtypes - Setter for selected card subtypes.
 * @param {Array<string>} props.selectedNetworks - Current array of selected card networks (e.g., VISA).
 * @param {Function} props.setSelectedNetworks - Setter for selected card networks.
 */
export default function CardConfiguration({
  details,
  selectedTypes,
  setSelectedTypes,
  selectedSubtypes,
  setSelectedSubtypes,
  selectedNetworks,
  setSelectedNetworks,
}) {
  // Helper to render label strings correctly (e.g., debit_card -> Debit Card)
  const formatLabel = (text) =>
    text.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  // Toggle selection for Card sub-options
  const toggleSelection = (setter, value) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const renderOptions = (title, options, selectedState, setter) => (
    <div
      style={{
        marginBottom: "15px",
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "5px",
      }}
    >
      <h4 style={{ marginBottom: "10px", fontSize: "14px", color: "#555" }}>
        {title}
      </h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {Object.entries(options).map(([key, value]) =>
          // Only render if the value is truthy (true or 1)
          value ? (
            <label
              key={key}
              style={{
                padding: "8px 12px",
                border: selectedState.includes(key)
                  ? "2px solid #4caf50"
                  : "1px solid #ccc",
                borderRadius: "5px",
                cursor: "pointer",
                backgroundColor: selectedState.includes(key)
                  ? "#e8f5e9"
                  : "#fff",
                fontSize: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <input
                type="checkbox"
                checked={selectedState.includes(key)}
                onChange={() => toggleSelection(setter, key)}
                style={{ marginRight: "5px" }}
              />
              {formatLabel(key)}
            </label>
          ) : null
        )}
      </div>
    </div>
  );

  return (
    <div
      style={{
        marginTop: "15px",
        padding: "15px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        borderLeft: "4px solid #4caf50",
      }}
    >
      <h3 style={{ marginBottom: "15px", fontSize: "16px", color: "#333" }}>
        Card Options (Fine-Tuning)
      </h3>

      {/* Card Types (debit_card, credit_card, prepaid_card) */}
      {renderOptions(
        "Allowed Card Types",
        details.types,
        selectedTypes,
        setSelectedTypes
      )}

      {/* Card Subtypes (consumer, business, premium) */}
      {renderOptions(
        "Allowed Card Subtypes",
        details.subtypes,
        selectedSubtypes,
        setSelectedSubtypes
      )}

      {/* Card Networks (VISA, MC, RUPAY, etc.) */}
      {renderOptions(
        "Allowed Card Networks",
        details.networks,
        selectedNetworks,
        setSelectedNetworks
      )}
    </div>
  );
}
