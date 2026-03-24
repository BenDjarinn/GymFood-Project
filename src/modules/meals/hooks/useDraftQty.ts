import { useState, useCallback } from "react";

interface UseDraftQtyReturn {
  getDraftQty: (mealId: string) => number;
  ensureDraftQty: (mealId: string) => void;
  increment: (mealId: string) => void;
  decrement: (mealId: string) => void;
}

export const useDraftQty = (): UseDraftQtyReturn => {
  const [qtyById, setQtyById] = useState<Record<string, number>>({});

  const getDraftQty = useCallback(
    (mealId: string): number => qtyById[mealId] ?? 1,
    [qtyById]
  );

  const ensureDraftQty = useCallback((mealId: string) => {
    setQtyById((prev) => (prev[mealId] ? prev : { ...prev, [mealId]: 1 }));
  }, []);

  const setDraftQty = useCallback((mealId: string, nextQty: number) => {
    setQtyById((prev) => ({
      ...prev,
      [mealId]: Math.max(1, nextQty),
    }));
  }, []);

  const increment = useCallback(
    (mealId: string) => {
      ensureDraftQty(mealId);
      setQtyById((prev) => ({
        ...prev,
        [mealId]: Math.max(1, (prev[mealId] ?? 1) + 1),
      }));
    },
    [ensureDraftQty]
  );

  const decrement = useCallback(
    (mealId: string) => {
      ensureDraftQty(mealId);
      setQtyById((prev) => ({
        ...prev,
        [mealId]: Math.max(1, (prev[mealId] ?? 1) - 1),
      }));
    },
    [ensureDraftQty]
  );

  return { getDraftQty, ensureDraftQty, increment, decrement };
};
