const express = require("express");
const path = require("path");
const {
  createCustomer,
  createOrder,
  validateVPA,
  createAuthorizationPayment,
  pollPaymentStatus,
} = require("./razorpay");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/start-payment", async (req, res) => {
  try {
    const { vpa } = req.body;
    console.log(`\n📥 Received VPA from frontend: ${vpa}`);

    const customer = await createCustomer();
    const order = await createOrder(customer.id);
    await validateVPA(vpa);
    const payment = await createAuthorizationPayment({
      customer_id: customer.id,
      order_id: order.id,
      vpa,
    });

    const result = await pollPaymentStatus(payment.razorpay_payment_id);
    console.log("Printing result", result);

    if (result === "success") {
      res.json({ status: "Payment Successful ✅" });
    } else if (result === "failed") {
      res.json({ status: "Payment Failed ❌" });
    } else {
      res.json({ status: "Payment Timeout. Please try again ⏰" });
    }
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
