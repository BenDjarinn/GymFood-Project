import { create } from "zustand";
import { getClerkInstance } from "@clerk/expo";
import { OrderHistoryState, CompletedOrder, CompletedOrderItem } from "@shared/types/data";
import { supabase } from "@shared/utils/supabase";

export const useOrderHistoryStore = create<OrderHistoryState>((set) => ({
  orders: [],

  addOrder: async (order: CompletedOrder) => {
    set((state) => ({ orders: [order, ...state.orders] }));

    const userId = getClerkInstance().user?.id;
    if (!userId) {
      console.warn("Cannot persist order: no signed-in Clerk user");
      return;
    }

    try {
      const { error } = await supabase.from("orders").insert({
        id: order.id,
        items: order.items,
        total_amount: order.totalAmount,
        paid_at: order.paidAt,
        user_id: userId,
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
 *
 * The edge function stores items as { mealId, name, price, qty }, but the UI
 * expects { meal: Meal, qty }. We fetch the full meal data from the meals
 * table to reconstruct the shape the UI needs.
 */
export async function hydrateOrderHistory() {
  try {
    // 1. Fetch only paid orders
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .not("paid_at", "is", null)
      .order("paid_at", { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return;

    // 2. Collect all unique mealIds referenced across all orders
    const allMealIds = new Set<string>();
    for (const row of data) {
      if (Array.isArray(row.items)) {
        for (const item of row.items) {
          const id = item.mealId || item.meal?.id;
          if (id) allMealIds.add(id);
        }
      }
    }

    // 3. Fetch full meal data for those IDs
    let mealMap = new Map<string, any>();
    if (allMealIds.size > 0) {
      const { data: meals } = await supabase
        .from("meals")
        .select("*")
        .in("id", Array.from(allMealIds));

      if (meals) {
        mealMap = new Map(
          meals.map((m: any) => [
            m.id,
            {
              id: m.id,
              categoryId: m.category_id,
              name: m.name,
              calories: m.calories,
              protein: m.protein,
              carbs: m.carbs,
              fat: m.fat,
              price: m.price,
              image: m.image,
            },
          ])
        );
      }
    }

    // 4. Reconstruct orders with full Meal objects
    const mapped: CompletedOrder[] = data
      .map((row: any) => {
        const items: CompletedOrderItem[] = [];

        if (Array.isArray(row.items)) {
          for (const item of row.items) {
            // Handle both shapes:
            //   Edge function format: { mealId, name, price, qty }
            //   Client format:        { meal: { id, ... }, qty }
            const id = item.mealId || item.meal?.id;
            const qty = item.qty ?? 1;
            const meal = id ? mealMap.get(id) : null;

            if (meal) {
              items.push({ meal, qty });
            }
          }
        }

        return {
          id: row.id,
          items,
          totalAmount: row.total_amount,
          paidAt: row.paid_at,
        };
      })
      .filter((order) => order.items.length > 0);

    useOrderHistoryStore.setState({ orders: mapped });
  } catch (err: any) {
    console.warn("Failed to hydrate order history:", err.message);
  }
}
