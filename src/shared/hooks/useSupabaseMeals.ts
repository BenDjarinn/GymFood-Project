import { useState, useEffect, useCallback } from "react";
import { supabase } from "@shared/utils/supabase";
import { Meal } from "@shared/types/data";
import fallbackMeals from "@/data/meals";

/**
 * Fetches meals from Supabase `meals` table.
 * Falls back to local static data on error or empty result.
 *
 * @param categoryId - Optional filter by category
 */
export function useSupabaseMeals(categoryId?: string) {
  const [meals, setMeals] = useState<Meal[]>(fallbackMeals);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from("meals").select("*");

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error: supaError } = await query;

      if (supaError) throw supaError;

      if (data && data.length > 0) {
        // Map snake_case DB columns to camelCase Meal interface
        const mapped: Meal[] = data.map((row: any) => ({
          id: row.id,
          categoryId: row.category_id,
          name: row.name,
          calories: row.calories,
          protein: row.protein,
          carbs: row.carbs,
          fat: row.fat,
          price: row.price,
          image: row.image,
        }));
        setMeals(mapped);
      } else {
        // Use fallback if Supabase returns empty
        const filtered = categoryId
          ? fallbackMeals.filter((m) => m.categoryId === categoryId)
          : fallbackMeals;
        setMeals(filtered);
      }
    } catch (err: any) {
      console.warn("useSupabaseMeals: falling back to local data", err.message);
      setError(err.message);
      const filtered = categoryId
        ? fallbackMeals.filter((m) => m.categoryId === categoryId)
        : fallbackMeals;
      setMeals(filtered);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  return { meals, loading, error, refetch: fetchMeals };
}
