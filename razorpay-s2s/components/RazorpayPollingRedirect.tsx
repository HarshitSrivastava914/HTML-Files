import React, { useState, useRef, useEffect } from "react";

type RazorpayPollingRedirectProps = {
  paymentId: string;
  redirectUrl: string;
  onPollingStart?: () => void;
  onPollingEnd?: (status: {
    status: "success" | "failed" | "timeout";
    error?: string | null;
  }) => void;
};

type PaymentStatus = "idle" | "polling" | "success" | "failed" | "timeout";

export const RazorpayPollingRedirect: React.FC<
  RazorpayPollingRedirectProps
> = ({ paymentId, redirectUrl, onPollingStart, onPollingEnd }) => {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup polling on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startPolling = () => {
    onPollingStart?.();
    const startTime = Date.now();
    setStatus("polling");

    intervalRef.current = setInterval(async () => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= 5 * 60 * 1000) {
        // Stop polling after 5 minutes
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStatus("timeout");
        onPollingEnd?.({ status: "timeout" });
        return;
      }

      try {
        const res = await fetch(`/api/payment-status?payment_id=${paymentId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to fetch payment status");
        }

        const paymentStatus: string = data.status;

        if (["captured", "authorized"].includes(paymentStatus)) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setStatus("success");
          onPollingEnd?.({ status: "success" });
        } else if (
          ["failed", "refunded", "cancelled"].includes(paymentStatus)
        ) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setStatus("failed");
          onPollingEnd?.({ status: "failed", error: data?.error || null });
        }
        // else keep polling
      } catch (err: any) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStatus("failed");
        setError(err.message);
        onPollingEnd?.({ status: "failed", error: err.message });
      }
    }, 4000); // Poll every 4 seconds
  };

  const handleRedirectClick = () => {
    if (status === "polling") return; // prevent multiple clicks

    startPolling();

    // Open the redirect URL in a new tab
    window.open(redirectUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mt-4">
      {redirectUrl && (
        <button
          onClick={handleRedirectClick}
          disabled={status === "polling"}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {status === "polling"
            ? "Waiting for Payment..."
            : "Proceed to Bank Page"}
        </button>
      )}

      {/* Payment status messages */}
      {status === "polling" && (
        <p className="mt-2 text-blue-600">🔄 Checking payment status...</p>
      )}
      {status === "success" && (
        <p className="mt-2 text-green-600">✅ Payment Successful!</p>
      )}
      {status === "failed" && (
        <p className="mt-2 text-red-600">
          ❌ Payment Failed. {error && `(${error})`}
        </p>
      )}
      {status === "timeout" && (
        <p className="mt-2 text-yellow-600">
          ⏱️ Payment timed out. Please try again.
        </p>
      )}
    </div>
  );
};
