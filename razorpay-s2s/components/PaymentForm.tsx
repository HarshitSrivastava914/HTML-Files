// components/PaymentForm.tsx

"use client"; // Required only for App Router

import React, { useState } from "react";

export interface PaymentFormData {
  amount: number;
  name: string;
  email: string;
  contact: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardHolder: string;
}

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 5 * 100,
    name: "",
    email: "",
    contact: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardHolder: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Enter Customer & Card Details</h3>
      <input
        type="number"
        name="amount"
        placeholder="Enter amount"
        value={formData.amount}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="name"
        placeholder="Customer Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="tel"
        name="contact"
        placeholder="Contact Number"
        value={formData.contact}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="cardNumber"
        placeholder="Card Number"
        value={formData.cardNumber}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="expiryMonth"
        placeholder="Expiry Month (MM)"
        value={formData.expiryMonth}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="expiryYear"
        placeholder="Expiry Year (YY)"
        value={formData.expiryYear}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="cvv"
        placeholder="CVV"
        value={formData.cvv}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="cardHolder"
        placeholder="Cardholder Name"
        value={formData.cardHolder}
        onChange={handleChange}
        required
      />

      <button type="submit">Pay Now</button>
    </form>
  );
};

export default PaymentForm;
