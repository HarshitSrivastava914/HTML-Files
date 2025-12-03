import axios from "axios";

export default async function handler(req, res) {
  try {
    const response = await axios.get("https://api.razorpay.com/v1/methods", {
      auth: {
        username: process.env.RAZORPAY_KEY_ID,
        //password: "cqxvuwfrtpMtek9ddfhPdIQb", // optional
      },
    });

    res.status(200).json(response.data);
    console.log(response.data);
  } catch (err) {
    console.error("Error fetching methods:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to fetch payment methods",
      details: err.response?.data || err.message,
    });
  }
}
