// Type definitions for data models

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface Meal {
  id: string;
  categoryId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  image: string;
}

export interface PaymentMethod {
  id: string;
  label: string;
  icon: string;
}

// Cart state types
export type CartById = Record<string, number>;

export interface CartState {
  cartById: CartById;
  addToCart: (mealId: string, qty?: number) => void;
  incQty: (mealId: string) => void;
  decQty: (mealId: string) => void;
  removeItem: (mealId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

// Order history types
export interface CompletedOrderItem {
  meal: Meal;
  qty: number;
}

export interface CompletedOrder {
  id: string;
  items: CompletedOrderItem[];
  totalAmount: number;
  paidAt: string; // ISO timestamp
}

export interface OrderHistoryState {
  orders: CompletedOrder[];
  addOrder: (order: CompletedOrder) => void;
}

// Consultation order history types
export interface CompletedConsultationOrder {
  id: string;
  planName: string;       // "Beginner" | "Advanced" | "Pro"
  planImage: string;      // key for subscriptionPlanImages, e.g. "beginner.png"
  planNotes: string[];    // the bullet-point notes
  paidAt: string;         // ISO timestamp
}

export interface ConsultationHistoryState {
  orders: CompletedConsultationOrder[];
  addOrder: (order: CompletedConsultationOrder) => void;
}
