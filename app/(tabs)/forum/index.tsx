import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import ThemedView from "@shared/components/ui/ThemedView";
import ForumPost from "@modules/consultation/components/ForumPost";

import forumPosts, { ForumPostData } from "@/data/forumPosts";

export default function ForumScreen() {
  const [searchText, setSearchText] = useState("");

  const posts = forumPosts as ForumPostData[];

  return (
    <ThemedView style={styles.container}>
      {/* SEARCH BAR ROW */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={22} color="#34699A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#A0BDD4"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => router.push("/forum/CreatePostScreen")}
        >
          <MaterialIcons name="add" size={26} color="#34699A" />
        </Pressable>
      </View>

      {/* FORUM POSTS */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {posts.map((post, index) => (
          <ForumPost
            key={`${post.title}-${index}`}
            author_name={post.author_name}
            author_avatar={post.author_avatar}
            title={post.title}
            image={post.image}
            description={post.description}
            likes={post.likes}
            comments={post.comments}
            bookmarks={post.bookmarks}
            category={post.category}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
  },

  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#34699A",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
    padding: 0,
  },

  addButton: {
    width: 48,
    height: 48,
    borderWidth: 1.5,
    borderColor: "#34699A",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
});
