const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Store last Razorpay payload for the UI to read
let lastPayment = {};

// Serve UI files
app.use(express.static(path.join(__dirname, "public")));

// ONE callback route that handles BOTH GET + POST
app.all("/callback", (req, res) => {
  if (req.method === "POST") {
    console.log("----- Razorpay Payment Received (POST) -----");
    console.log(req.body);

    // Store payment info for showing on UI
    lastPayment = req.body;

    // Show thank you page on browser (same route)
    return res.sendFile(path.join(__dirname, "public", "thank-you.html"));
  }

  // GET request from browser
  console.log("User reached callback page (GET)");

  return res.sendFile(path.join(__dirname, "public", "thank-you.html"));
});

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API to allow thank-you.html to read payment data
app.get("/payment-data", (req, res) => {
  res.json(lastPayment);
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
