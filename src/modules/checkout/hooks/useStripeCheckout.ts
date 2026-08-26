import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { getClerkInstance } from "@clerk/expo";

const STRIPE_CHECKOUT_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL +
  "/functions/v1/stripe-checkout";

// ── Types ──────────────────────────────────────────────────

interface MealPaymentRequest {
  type: "meal";
  cartItems: { mealId: string; qty: number }[];
}

interface ConsultationPaymentRequest {
  type: "consultation";
  planName: string;
  planImage: string;
  planNotes: string[];
}

type PaymentRequest = MealPaymentRequest | ConsultationPaymentRequest;

interface PaymentResult {
  success: boolean;
  error?: string;
  orderId?: string;
  paymentIntentId?: string;
  amount?: number;
}

// ── Hook ───────────────────────────────────────────────────

export function useStripeCheckout() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = useCallback(
    async (request: PaymentRequest): Promise<PaymentResult> => {
      setLoading(true);
      setError(null);

      try {
        // ── A. Get Clerk session token ─────────────────
        const clerkToken = await getClerkInstance().session?.getToken();
        if (!clerkToken) {
          throw new Error("Not signed in. Please sign in first.");
        }

        // ── B. Call Edge Function ──────────────────────
        //    The server calculates the price and creates a pending order.
        //    We do NOT send the amount — the server computes it.
        const response = await fetch(STRIPE_CHECKOUT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${clerkToken}`,
          },
          body: JSON.stringify(request),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create payment");
        }

        const {
          clientSecret,
          paymentIntentId,
          ephemeralKey,
          customerId,
          orderId,
          amount,
        } = data;

        // ── C. Initialize Payment Sheet ────────────────
        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          customerEphemeralKeySecret: ephemeralKey,
          customerId: customerId,
          merchantDisplayName: "GymFood",
          style: "automatic",
          // Uncomment to allow saving cards for future purchases:
          // allowsDelayedPaymentMethods: false,
        });

        if (initError) {
          throw new Error(initError.message);
        }

        // ── D. Present Payment Sheet ───────────────────
        const { error: presentError } = await presentPaymentSheet();

        if (presentError) {
          if (presentError.code === "Canceled") {
            setLoading(false);
            return { success: false, error: "Payment cancelled" };
          }
          throw new Error(presentError.message);
        }

        // ── E. Payment succeeded ───────────────────────
        //    The webhook will confirm this server-side,
        //    but the Payment Sheet only returns success
        //    after Stripe confirms the charge.
        setLoading(false);
        return { success: true, orderId, paymentIntentId, amount };
      } catch (err: any) {
        const errorMessage = err.message || "Payment failed";
        setError(errorMessage);
        setLoading(false);
        Alert.alert("Payment Error", errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [initPaymentSheet, presentPaymentSheet]
  );

  return { initiatePayment, loading, error };
}
