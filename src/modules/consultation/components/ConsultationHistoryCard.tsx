import React from "react";
import { View, Image, StyleSheet, ImageSourcePropType } from "react-native";
import ThemedText from "@shared/components/ui/ThemedText";
import { CompletedConsultationOrder } from "@shared/types/data";
import { subscriptionPlanImages } from "@shared/constants/subscriptionPlanImages";

interface ConsultationHistoryCardProps {
  order: CompletedConsultationOrder;
}

const ConsultationHistoryCard: React.FC<ConsultationHistoryCardProps> = ({
  order,
}) => {
  const imageSource: ImageSourcePropType | undefined =
    subscriptionPlanImages[order.planImage];

  return (
    <View style={styles.card}>
      {/* Left image */}
      {imageSource && <Image source={imageSource} style={styles.image} />}

      {/* Right info */}
      <View style={styles.infoContainer}>
        <ThemedText style={styles.title}>{order.planName}</ThemedText>

        <View style={styles.notesList}>
          {order.planNotes.map((note, index) => (
            <View key={index} style={styles.noteRow}>
              <ThemedText style={styles.bullet}>•</ThemedText>
              <ThemedText style={styles.noteText}>{note}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default ConsultationHistoryCard;

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
    marginTop: 20,
    marginHorizontal: 12,
  },

  image: {
    width: "35%",
    height: "auto",
    minHeight: 160,
    resizeMode: "cover",
  },

  infoContainer: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },

  title: {
    fontSize: 20,
    fontFamily: "SF-Pro-DisplayBold",
    color: "#34699A",
    fontStyle: "italic",
    marginBottom: 12,
  },

  notesList: {
    gap: 6,
  },

  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  bullet: {
    fontSize: 14,
    color: "#34699A",
    marginRight: 6,
    lineHeight: 20,
  },

  noteText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
    lineHeight: 20,
  },
});
