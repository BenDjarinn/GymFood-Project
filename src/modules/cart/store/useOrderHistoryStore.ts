import { create } from "zustand";
import { OrderHistoryState, CompletedOrder } from "@shared/types/data";

export const useOrderHistoryStore = create<OrderHistoryState>((set) => ({
  orders: [],
  addOrder: (order: CompletedOrder) =>
    set((state) => ({ orders: [order, ...state.orders] })),
}));
