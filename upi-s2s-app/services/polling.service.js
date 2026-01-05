import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const pollPaymentStatus = async (pollUrl) => {
  try {
    const res = await axios.get(pollUrl, {
      auth: {
        username: process.env.RAZORPAY_KEY_ID,
        password: process.env.RAZORPAY_KEY_SECRET,
      },
    });
    return res.data;
  } catch (err) {
    return { error: true, details: err.response?.data };
  }
};
