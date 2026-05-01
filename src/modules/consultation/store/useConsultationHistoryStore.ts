import { create } from "zustand";
import {
  ConsultationHistoryState,
  CompletedConsultationOrder,
} from "@shared/types/data";
import { supabase } from "@shared/utils/supabase";

export const useConsultationHistoryStore = create<ConsultationHistoryState>(
  (set, get) => ({
    orders: [],

    addOrder: async (order: CompletedConsultationOrder) => {
      // Update local state immediately for responsiveness
      set((state) => ({ orders: [order, ...state.orders] }));

      // Persist to Supabase in the background
      try {
        const { error } = await supabase.from("consultation_orders").insert({
          id: order.id,
          plan_name: order.planName,
          plan_image: order.planImage,
          plan_notes: order.planNotes,
          paid_at: order.paidAt,
          status: order.status,
        });

        if (error) {
          console.warn(
            "Failed to persist consultation order to Supabase:",
            error.message
          );
        }
      } catch (err: any) {
        console.warn("Consultation order sync error:", err.message);
      }
    },

    endSession: async (orderId: string) => {
      // Update local state immediately
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status: "done" as const } : o
        ),
      }));

      // Persist to Supabase
      try {
        const { error } = await supabase
          .from("consultation_orders")
          .update({ status: "done" })
          .eq("id", orderId);

        if (error) {
          console.warn("Failed to end session in Supabase:", error.message);
        }
      } catch (err: any) {
        console.warn("End session sync error:", err.message);
      }
    },

    getActiveSession: () => {
      return get().orders.find((o) => o.status === "active");
    },

    hasActiveSession: () => {
      return get().orders.some((o) => o.status === "active");
    },
  })
);

/**
 * Call this once when the app initialises (e.g. in _layout or a provider)
 * to hydrate the store with consultation orders from Supabase.
 */
export async function hydrateConsultationHistory() {
  try {
    const { data, error } = await supabase
      .from("consultation_orders")
      .select("*")
      .order("paid_at", { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      const mapped: CompletedConsultationOrder[] = data.map((row: any) => ({
        id: row.id,
        planName: row.plan_name,
        planImage: row.plan_image,
        planNotes: row.plan_notes,
        paidAt: row.paid_at,
        status: row.status ?? "done",
      }));
      useConsultationHistoryStore.setState({ orders: mapped });
    }
  } catch (err: any) {
    console.warn("Failed to hydrate consultation history:", err.message);
  }
}
