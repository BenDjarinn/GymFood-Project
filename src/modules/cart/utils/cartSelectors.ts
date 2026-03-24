import meals from "@/data/meals";
import { Meal, CartById } from "@shared/types/data";

interface CartItem {
  meal: Meal | undefined;
  qty: number;
}

export const buildCartItems = (cartById: CartById): CartItem[] => {
  return Object.entries(cartById)
    .map(([mealId, qty]) => ({
      meal: meals.find((m) => m.id === mealId),
      qty,
    }))
    .filter((x) => x.meal && (x.qty ?? 0) > 0);
};

export const calcSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, it) => {
    const price = Number(it.meal?.price ?? 0);
    return sum + price * (it.qty ?? 0);
  }, 0);
};

export const calcGrandTotal = (subTotal: number, tax: number, insurance: number): number => {
  return subTotal + tax + insurance;
};
