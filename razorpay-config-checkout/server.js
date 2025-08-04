// server.js
const express = require("express");
const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors()); // enable frontend access
app.use(bodyParser.json());
app.use(express.static("public"));

// Razorpay instance
const razorpay = new Razorpay({
  key_id: "rzp_live_Z0UOREZiFYcSqz",
  key_secret: "cqxvuwfrtpMtek9ddfhPdIQb",
});

// Route: Create Razorpay Order
app.post("/create-order", async (req, res) => {
  const { amount, currency } = req.body;

  const options = {
    amount: amount * 100, // ₹1 = 100 paise
    currency: currency || "INR",
    receipt: "rcpt_" + Math.random().toString(36).substr(2, 9),
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Order creation failed", details: err });
  }
});

// ✅ New Route: Get Supported Payment Methods
const axios = require("axios");

app.get("/methods", async (req, res) => {
  try {
    const response = await axios.get("https://api.razorpay.com/v1/methods", {
      auth: {
        username: "rzp_live_Z0UOREZiFYcSqz",
        //password: "cqxvuwfrtpMtek9ddfhPdIQb",
      },
    });

    res.json(response.data);
    console.log(response.data);
  } catch (err) {
    console.error("Error fetching methods:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to fetch payment methods",
      details: err.response?.data || err.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
