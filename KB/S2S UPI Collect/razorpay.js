const axios = require("axios");
require("dotenv").config();

const razorpay = axios.create({
  baseURL: "https://api.razorpay.com/v1",
  auth: {
    username: process.env.RAZORPAY_KEY_ID,
    password: process.env.RAZORPAY_KEY_SECRET,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

// 📦 Utility to log detailed request/response
async function logAndSend(label, endpoint, data) {
  const fullUrl = `https://api.razorpay.com/v1${endpoint}`;
  console.log(`\n==============================`);
  console.log(`📤 API REQUEST → ${label}`);
  console.log(`➡️  URL     : ${fullUrl}`);
  console.log(`➡️  Method  : POST`);
  console.log(`➡️  Headers : { Content-Type: application/json }`);
  console.log(`➡️  Payload :`);
  console.log(JSON.stringify(data, null, 2));
  console.log(`==============================`);

  const response = await razorpay.post(endpoint, data);

  console.log(`\n✅ API RESPONSE ← ${label}`);
  console.log(`⬅️  Status  : ${response.status} ${response.statusText}`);
  console.log(`⬅️  Data    :`);
  console.log(JSON.stringify(response.data, null, 2));
  console.log(`==============================\n`);

  return response.data;
}

// 🔹 Step 1: Create customer
async function createCustomer() {
  return await logAndSend("Create Customer", "/customers", {
    name: "Gaurav Kumar",
    email: "gaurav.kumar@example.com",
    contact: "9000090000",
    fail_existing: "0",
    notes: {
      note_key_1: "September",
      note_key_2: "Make it so.",
    },
  });
}

// 🔹 Step 2: Create order with unique receipt
async function createOrder(customer_id) {
  const uniqueReceipt = `receipt_${Date.now()}`;
  return await logAndSend("Create Order", "/orders", {
    amount: 1000, // ₹10.00
    currency: "INR",
    customer_id,
    method: "upi",
    receipt: uniqueReceipt,
    token: {
      max_amount: 200000, // ₹2000
      expire_at: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
      frequency: "as_presented",
    },
    notes: {
      notes_key_1: "Tea, Earl Grey, Hot",
      notes_key_2: "Tea, Earl Grey… decaf.",
    },
  });
}

// 🔹 Step 3: Validate VPA
async function validateVPA(vpa) {
  return await logAndSend("Validate VPA", "/payments/validate/vpa", { vpa });
}

// 🔹 Step 4: Create Authorization Payment
async function createAuthorizationPayment({ customer_id, order_id, vpa }) {
  return await logAndSend(
    "Create Authorization Payment",
    "/payments/create/upi",
    {
      amount: 1000,
      currency: "INR",
      order_id,
      email: "gaurav.kumar@example.com",
      contact: "9000090000",
      customer_id,
      recurring: "1",
      method: "upi",
      upi: {
        flow: "collect",
        vpa,
        // expiry_time: 5,
      },
      ip: "127.0.0.1",
      referer: "http://localhost",
      user_agent: "Mozilla/5.0",
      description: "Test flow",
      // save: true,
      // notes: {
      //   note_key: "value1",
      // },
    }
  );
}

// 🔹 Step 5: Poll payment status
async function pollPaymentStatus(payment_id) {
  const endpoint = `/payments/${payment_id}`;
  const fullUrl = `https://api.razorpay.com/v1${endpoint}`;

  console.log(`\n📡 Starting payment polling for payment_id: ${payment_id}`);
  for (let i = 0; i < 5; i++) {
    console.log(`\n⏳ Poll Attempt ${i + 1}/5`);
    console.log(`➡️  GET ${fullUrl}`);
    const response = await razorpay.get(endpoint);
    console.log(`⬅️  Status  : ${response.data.status}`);
    console.log(`⬅️  Full Response:`);
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.status === "captured") return "success";
    if (["failed", "cancelled"].includes(response.data.status)) return "failed";

    await new Promise((res) => setTimeout(res, 1000));
  }

  console.log(`⚠️  Polling timed out after 5 attempts.`);
  return "timeout";
}

module.exports = {
  createCustomer,
  createOrder,
  validateVPA,
  createAuthorizationPayment,
  pollPaymentStatus,
};
