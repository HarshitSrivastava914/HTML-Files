require("dotenv").config();
const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Razorpay Basic Auth header
const auth = {
  username: KEY_ID,
  password: KEY_SECRET,
};

console.log("Starting server with Razorpay KEY_ID:", KEY_ID);

// 1. Create Plan API
app.post("/create-plan", async (req, res) => {
  console.log("\n[Create Plan] Request received");
  try {
    const planData = {
      period: "monthly",
      interval: 1,
      item: {
        name: "Test Monthly Plan",
        amount: 1000, // 500.00 INR (amount is in paise)
        currency: "SGD",
        description: "Monthly subscription plan",
      },
      notes: {
        notes_key_1: "Tea, Earl Grey, Hot",
        notes_key_2: "Subscription plan notes",
      },
    };

    console.log("[Create Plan] Sending request to Razorpay API:", planData);
    const response = await axios.post(
      "https://api.razorpay.com/v1/plans",
      planData,
      { auth }
    );
    console.log("[Create Plan] Razorpay response:", response.data);

    return res.json(response.data);
  } catch (error) {
    console.error(
      "[Create Plan] Error response from Razorpay:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "Failed to create plan" });
  }
});

// 2. Create Subscription API
app.post("/create-subscription", async (req, res) => {
  console.log("\n[Create Subscription] Request received:", req.body);
  try {
    const { plan_id } = req.body;
    if (!plan_id) {
      console.warn("[Create Subscription] Missing plan_id");
      return res.status(400).json({ error: "plan_id is required" });
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);

    const subscriptionData = {
      plan_id,
      total_count: 6, // total billing cycles
      quantity: 1,
      customer_notify: 1,
      //start_at: nowInSeconds + 30, // start 30 seconds from now
      notes: {
        notes_key_1: "Subscription note 1",
        notes_key_2: "Subscription note 2",
      },
    };

    console.log(
      "[Create Subscription] Sending request to Razorpay API:",
      subscriptionData
    );
    const response = await axios.post(
      "https://api.razorpay.com/v1/subscriptions",
      subscriptionData,
      { auth }
    );

    console.log("[Create Subscription] Razorpay response:", response.data);
    return res.json(response.data);
  } catch (error) {
    console.error(
      "[Create Subscription] Error response from Razorpay:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "Failed to create subscription" });
  }
});

// 3. Endpoint to get subscription info
app.get("/subscription/:id", async (req, res) => {
  const subscriptionId = req.params.id;
  console.log("\n[Get Subscription] Request for ID:", subscriptionId);
  try {
    const response = await axios.get(
      `https://api.razorpay.com/v1/subscriptions/${subscriptionId}`,
      { auth }
    );
    console.log("[Get Subscription] Razorpay response:", response.data);
    return res.json(response.data);
  } catch (error) {
    console.error(
      "[Get Subscription] Error response from Razorpay:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "Subscription not found" });
  }
});

// 4. Verify payment signature
app.post("/verify-payment", (req, res) => {
  console.log("\n[Verify Payment] Request body:", req.body);
  const { razorpay_payment_id, razorpay_signature, subscription_id } = req.body;

  if (!razorpay_payment_id || !razorpay_signature || !subscription_id) {
    console.warn("[Verify Payment] Missing parameters");
    return res
      .status(400)
      .json({ success: false, message: "Missing parameters" });
  }

  const generated_signature = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(`${razorpay_payment_id}|${subscription_id}`)
    .digest("hex");

  console.log("[Verify Payment] Generated signature:", generated_signature);
  console.log("[Verify Payment] Razorpay signature:", razorpay_signature);

  if (generated_signature === razorpay_signature) {
    console.log("[Verify Payment] Signature verified SUCCESS");
    return res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } else {
    console.warn("[Verify Payment] Signature verification FAILED");
    return res
      .status(400)
      .json({ success: false, message: "Invalid signature" });
  }
});

app.listen(PORT, () => {
  console.log(`\nServer running on http://localhost:${PORT}`);
});
