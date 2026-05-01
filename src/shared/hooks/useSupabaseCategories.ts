import { useState, useEffect, useCallback } from "react";
import { supabase } from "@shared/utils/supabase";
import { Category } from "@shared/types/data";
import fallbackCategories from "@/data/categories";

/**
 * Fetches categories from Supabase `categories` table.
 * Falls back to local static data on error or empty result.
 */
export function useSupabaseCategories() {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supaError } = await supabase
        .from("categories")
        .select("*");

      if (supaError) throw supaError;

      if (data && data.length > 0) {
        setCategories(data as Category[]);
      } else {
        setCategories(fallbackCategories);
      }
    } catch (err: any) {
      console.warn(
        "useSupabaseCategories: falling back to local data",
        err.message
      );
      setError(err.message);
      setCategories(fallbackCategories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}
