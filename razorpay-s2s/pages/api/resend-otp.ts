// File: /pages/api/resend-otp.ts

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing `url` in request body" });
  }

  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString("base64");

  try {
    const razorpayResponse = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      return res.status(razorpayResponse.status).json({ error: data });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("OTP Resend Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
