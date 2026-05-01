import { useState, useEffect, useCallback } from "react";
import { supabase } from "@shared/utils/supabase";
import fallbackForumPosts, { ForumPostData } from "@/data/forumPosts";

/**
 * Fetches forum posts from Supabase `forum_posts` table.
 * Falls back to local static data on error or empty result.
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
        const mapped: ForumPostData[] = data.map((row: any) => ({
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

  return { posts, loading, error, refetch: fetchPosts };
}
