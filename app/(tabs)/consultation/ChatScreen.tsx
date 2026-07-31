import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { router, useLocalSearchParams, useNavigation, useFocusEffect } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";
import { useConsultationHistoryStore } from "@modules/consultation/store/useConsultationHistoryStore";
import { useFitnessChat } from "@modules/consultation/hooks/useFitnessChat";
import type { ChatMessageItem } from "@shared/types/chat";
import type { ConsultationIntake } from "@shared/types/data";

// Coach profile data
const COACH = {
  name: "Coach Jim",
  avatar:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&h=150&fit=crop",
};

// ── Chat Bubble Component ─────────────────────────────────────
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

// ── Typing Indicator Component ────────────────────────────────
const useDotBounce = (delay: number) => {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1,
          duration: 350,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 350,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [value, delay]);

  return {
    transform: [
      {
        translateY: value.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -6],
        }),
      },
    ],
    opacity: value.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    }),
  };
};

const TypingIndicator: React.FC = () => {
  const dot1 = useDotBounce(0);
  const dot2 = useDotBounce(150);
  const dot3 = useDotBounce(300);

  return (
    <View style={[styles.bubbleRow, styles.bubbleRowLeft]}>
      <Image source={{ uri: COACH.avatar }} style={styles.bubbleAvatar} />
      <View style={[styles.bubble, styles.coachBubble, styles.typingBubble]}>
        <View style={styles.typingDots}>
          <Animated.View style={[styles.dot, dot1]} />
          <Animated.View style={[styles.dot, dot2]} />
          <Animated.View style={[styles.dot, dot3]} />
        </View>
      </View>
    </View>
  );
};

// ── Main ChatScreen ───────────────────────────────────────────
export default function ChatScreen() {
  const { orderId, planName, intake: intakeParam } = useLocalSearchParams<{
    orderId: string;
    planName: string;
    intake?: string;
  }>();

  // ── Hide tab bar only when ChatScreen is focused ────────
  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ tabBarStyle: { display: "none" } });

      return () => {
        parent?.setOptions({
          tabBarStyle: {
            display: "flex",
            backgroundColor: "#FFFFFF",
            borderTopWidth: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 8,
            paddingTop: 25,
            paddingBottom: 30,
            paddingHorizontal: 8,
          },
        });
      };
    }, [navigation])
  );

  const endSession = useConsultationHistoryStore((s) => s.endSession);
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Resolve intake from route params first, then from the active session in
  // the local store. Channels created with intake on the server already
  // carry it as custom data, so this only matters for the first connect.
  const intake = useMemo<ConsultationIntake | undefined>(() => {
    if (intakeParam) {
      try {
        return JSON.parse(intakeParam) as ConsultationIntake;
      } catch {
        // fall through
      }
    }
    return useConsultationHistoryStore
      .getState()
      .orders.find((o) => o.id === orderId)?.intake;
  }, [intakeParam, orderId]);

  // ── Custom hook: all chat logic extracted here ──────────
  const {
    messages,
    isLoading,
    isCoachTyping,
    error,
    sendMessage,
    clientReady,
  } = useFitnessChat(orderId, intake);

  // ── Send handler ────────────────────────────────────────
  const handleSend = useCallback(() => {
    if (!messageText.trim()) return;
    sendMessage(messageText);
    setMessageText("");
  }, [messageText, sendMessage]);

  // ── End session handler ─────────────────────────────────
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
            router.replace("/(tabs)/consultation");
          },
        },
      ]
    );
  };

  // ── Render a single message ─────────────────────────────
  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessageItem; index: number }) => {
      // Show avatar on first coach message or after a user message
      const prevMsg = index > 0 ? messages[index - 1] : null;
      const showAvatar = item.isCoach && (!prevMsg || !prevMsg.isCoach);

      return (
        <ChatBubble
          text={item.text}
          isCoach={item.isCoach}
          showAvatar={showAvatar}
        />
      );
    },
    [messages]
  );

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
          <ThemedText style={styles.coachOnline}>
            {isCoachTyping ? "Typing..." : "Online"}
          </ThemedText>
        </View>

        <View style={styles.headerIcons}>
          <Pressable
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && styles.iconBtnPressed,
            ]}
          >
            <MaterialIcons name="phone" size={24} color="#34699A" />
          </Pressable>
          <Pressable
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && styles.iconBtnPressed,
            ]}
          >
            <MaterialIcons name="videocam" size={24} color="#34699A" />
          </Pressable>
          <Pressable
            onPress={handleEndSession}
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && styles.iconBtnEndPressed,
            ]}
          >
            <MaterialIcons name="logout" size={22} color="#CC475A" />
          </Pressable>
        </View>
      </View>

      {/* ── SEPARATOR ─────────────────────────────────── */}
      <View style={styles.separator} />

      {/* ── CHAT AREA with KeyboardAvoidingView ────────── */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Loading state */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#34699A" />
            <ThemedText style={styles.loadingText}>
              Connecting to Coach Jim...
            </ThemedText>
          </View>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={36} color="#CC475A" />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        {/* Message list — FlatList for performance */}
        {clientReady && (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            // Auto-scroll to newest message
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            // Performance optimizations
            maxToRenderPerBatch={15}
            windowSize={10}
            removeClippedSubviews={Platform.OS === "android"}
            // Day label as header
            ListHeaderComponent={
              <ThemedText style={styles.dayLabel}>Today</ThemedText>
            }
            // Typing indicator as footer
            ListFooterComponent={isCoachTyping ? <TypingIndicator /> : null}
          />
        )}

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
              editable={clientReady}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <View style={styles.inputIcons}>
              <Pressable
                hitSlop={6}
                style={({ pressed }) => [
                  styles.inputIconBtn,
                  pressed && styles.inputIconBtnPressed,
                ]}
              >
                <MaterialIcons name="mic" size={24} color="#34699A" />
              </Pressable>
              <Pressable
                hitSlop={6}
                style={({ pressed }) => [
                  styles.inputIconBtn,
                  pressed && styles.inputIconBtnPressed,
                ]}
              >
                <MaterialIcons name="attach-file" size={24} color="#34699A" />
              </Pressable>
              <Pressable
                onPress={handleSend}
                disabled={!messageText.trim() || !clientReady}
                hitSlop={6}
                style={({ pressed }) => [
                  styles.inputIconBtn,
                  styles.sendBtn,
                  (!messageText.trim() || !clientReady) &&
                    styles.sendBtnDisabled,
                  pressed &&
                    messageText.trim() &&
                    clientReady &&
                    styles.sendBtnPressed,
                ]}
              >
                <MaterialIcons name="send" size={22} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* ── Title Bar ── */
  titleBar: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 25,
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

  /* ── Loading / Error ── */
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#A0BDD4",
    fontFamily: "SF-Pro-DisplayRegular",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 14,
    color: "#CC475A",
    fontFamily: "SF-Pro-DisplayRegular",
    textAlign: "center",
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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  bubbleAvatarSpacer: {
    width: 40,
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

  /* ── Typing Indicator ── */
  typingBubble: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  typingDots: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
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
    gap: 8,
    marginLeft: 8,
  },

  /* ── Icon Button (header) ── */
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconBtnPressed: {
    backgroundColor: "rgba(52, 105, 154, 0.12)",
    transform: [{ scale: 0.88 }],
  },
  iconBtnEndPressed: {
    backgroundColor: "rgba(204, 71, 90, 0.10)",
    transform: [{ scale: 0.88 }],
  },

  /* ── Icon Button (input bar) ── */
  inputIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  inputIconBtnPressed: {
    backgroundColor: "rgba(52, 105, 154, 0.12)",
    transform: [{ scale: 0.85 }],
  },

  /* ── Send Button ── */
  sendBtn: {
    backgroundColor: "#34699A",
  },
  sendBtnDisabled: {
    backgroundColor: "#A0BDD4",
  },
  sendBtnPressed: {
    backgroundColor: "#2A5580",
    transform: [{ scale: 0.85 }],
  },
});
