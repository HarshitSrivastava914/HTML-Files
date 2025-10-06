const {
  generateOnboardingSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const Razorpay = require("razorpay");

// Initialize OAuth client (replace with actual credentials)
// let oAuth = new Razorpay.OAuthTokenClient({
//   client_id: "YOUR_CLIENT_ID",
//   client_secret: "YOUR_CLIENT_SECRET",
// });

// Prepare attributes
let attributes = {
  submerchant_id: "R41nppOBRPYbCR",
  timestamp: Math.floor(Date.now() / 1000).toString(), // ensure it's a string
};

// Generate onboarding signature
let onboarding_signature = generateOnboardingSignature(
  attributes,
  "Csptc9hTi1COkRTUplPTVgiT" // your shared secret
);

console.log("Onboarding Signature:", onboarding_signature);
