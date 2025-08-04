const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (your HTML)
app.use(express.static("public"));

const razorpay = new Razorpay({
  key_id: "rzp_test_qHO5zWaf7OUAPm",
  key_secret: "UyjqOzI0u61YS5lpwL4aJM9X",
});

// Endpoint to create an order
app.post("/create-order", async (req, res) => {
  const options = {
    amount: 50000, // amount in paise = ₹500
    currency: "INR",
    receipt: "receipt_order_74394",
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Handle the callback
app.all("/callback", async (req, res) => {
  if (req.method === "POST") {
    console.log("✅ Received POST callback with body:", req.body);

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      error,
    } = req.body;

    // ✅ Always fallback to error.metadata.payment_id if normal ID is missing
    const paymentId = razorpay_payment_id || error?.metadata?.payment_id;
    const orderId = razorpay_order_id || error?.metadata?.order_id;

    if (!paymentId) {
      console.log("❌ No payment ID found in POST body or error metadata.");
      return res.status(400).send("Missing payment ID");
    }

    console.log("🔍 Fetching payment details for:", paymentId);

    try {
      const payment = await razorpay.payments.fetch(paymentId);
      console.log("💰 Fetched payment:", payment);

      if (payment.status === "captured") {
        console.log("✅ Payment is captured. Verifying signature...");

        if (!razorpay_signature) {
          console.log(
            "❌ No signature found for captured payment. Cannot verify!"
          );
          return res
            .status(400)
            .send("❌ No signature found for captured payment.");
        }

        const expectedSignature = crypto
          .createHmac("sha256", razorpay.key_secret)
          .update(`${orderId}|${paymentId}`)
          .digest("hex");

        console.log("🔒 Expected Signature:", expectedSignature);
        console.log("🔑 Received Signature:", razorpay_signature);

        if (expectedSignature === razorpay_signature) {
          console.log("✅ Signature verified. Payment is valid and captured.");
          res.send(`
              <h1>✅ Payment captured and verified!</h1>
              <p><strong>Payment ID:</strong> ${paymentId}</p>
              <p><strong>Order ID:</strong> ${orderId}</p>
            `);
        } else {
          console.log("❌ Invalid signature for captured payment!");
          res.status(400).send("❌ Invalid signature for captured payment!");
        }
      } else {
        console.log(
          `⚠️ Payment fetched but status is: ${payment.status}. Skipping signature check.`
        );
        res.send(`
            <h1>⚠️ Payment not captured</h1>
            <p>Status: ${payment.status}</p>
            <p>Payment ID: ${paymentId}</p>
            <p>Order ID: ${orderId}</p>
          `);
      }
    } catch (err) {
      console.error("❌ Error fetching payment:", err);
      res.status(500).send("Error fetching payment.");
    }
  } else if (req.method === "GET") {
    console.log("❌ Received GET callback with query:", req.query);

    const { error } = req.query;

    const paymentId = error?.metadata?.payment_id;
    const orderId = error?.metadata?.order_id;

    if (paymentId) {
      console.log(`🔍 Found payment ID in GET: ${paymentId}`);

      try {
        const payment = await razorpay.payments.fetch(paymentId);
        console.log("💰 Fetched payment in GET flow:", payment);

        if (payment.status === "captured") {
          console.log(
            "✅ Payment is captured in GET flow. Signature check not possible."
          );
          res.send(`
              <h1>✅ Payment is captured (GET flow)</h1>
              <p><strong>Payment ID:</strong> ${paymentId}</p>
              <p><strong>Order ID:</strong> ${orderId}</p>
            `);
        } else {
          console.log(`❌ Payment is NOT captured. Status: ${payment.status}`);
          res.send(`
              <h1>❌ Payment failed or incomplete</h1>
              <p><strong>Status:</strong> ${payment.status}</p>
              <p><strong>Payment ID:</strong> ${paymentId}</p>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Description:</strong> ${error.description || "N/A"}</p>
            `);
        }
      } catch (err) {
        console.error("❌ Error fetching payment in GET flow:", err);
        res.send(`
            <h1>❌ Payment failed</h1>
            <p>Could not fetch payment. Original error: ${JSON.stringify(
              error
            )}</p>
          `);
      }
    } else {
      console.log("❌ No payment ID found in GET query");
      res.send(`
          <h1>❌ Payment failed</h1>
          <p>No payment ID found in callback. Error: ${JSON.stringify(
            error
          )}</p>
        `);
    }
  } else {
    console.log(`⚠️ Method ${req.method} not allowed.`);
    res.status(405).send("Method not allowed");
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
