// payment_and_signature_verification.js

const crypto = require("crypto");
const Razorpay = require("razorpay");
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// Razorpay API Configuration
const razorpayKeyId = "rzp_test_qHO5zWaf7OUAPm"; // Replace with your Razorpay Key ID
const razorpaySecretKey = "UyjqOzI0u61YS5lpwL4aJM9X"; // Replace with your Razorpay Secret Key

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpaySecretKey,
});

// Serve the payment page
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment</title>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>
  <button id="rzp-button1">Pay</button>
  <script>
    var options = {
      key: "${razorpayKeyId}", // Replace with your Razorpay Key ID
      amount: "100", // Amount in paise (50000 refers to ₹500)
      currency: "INR",
      order_id: "order_PsP7pB7cfRrZrr", // Replace with an actual Razorpay Order ID
      handler: function (response) {
        fetch("/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(response),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              alert("Payment successful and verified!");
            } else {
              alert("Payment verification failed!");
            }
          })
          .catch((error) => {
            console.error("Error verifying payment:", error);
          });
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
    };

    var rzp1 = new Razorpay(options);

    rzp1.on("payment.failed", function (response) {
      console.error("Payment Failed", response.error);
    });

    document.getElementById("rzp-button1").onclick = function (e) {
      rzp1.open();
      e.preventDefault();
    };
  </script>
</body>
</html>
  `);
});

// Verify payment signature
app.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  try {
    const generated_signature = crypto
      .createHmac("sha256", razorpaySecretKey)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    console.log("Razorpay Signature: " + razorpay_signature);
    console.log(" ");
    console.log("Generated Signature: " + generated_signature);

    if (generated_signature === razorpay_signature) {
      console.log("Payment verified successfully!");
      res.json({ success: true, message: "Payment verified successfully!" });
    } else {
      console.log("Payment verification failed!");
      res.json({ success: false, message: "Payment verification failed!" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Server error!" });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
