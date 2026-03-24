import { create } from "zustand";
import {
  ConsultationHistoryState,
  CompletedConsultationOrder,
} from "@shared/types/data";

export const useConsultationHistoryStore = create<ConsultationHistoryState>(
  (set) => ({
    orders: [],
    addOrder: (order: CompletedConsultationOrder) =>
      set((state) => ({ orders: [order, ...state.orders] })),
  })
);
