import { useState, useEffect, useCallback } from "react";
import { supabase } from "@shared/utils/supabase";
import fallbackPlans, { SubscriptionPlan } from "@/data/subscriptionPlan";

/**
 * Fetches subscription plans from Supabase `subscription_plans` table.
 * Falls back to local static data on error or empty result.
 */
export function useSupabaseSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(fallbackPlans);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supaError } = await supabase
        .from("subscription_plans")
        .select("*");

      if (supaError) throw supaError;

      if (data && data.length > 0) {
        const mapped: SubscriptionPlan[] = data.map((row: any) => ({
          subscription_plan: row.subscription_plan,
          important_notes: row.important_notes,
          image: row.image,
        }));
        setPlans(mapped);
      } else {
        setPlans(fallbackPlans);
      }
    } catch (err: any) {
      console.warn(
        "useSupabaseSubscriptionPlans: falling back to local data",
        err.message
      );
      setError(err.message);
      setPlans(fallbackPlans);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return { plans, loading, error, refetch: fetchPlans };
}
