import { create } from "zustand";
import { CartState } from "@shared/types/data";

export const useCartStore = create<CartState>((set, get) => ({
  cartById: {}, // { mealId: qty }

  addToCart: (mealId: string, qty: number = 1) =>
    set((state) => ({
      cartById: {
        ...state.cartById,
        [mealId]: qty,
      },
    })),

  incQty: (mealId: string) =>
    set((state) => ({
      cartById: {
        ...state.cartById,
        [mealId]: (state.cartById[mealId] || 1) + 1,
      },
    })),

  decQty: (mealId: string) =>
    set((state) => ({
      cartById: {
        ...state.cartById,
        [mealId]: Math.max(1, (state.cartById[mealId] || 1) - 1),
      },
    })),

  removeItem: (mealId: string) =>
    set((state) => {
      const next = { ...state.cartById };
      delete next[mealId];
      return { cartById: next };
    }),

  clearCart: () => set({ cartById: {} }),

  getTotalItems: () =>
    Object.values(get().cartById).reduce((a, b) => a + b, 0),
}));
