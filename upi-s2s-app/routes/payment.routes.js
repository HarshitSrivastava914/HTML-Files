import express from "express";
import {
  createPayment,
  pollStatus,
} from "../controllers/payment.controller.js";
import { detectDevice } from "../services/device.service.js"; // <-- IMPORT ADDED

const router = express.Router();

// Device detection route
router.get("/detect-device", (req, res) => {
  try {
    const device = detectDevice(req.headers["user-agent"] || "");
    res.json({ device });
  } catch (err) {
    console.error("Device detection failed:", err);
    res.status(500).json({ error: "Device detection failed" });
  }
});

// Payment creation route
router.post("/create", createPayment);

// Polling route
router.get("/poll", pollStatus);

export default router;
