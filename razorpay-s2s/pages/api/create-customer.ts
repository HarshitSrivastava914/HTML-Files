import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { name, email, contact } = req.body;

    const response = await axios.post(
      "https://api.razorpay.com/v1/customers",
      { name, email, contact, fail_existing: "0" },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID!,
          password: process.env.RAZORPAY_KEY_SECRET!,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(response.data);
    console.log(response.data);
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
}
