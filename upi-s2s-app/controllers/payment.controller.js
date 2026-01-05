import { razorpayClient } from "../config/razorpay.js";
import { detectDevice } from "../services/device.service.js";
import { generatePSPLinks } from "../services/deeplink.service.js";
import { pollPaymentStatus } from "../services/polling.service.js";

export const createPayment = async (req, res) => {
  try {
    console.log("----- STEP 1: Detecting device -----");
    const userAgent = req.headers["user-agent"];
    const device = detectDevice(userAgent);
    console.log("Device detected:", device);

    console.log("----- STEP 2: Preparing payload -----");
    const payload = {
      amount: req.body.amount,
      currency: "INR",
      order_id: req.body.order_id,
      email: req.body.email,
      contact: req.body.contact,
      method: "upi",
      ip: req.ip,
      referer: "http",
      user_agent: userAgent,
      notes: { flow: device },
    };
    console.log("Payload:", payload);

    // Mobile → Intent
    if (device === "android" || device === "ios") {
      payload.upi = { flow: "intent" };
      console.log("Using INTENT flow for mobile");
    }

    // Desktop → Collect
    if (device === "desktop") {
      payload.upi = { flow: "collect", vpa: req.body.vpa };
      console.log("Using COLLECT flow for desktop");
    }

    console.log("----- STEP 3: Calling Razorpay S2S API -----");
    const payment = await razorpayClient.post("/payments/create/json", payload);
    const data = payment.data;
    console.log("Razorpay response:", data);

    // Mobile → Generate PSP links
    if (device === "android" || device === "ios") {
      console.log("----- STEP 4: Generating PSP links -----");
      const intentObj = data.next.find((n) => n.action === "intent");

      if (!intentObj) {
        console.error("Intent URL missing in Razorpay response");
        return res
          .status(400)
          .json({ error: true, message: "Intent URL missing" });
      }

      console.log("Razorpay intent URL:", intentObj.url);
      let pspLinks = generatePSPLinks(intentObj.url);

      if (device === "ios") {
        delete pspLinks.any;
      }

      console.log("Generated PSP links:", pspLinks);

      return res.json({
        ...data,
        device,
        pspLinks,
        pollUrl: data.next.find((n) => n.action === "poll")?.url,
      });
    }

    // Desktop → Collect
    if (device === "desktop") {
      console.log(
        "Returning desktop collect flow with poll URL:",
        data.next[0]?.url
      );
      return res.json({
        ...data,
        device,
        pollUrl: data.next[0]?.url,
      });
    }
  } catch (err) {
    console.error("Payment error:", err.response?.data || err.message || err);
    res
      .status(500)
      .json(err.response?.data || { error: "Payment request failed" });
  }
};

// Polling controller
export const pollStatus = async (req, res) => {
  try {
    const pollUrl = req.query.url;
    console.log("----- STEP 5: Polling payment status -----");
    console.log("Polling URL:", pollUrl);

    const status = await pollPaymentStatus(pollUrl);
    console.log("Payment status:", status);

    res.json(status);
  } catch (err) {
    console.error("Polling error:", err.response?.data || err.message || err);
    res.status(500).json({ error: true, message: "Polling failed" });
  }
};
