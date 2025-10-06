import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { amount, customer_id } = req.body;

    const response = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount, // ₹1.00
        currency: "INR",
        customer_id,
        method: "card",
        token: {
          max_amount: 100000000,
          expire_at: Math.floor(Date.now() / 1000) + 31536000, // 1 year
          frequency: "as_presented",
        },
        receipt: "receipt#1",
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
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
}
