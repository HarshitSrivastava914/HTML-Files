import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { order_id, email, contact, card, customer_id } = req.body;

    const response = await axios.post(
      "https://api.razorpay.com/v1/payments/create/json",
      {
        amount: "500",
        currency: "INR",
        order_id,
        recurring: "1",
        email,
        customer_id,
        contact,
        method: "card",
        card,
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID!,
          password: process.env.RAZORPAY_KEY_SECRET!,
        },
        headers: {
          "Content-Type": "application/json",
          //   ...(process.env.RAZORPAY_ACCOUNT_ID && {
          //     "X-Razorpay-Account": process.env.RAZORPAY_ACCOUNT_ID,
          //   }),
        },
      }
    );

    res.status(200).json(response.data);
    console.log(order_id);
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
}
