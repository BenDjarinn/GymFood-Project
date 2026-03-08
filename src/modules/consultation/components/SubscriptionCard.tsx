import React from "react";
import { View, Image, StyleSheet, ImageSourcePropType, Pressable } from "react-native";
import ThemedText from "@shared/components/ui/ThemedText";

interface SubscriptionCardProps {
  title: string;
  notes: string[];
  image: ImageSourcePropType;
  onPress?: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  title,
  notes,
  image,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {/* IMAGE */}
      <Image source={image} style={styles.image} />

      {/* INFO */}
      <View style={styles.infoContainer}>
        <ThemedText style={styles.title}>{title}</ThemedText>

        <View style={styles.notesList}>
          {notes.map((note, index) => (
            <View key={index} style={styles.noteRow}>
              <ThemedText style={styles.bullet}>•</ThemedText>
              <ThemedText style={styles.noteText}>{note}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
};

export default SubscriptionCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 18,
  },

  image: {
    width: "40%",
    height: "auto",
    minHeight: 180,
    resizeMode: "cover",
  },

  infoContainer: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },

  title: {
    fontSize: 22,
    fontFamily: "SF-Pro-DisplayBold",
    color: "#34699A",
    textAlign: "center",
    marginBottom: 14,
  },

  notesList: {
    gap: 8,
  },

  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  bullet: {
    fontSize: 16,
    color: "#34699A",
    marginRight: 8,
    lineHeight: 22,
  },

  noteText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
    lineHeight: 22,
  },
});
