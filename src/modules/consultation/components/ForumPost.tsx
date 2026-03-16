import React, { useState } from "react";
import { View, Image, StyleSheet, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ThemedText from "@shared/components/ui/ThemedText";

interface ForumPostProps {
  author_name: string;
  author_avatar: string;
  title: string;
  image: string;
  description: string;
  likes: number;
  comments: number;
  bookmarks: number;
  category?: string;
  onPress?: () => void;
}

const LIKE_COLOR = "#e56969";
const BOOKMARK_COLOR = "#FFD700";

const ForumPost: React.FC<ForumPostProps> = ({
  author_name,
  author_avatar,
  title,
  image,
  description,
  likes,
  comments,
  bookmarks,
  onPress,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [bookmarkCount, setBookmarkCount] = useState(bookmarks);

  const formatCount = (n: number) => (n > 999 ? `${(n / 1000).toFixed(0)}k` : `${n}`);

  const handleLike = () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleBookmark = () => {
    setIsSaved((prev) => !prev);
    setBookmarkCount((prev) => (isSaved ? prev - 1 : prev + 1));
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.95, transform: [{ scale: 0.995 }] },
      ]}
    >
      {/* ── Author Row ── */}
      <View style={styles.authorRow}>
        <Image source={{ uri: author_avatar }} style={styles.avatar} />
        <ThemedText style={styles.authorLabel}>
          Created by <ThemedText style={styles.authorName}>{author_name}</ThemedText>
        </ThemedText>
      </View>

      {/* ── Title ── */}
      <ThemedText style={styles.title}>{title}</ThemedText>

      {/* ── Post Image ── */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: image }} style={styles.postImage} />
      </View>

      {/* ── Description ── */}
      <ThemedText style={styles.description} numberOfLines={3}>
        {description}
      </ThemedText>

      {/* ── Actions Row ── */}
      <View style={styles.actionsRow}>
        {/* Likes */}
        <Pressable
          onPress={handleLike}
          hitSlop={8}
          style={({ pressed }) => [
            styles.actionItem,
            pressed && { opacity: 0.6, transform: [{ scale: 0.85 }] },
          ]}
        >
          <MaterialIcons
            name={isLiked ? "favorite" : "favorite-border"}
            size={30}
            color={isLiked ? LIKE_COLOR : "#34699A"}
          />
          <ThemedText
            style={styles.actionCount}
          >
            {formatCount(likeCount)}
          </ThemedText>
        </Pressable>

        {/* Comments */}
        <View style={styles.actionItem}>
          <MaterialIcons name="chat-bubble-outline" size={28} color="#34699A" />
          <ThemedText style={styles.actionCount}>{formatCount(comments)}</ThemedText>
        </View>

        {/* Bookmarks */}
        <Pressable
          onPress={handleBookmark}
          hitSlop={8}
          style={({ pressed }) => [
            styles.actionItem,
            pressed && { opacity: 0.6, transform: [{ scale: 0.85 }] },
          ]}
        >
          <MaterialIcons
            name={isSaved ? "bookmark" : "bookmark-border"}
            size={30}
            color={isSaved ? BOOKMARK_COLOR : "#34699A"}
          />
          <ThemedText
            style={styles.actionCount}
          >
            {formatCount(bookmarkCount)}
          </ThemedText>
        </Pressable>
      </View>

      {/* ── Separator ── */}
      <View style={styles.separator} />
    </Pressable>
  );
};

export default ForumPost;

const BLUE = "#34699A";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "transparent",
    paddingVertical: 18,
    paddingHorizontal: 8,
    marginBottom: 0,
  },

  /* ── Author ── */
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D0DDE8",
  },

  authorLabel: {
    fontSize: 14,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#555",
  },

  authorName: {
    fontFamily: "SF-Pro-DisplayBold",
    color: BLUE,
  },

  /* ── Title ── */
  title: {
    fontSize: 22,
    fontFamily: "SF-Pro-DisplayBold",
    color: BLUE,
    marginBottom: 14,
  },

  /* ── Image ── */
  imageWrap: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
  },

  postImage: {
    width: "100%",
    height: 260,
    resizeMode: "cover",
  },

  /* ── Description ── */
  description: {
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayRegular",
    color: BLUE,
    lineHeight: 22,
    marginBottom: 14,
  },

  /* ── Actions ── */
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    paddingTop: 4,
  },

  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  actionCount: {
    fontSize: 14,
    fontFamily: "SF-Pro-DisplayRegular",
    color: BLUE,
  },

  /* ── Separator ── */
  separator: {
    height: 1.5,
    backgroundColor: BLUE,
    marginTop: 18,
  },
});
