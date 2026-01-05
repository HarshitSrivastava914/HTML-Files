import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { detectDevice } from "./services/device.service.js";

dotenv.config();

import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();
app.use(bodyParser.json());

// Needed to resolve file paths in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, "views")));

// ➤ HOME ROUTE – detect device and render correct UI
app.get("/", (req, res) => {
  const device = detectDevice(req.headers["user-agent"]);

  if (device === "mobile") {
    return res.sendFile(path.join(__dirname, "views/mobile-intent.html"));
  }

  // default → desktop/laptop/tablet
  return res.sendFile(path.join(__dirname, "views/desktop-collect.html"));
});

// API ROUTES
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);

// START SERVER
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
