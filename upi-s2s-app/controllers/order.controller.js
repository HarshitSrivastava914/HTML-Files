import { razorpayClient } from "../config/razorpay.js";

export const createOrder = async (req, res) => {
  try {
    const order = await razorpayClient.post("/orders", {
      amount: req.body.amount,
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });

    res.json(order.data);
  } catch (err) {
    res.status(400).json(err.response.data);
  }
};
