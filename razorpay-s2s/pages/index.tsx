import { useState } from "react";
import { RazorpayPollingRedirect } from "../components/RazorpayPollingRedirect";
import PaymentForm, { PaymentFormData } from "../components/PaymentForm";
import LoadingSpinner from "../components/LoadingSpinner"; // Import Spinner

export default function Home() {
  const [status, setStatus] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpSubmitUrl, setOtpSubmitUrl] = useState<string | null>(null);
  const [otpResendUrl, setOtpResendUrl] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [loading, setLoading] = useState(false); // 👈 Add loading state
  const [loadingRedirect, setLoadingRedirect] = useState(false);

  const handlePayment = async (formData: PaymentFormData) => {
    console.log("Set loading true");
    setLoading(true); // 👈 Start loading

    try {
      // Step 1: Create Customer
      const customer = await fetch("/api/create-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          contact: formData.contact,
        }),
      }).then((r) => r.json());

      // Step 2: Create Order
      const order = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: formData.amount,
          customer_id: customer.id,
        }),
      }).then((r) => r.json());

      // Step 3: Create Payment Authorization
      const payment = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: formData.amount,
          order_id: order.id,
          email: formData.email,
          contact: formData.contact,
          customer_id: customer.id,
          card: {
            number: formData.cardNumber,
            cvv: formData.cvv,
            expiry_month: formData.expiryMonth,
            expiry_year: formData.expiryYear,
            name: formData.cardHolder,
          },
        }),
      }).then((r) => r.json());

      setStatus(JSON.stringify(payment, null, 2));

      const paymentIdFromResponse = payment.razorpay_payment_id;
      if (paymentIdFromResponse) {
        setPaymentId(paymentIdFromResponse);
      }

      const nextActions = payment.next || [];
      nextActions.forEach((actionObj: any) => {
        if (actionObj.action === "redirect") {
          setRedirectUrl(actionObj.url);
        } else if (actionObj.action === "otp_submit") {
          setOtpSubmitUrl(actionObj.url);
        } else if (actionObj.action === "otp_resend") {
          setOtpResendUrl(actionObj.url);
        }
      });
    } catch (err: any) {
      setStatus("Error: " + err.message);
    } finally {
      console.log("Set loading false");
      setLoading(false); // 👈 Stop loading regardless of success/failure
    }
  };

  const handleOtpSubmit = async () => {
    if (!otpSubmitUrl || !otp) return;

    try {
      const res = await fetch("/api/submit-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: otpSubmitUrl, otp }),
      }).then((r) => r.json());

      setStatus(JSON.stringify(res, null, 2));

      // Start polling again
      setIsPolling(true);
    } catch (err: any) {
      setStatus("Error submitting OTP: " + err.message);
    }
  };

  const handleResendOtp = async () => {
    if (!otpResendUrl) return;

    try {
      const res = await fetch("/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: otpResendUrl }),
      }).then((r) => r.json());

      setStatus(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setStatus("Error resending OTP: " + err.message);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="p-6 bg-white shadow rounded-2xl max-w-xl w-full">
        <h1 className="text-xl font-bold mb-4">Razorpay Recurring (S2S)</h1>

        <h2>Payment Page</h2>

        {/* Loading spinner shown on top of form */}
        {loading && (
          <div className="mb-4 flex justify-center">
            <LoadingSpinner />
          </div>
        )}

        {/* Disable form when loading */}
        <div className={loading ? "opacity-50 pointer-events-none" : ""}>
          <PaymentForm onSubmit={handlePayment} />
        </div>

        {otpSubmitUrl && (
          <div className="mt-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Enter OTP:
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border px-3 py-2 rounded w-full mb-2"
              placeholder="Enter OTP"
            />
            <div className="flex gap-2">
              <button
                onClick={handleOtpSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit OTP
              </button>
              <button
                onClick={handleResendOtp}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Resend OTP
              </button>
            </div>
          </div>
        )}

        {/* Redirect Component */}
        {paymentId && redirectUrl && (
          <div className="mt-6">
            <RazorpayPollingRedirect
              paymentId={paymentId}
              redirectUrl={redirectUrl}
              onPollingStart={() => setLoadingRedirect(true)}
              onPollingEnd={(finalStatus) => {
                setLoadingRedirect(false);
                // Optionally format or update the status text
                setStatus(JSON.stringify(finalStatus, null, 2));
              }}
            />
          </div>
        )}

        <pre className="mt-6 bg-gray-900 text-white p-3 rounded-lg text-sm overflow-x-auto">
          {status}
        </pre>
      </div>
    </main>
  );
}
