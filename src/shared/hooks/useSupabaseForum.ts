import { useState, useEffect, useCallback } from "react";
import { supabase } from "@shared/utils/supabase";
import fallbackForumPosts, { ForumPostData } from "@/data/forumPosts";

/**
 * Fetches forum posts from Supabase `forum_posts` table.
 * Falls back to local static data on error or empty result.
 *
 * Exposes `toggleLike` and `toggleBookmark` for persisting reactions
 * to the database with optimistic local updates.
 */
export function useSupabaseForum() {
  const [posts, setPosts] = useState<ForumPostData[]>(fallbackForumPosts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supaError } = await supabase
        .from("forum_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (supaError) throw supaError;

      if (data && data.length > 0) {
        console.log(`[Forum] Loaded ${data.length} posts from Supabase (first id: ${data[0].id})`);
        const mapped: ForumPostData[] = data.map((row: any) => ({
          id: row.id,
          author_name: row.author_name,
          author_avatar: row.author_avatar,
          title: row.title,
          category: row.category,
          image: row.image,
          description: row.description,
          likes: row.likes,
          comments: row.comments,
          bookmarks: row.bookmarks,
        }));
        setPosts(mapped);
      } else {
        console.log("[Forum] No data from Supabase, using fallback");
        setPosts(fallbackForumPosts);
      }
    } catch (err: any) {
      console.warn(
        "useSupabaseForum: falling back to local data",
        err.message
      );
      setError(err.message);
      setPosts(fallbackForumPosts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ── Toggle like (optimistic) ─────────────────────────────
  const toggleLike = useCallback(
    async (postId: string, currentlyLiked: boolean) => {
      const delta = currentlyLiked ? -1 : 1;
      console.log(`[toggleLike] postId=${postId}, delta=${delta}`);

      // Optimistic UI update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes: Math.max(0, p.likes + delta) } : p
        )
      );

      try {
        // Read current value
        const { data: row, error: readErr } = await supabase
          .from("forum_posts")
          .select("likes")
          .eq("id", postId)
          .single();

        if (readErr) {
          console.error("[toggleLike] READ error:", readErr.message);
          throw readErr;
        }

        const newLikes = Math.max(0, (row?.likes ?? 0) + delta);
        console.log(`[toggleLike] current=${row?.likes}, new=${newLikes}`);

        // Update and verify
        const { data: updated, error: writeErr } = await supabase
          .from("forum_posts")
          .update({ likes: newLikes })
          .eq("id", postId)
          .select("likes");

        if (writeErr) {
          console.error("[toggleLike] WRITE error:", writeErr.message);
          throw writeErr;
        }

        if (!updated || updated.length === 0) {
          console.error("[toggleLike] UPDATE returned no rows — RLS may be blocking");
          throw new Error("Update blocked by RLS policy");
        }

        console.log(`[toggleLike] ✅ SUCCESS — DB likes now: ${updated[0].likes}`);
      } catch (err: any) {
        console.warn("[toggleLike] FAILED, reverting:", err.message);
        // Revert optimistic update
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likes: Math.max(0, p.likes - delta) }
              : p
          )
        );
      }
    },
    []
  );

  // ── Toggle bookmark (optimistic) ─────────────────────────
  const toggleBookmark = useCallback(
    async (postId: string, currentlySaved: boolean) => {
      const delta = currentlySaved ? -1 : 1;
      console.log(`[toggleBookmark] postId=${postId}, delta=${delta}`);

      // Optimistic UI update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, bookmarks: Math.max(0, p.bookmarks + delta) }
            : p
        )
      );

      try {
        const { data: row, error: readErr } = await supabase
          .from("forum_posts")
          .select("bookmarks")
          .eq("id", postId)
          .single();

        if (readErr) {
          console.error("[toggleBookmark] READ error:", readErr.message);
          throw readErr;
        }

        const newBookmarks = Math.max(0, (row?.bookmarks ?? 0) + delta);
        console.log(`[toggleBookmark] current=${row?.bookmarks}, new=${newBookmarks}`);

        const { data: updated, error: writeErr } = await supabase
          .from("forum_posts")
          .update({ bookmarks: newBookmarks })
          .eq("id", postId)
          .select("bookmarks");

        if (writeErr) {
          console.error("[toggleBookmark] WRITE error:", writeErr.message);
          throw writeErr;
        }

        if (!updated || updated.length === 0) {
          console.error("[toggleBookmark] UPDATE returned no rows — RLS may be blocking");
          throw new Error("Update blocked by RLS policy");
        }

        console.log(`[toggleBookmark] ✅ SUCCESS — DB bookmarks now: ${updated[0].bookmarks}`);
      } catch (err: any) {
        console.warn("[toggleBookmark] FAILED, reverting:", err.message);
        // Revert optimistic update
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, bookmarks: Math.max(0, p.bookmarks - delta) }
              : p
          )
        );
      }
    },
    []
  );

  return { posts, loading, error, refetch: fetchPosts, toggleLike, toggleBookmark };
}
