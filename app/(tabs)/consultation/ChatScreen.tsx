import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";
import { useConsultationHistoryStore } from "@modules/consultation/store/useConsultationHistoryStore";

// Coach profile data
const COACH = {
  name: "Sander",
  avatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
};

// Welcome messages from the coach (static for Phase 1)
const WELCOME_MESSAGES = [
  "Hey, there",
  "You may consultate here",
  "Feel free to message me anytime. Dont call me yet",
];

interface ChatBubbleProps {
  text: string;
  isCoach: boolean;
  showAvatar?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  text,
  isCoach,
  showAvatar = false,
}) => (
  <View
    style={[
      styles.bubbleRow,
      isCoach ? styles.bubbleRowLeft : styles.bubbleRowRight,
    ]}
  >
    {isCoach && showAvatar && (
      <Image source={{ uri: COACH.avatar }} style={styles.bubbleAvatar} />
    )}
    {isCoach && !showAvatar && <View style={styles.bubbleAvatarSpacer} />}

    <View
      style={[
        styles.bubble,
        isCoach ? styles.coachBubble : styles.userBubble,
      ]}
    >
      <ThemedText
        style={[
          styles.bubbleText,
          isCoach ? styles.coachBubbleText : styles.userBubbleText,
        ]}
      >
        {text}
      </ThemedText>
    </View>
  </View>
);

export default function ChatScreen() {
  const { orderId, planName } = useLocalSearchParams<{
    orderId: string;
    planName: string;
  }>();

  const endSession = useConsultationHistoryStore((s) => s.endSession);
  const [messageText, setMessageText] = useState("");

  const handleEndSession = () => {
    Alert.alert(
      "End Session",
      "Are you sure you want to end this consultation session? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Session",
          style: "destructive",
          onPress: async () => {
            if (orderId) {
              await endSession(orderId);
            }
            router.back();
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* ── TITLE BAR ─────────────────────────────────── */}
      <View style={styles.titleBar}>
        <ThemedText style={styles.titleText}>
          {planName ?? "Program"} Program Consultation
        </ThemedText>
      </View>

      {/* ── HEADER ROW: back + avatar + coach info + icons ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={32} color="#34699A" />
        </Pressable>

        <Image source={{ uri: COACH.avatar }} style={styles.coachAvatar} />

        <View style={styles.coachInfo}>
          <ThemedText style={styles.coachName}>{COACH.name}</ThemedText>
          <ThemedText style={styles.coachOnline}>Online</ThemedText>
        </View>

        <View style={styles.headerIcons}>
          <Pressable hitSlop={8}>
            <MaterialIcons name="phone" size={24} color="#34699A" />
          </Pressable>
          <Pressable hitSlop={8}>
            <MaterialIcons name="videocam" size={24} color="#34699A" />
          </Pressable>
          <Pressable onPress={handleEndSession} hitSlop={8}>
            <MaterialIcons name="logout" size={22} color="#CC475A" />
          </Pressable>
        </View>
      </View>

      {/* ── SEPARATOR ─────────────────────────────────── */}
      <View style={styles.separator} />

      {/* ── CHAT AREA ─────────────────────────────────── */}
      <ScrollView
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Day label */}
        <ThemedText style={styles.dayLabel}>Today</ThemedText>

        {/* Welcome messages from coach */}
        {WELCOME_MESSAGES.map((msg, i) => (
          <ChatBubble
            key={`coach-${i}`}
            text={msg}
            isCoach
            showAvatar={i === 0}
          />
        ))}
      </ScrollView>

      {/* ── INPUT BAR ─────────────────────────────────── */}
      <View style={styles.inputBar}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#A0BDD4"
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <View style={styles.inputIcons}>
            <Pressable hitSlop={6}>
              <MaterialIcons name="mic" size={24} color="#34699A" />
            </Pressable>
            <Pressable hitSlop={6}>
              <MaterialIcons name="attach-file" size={24} color="#34699A" />
            </Pressable>
            <Pressable hitSlop={6}>
              <MaterialIcons name="send" size={24} color="#34699A" />
            </Pressable>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* ── Title Bar ── */
  titleBar: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  titleText: {
    fontSize: 20,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
  },

  /* ── Header Row ── */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 12,
  },
  coachAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#34699A",
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 16,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayBold",
  },
  coachOnline: {
    fontSize: 12,
    color: "#4CAF50",
    fontFamily: "SF-Pro-DisplayRegular",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  /* ── Separator ── */
  separator: {
    height: 1,
    backgroundColor: "#D0DDE8",
    marginHorizontal: 0,
  },

  /* ── Chat Area ── */
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },

  /* ── Day Label ── */
  dayLabel: {
    textAlign: "center",
    fontSize: 13,
    color: "#A0BDD4",
    fontFamily: "SF-Pro-DisplayRegular",
    marginBottom: 16,
  },

  /* ── Bubble Row ── */
  bubbleRow: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "flex-end",
  },
  bubbleRowLeft: {
    justifyContent: "flex-start",
  },
  bubbleRowRight: {
    justifyContent: "flex-end",
  },

  /* ── Avatar in Bubble ── */
  bubbleAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  bubbleAvatarSpacer: {
    width: 36,
    marginRight: 8,
  },

  /* ── Chat Bubble ── */
  bubble: {
    maxWidth: "70%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  coachBubble: {
    backgroundColor: "#4A90B8",
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: "#E8F0F8",
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: "SF-Pro-DisplayRegular",
    lineHeight: 20,
  },
  coachBubbleText: {
    color: "#FFFFFF",
  },
  userBubbleText: {
    color: "#34699A",
  },

  /* ── Input Bar ── */
  inputBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#34699A",
    borderRadius: 28,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
    paddingVertical: 8,
    maxHeight: 100,
  },
  inputIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginLeft: 8,
  },
});
