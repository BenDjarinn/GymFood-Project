import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import ThemedView from "@shared/components/ui/ThemedView";

export default function ForumScreen() {
  const [searchText, setSearchText] = useState("");

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
});
