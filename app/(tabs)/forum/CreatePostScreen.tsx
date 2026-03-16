import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";

const CATEGORIES = [
  { label: "Healthy Recipes" },
  { label: "Fitness & Diet" },
  { label: "Lunchbox Ideas" },
  { label: "Snacks" },
];

export default function CreatePostScreen() {
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    CATEGORIES[0].label
  );
  const [description, setDescription] = useState("");
  const [titleFocused, setTitleFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={32} color="#34699A" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Create Post</ThemedText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Title ── */}
        <ThemedText style={styles.fieldLabel}>Title</ThemedText>
        <TextInput
          style={[styles.titleInput, titleFocused && styles.titleInputFocused]}
          value={title}
          onChangeText={setTitle}
          onFocus={() => setTitleFocused(true)}
          onBlur={() => setTitleFocused(false)}
          placeholderTextColor="#A0BDD4"
        />

        {/* ── Category ── */}
        <ThemedText style={styles.fieldLabel}>Category</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.label;
            return (
              <Pressable
                key={cat.label}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedCategory(cat.label)}
              >
                <ThemedText
                  style={[styles.chipLabel, active && styles.chipLabelActive]}
                >
                  {cat.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Foto ── */}
        <ThemedText style={styles.fieldLabel}>Foto</ThemedText>
        {imageUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <Pressable
              onPress={() => setImageUri(null)}
              style={({ pressed }) => [
                styles.removeBtn,
                pressed && { opacity: 0.7, transform: [{ scale: 0.9 }] },
              ]}
            >
              <MaterialIcons name="close" size={20} color="#fff" />
            </Pressable>
            <Pressable
              onPress={pickImage}
              style={({ pressed }) => [
                styles.changeBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <MaterialIcons name="image" size={18} color="#fff" />
              <ThemedText style={styles.changeBtnText}>Change Photo</ThemedText>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.photoBox,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={pickImage}
          >
            <MaterialIcons name="image" size={56} color="#34699A" />
            <ThemedText style={styles.photoHint}>
              Format .png, .jpg, .heif
            </ThemedText>
          </Pressable>
        )}

        {/* ── Description ── */}
        <ThemedText style={styles.fieldLabel}>Description</ThemedText>
        <TextInput
          style={[styles.textArea, descFocused && styles.textAreaFocused]}
          placeholder="Describe"
          placeholderTextColor="#A0BDD4"
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
          onFocus={() => setDescFocused(true)}
          onBlur={() => setDescFocused(false)}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* ── Header ── */
  header: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerTitle: {
    fontSize: 22,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
  },

  scrollContent: {
    paddingTop: 10,
    paddingBottom: 50,
    paddingHorizontal: 25,
  },

  /* ── Field Labels ── */
  fieldLabel: {
    fontSize: 20,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
    marginBottom: 14,

  },

  /* ── Title Input ── */
  titleInput: {
    borderWidth: 1,
    borderColor: "#D0DDE8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
    backgroundColor: "#fff",
    marginBottom: 20,
  },

  titleInputFocused: {
    borderColor: "#34699A",
  },

  /* ── Category Chips ── */
  chipsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },

  chip: {
    backgroundColor: "#727272",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  chipActive: {
    backgroundColor: "#34699A",
  },

  chipLabel: {
    fontSize: 14,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#fff",
  },

  chipLabelActive: {
    fontFamily: "SF-Pro-DisplayBold",
  },

  /* ── Photo Upload Box ── */
  photoBox: {
    borderWidth: 1,
    borderColor: "#34699A",
    borderRadius: 14,
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginBottom: 24,
    gap: 8,
  },

  photoHint: {
    fontSize: 13,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
  },

  /* ── Photo Preview ── */
  previewWrap: {
    position: "relative",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 24,
  },

  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
  },

  removeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  changeBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  changeBtnText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "SF-Pro-DisplayBold",
  },

  /* ── Description TextArea ── */
  textArea: {
    borderWidth: 1,
    borderColor: "#D0DDE8",
    borderRadius: 14,
    padding: 14,
    minHeight: 200,
    fontSize: 15,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
    backgroundColor: "#fff",
    marginBottom: 20,
  },

  textAreaFocused: {
    borderColor: "#34699A",
  },
});
