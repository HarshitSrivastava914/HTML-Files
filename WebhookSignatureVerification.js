const crypto = require("crypto");

const webhookSecret = "choice@testpayment"; // Replace with actual secret
const webhookBody = JSON.stringify({
  account_id: "acc_QSoFgrlx8lQbMz",
  contains: ["payment_link", "order", "payment"],
  created_at: 1753270853,
  entity: "event",
  event: "payment_link.paid",
  payload: {
    order: {
      entity: {
        amount: 10000,
        amount_due: 0,
        amount_paid: 10000,
        attempts: 1,
        created_at: 1753270862,
        currency: "INR",
        entity: "order",
        id: "order_QwUnxGl0MOwThv",
        notes: [],
        offer_id: null,
        receipt: "ca894cde-57de-424f-9a7a-b43a6153f5fe",
        status: "paid",
      },
    },
    payment: {
      entity: {
        acquirer_data: {
          rrn: "990258788247",
          upi_transaction_id: "0792FC9E52F427F8143158E69A06B84F",
        },
        amount: 10000,
        amount_refunded: 0,
        amount_transferred: 0,
        bank: null,
        base_amount: 10000,
        captured: true,
        card: null,
        card_id: null,
        contact: "+919540018726",
        created_at: 1753270879,
        currency: "INR",
        description: "#QwUnnAtxNA6gXl",
        email: "void@razorpay.com",
        entity: "payment",
        error_code: null,
        error_description: null,
        error_reason: null,
        error_source: null,
        error_step: null,
        fee: 378,
        fee_bearer: "platform",
        id: "pay_QwUoEpWfKrl4fM",
        international: false,
        invoice_id: null,
        method: "upi",
        notes: [],
        order_id: "order_QwUnxGl0MOwThv",
        refund_status: null,
        status: "captured",
        tax: 58,
        upi: {
          vpa: "9540018726@ybl",
        },
        vpa: "9540018726@ybl",
        wallet: null,
      },
    },
    payment_link: {
      entity: {
        accept_partial: false,
        amount: 10000,
        amount_paid: 10000,
        callback_method: "get",
        callback_url: "https://google.com",
        cancelled_at: 0,
        created_at: 1753270853,
        currency: "INR",
        customer: {},
        description: "Test Payment for Apple Device",
        expire_by: 1753274452,
        expired_at: 0,
        first_min_partial_amount: 0,
        id: "plink_QwUnnAtxNA6gXl",
        notes: null,
        notify: {
          email: false,
          sms: false,
          whatsapp: false,
        },
        order_id: "order_QwUnxGl0MOwThv",
        reference_id: "ca894cde-57de-424f-9a7a-b43a6153f5fe",
        reminder_enable: false,
        reminders: {
          status: "failed",
        },
        short_url: "https://rzp.io/rzp/I0dGEAS",
        status: "paid",
        updated_at: 1753270881,
        upi_link: false,
        user_id: "",
        whatsapp_link: false,
      },
    },
  },
});

const webhookSignature =
  "1db19faae02cbb89e8456e21fcad785eb85d825f227928f61ee034f97d4c22cc"; // Replace with actual received signature

function verifyWebhookSignature({
  webhookSecret,
  webhookBody,
  webhookSignature,
}) {
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(webhookBody, "utf8")
    .digest("hex");

  if (expectedSignature !== webhookSignature) {
    throw new Error("Security Error: Invalid webhook signature");
  }

  console.log("Webhook signature verified successfully.");

  console.log("Received Signature:", webhookSignature);

  console.log("Expected Signature:", expectedSignature);
}

verifyWebhookSignature({ webhookSecret, webhookBody, webhookSignature });

const Razorpay = require("razorpay");

const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

console.log(
  validateWebhookSignature(webhookBody, webhookSignature, webhookSecret)
);

module.exports = verifyWebhookSignature;
