import { create } from "zustand";
import { OrderHistoryState, CompletedOrder } from "@shared/types/data";
import { supabase } from "@shared/utils/supabase";

export const useOrderHistoryStore = create<OrderHistoryState>((set) => ({
  orders: [],

  addOrder: async (order: CompletedOrder) => {
    // Update local state immediately for responsiveness
    set((state) => ({ orders: [order, ...state.orders] }));

    // Persist to Supabase in the background
    try {
      const { error } = await supabase.from("orders").insert({
        id: order.id,
        items: order.items,
        total_amount: order.totalAmount,
        paid_at: order.paidAt,
      });

      if (error) {
        console.warn("Failed to persist order to Supabase:", error.message);
      }
    } catch (err: any) {
      console.warn("Order sync error:", err.message);
    }
  },
}));

/**
 * Call this once when the app initialises (e.g. in _layout or a provider)
 * to hydrate the store with orders from Supabase.
 */
export async function hydrateOrderHistory() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("paid_at", { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      const mapped: CompletedOrder[] = data.map((row: any) => ({
        id: row.id,
        items: row.items,
        totalAmount: row.total_amount,
        paidAt: row.paid_at,
      }));
      useOrderHistoryStore.setState({ orders: mapped });
    }
  } catch (err: any) {
    console.warn("Failed to hydrate order history:", err.message);
  }
}
