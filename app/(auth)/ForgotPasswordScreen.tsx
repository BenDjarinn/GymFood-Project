import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useSignIn } from "@clerk/expo";

const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { signIn, errors: clerkErrors, fetchStatus } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBusy = fetchStatus === "fetching";

  // ── Step 1: Send reset code ──────────────────────────────────
  const handleSendCode = useCallback(async () => {
    if (!signIn || !emailAddress.trim()) return;
    setError(null);

    try {
      const { error: createError } = await signIn.create({
        identifier: emailAddress,
      });

      if (createError) {
        setError(createError.message || "Could not find this account.");
        return;
      }

      const { error: sendCodeError } =
        await signIn.resetPasswordEmailCode.sendCode();

      if (sendCodeError) {
        setError(sendCodeError.message || "Failed to send reset code.");
        return;
      }

      setCodeSent(true);
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Something went wrong. Please try again.";
      setError(message);
    }
  }, [signIn, emailAddress]);

  // ── Step 2: Verify reset code ────────────────────────────────
  const handleVerifyCode = useCallback(async () => {
    if (!signIn || !code.trim()) return;
    setError(null);

    try {
      const { error: verifyError } =
        await signIn.resetPasswordEmailCode.verifyCode({ code });

      if (verifyError) {
        setError(verifyError.message || "Invalid code. Please try again.");
        return;
      }
      // signIn.status will transition to 'needs_new_password'
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Verification failed. Please try again.";
      setError(message);
    }
  }, [signIn, code]);

  // ── Step 3: Submit new password ──────────────────────────────
  const handleSubmitPassword = useCallback(async () => {
    if (!signIn || !password.trim()) return;
    setError(null);

    try {
      const { error: submitError } =
        await signIn.resetPasswordEmailCode.submitPassword({ password });

      if (submitError) {
        setError(submitError.message || "Failed to update password.");
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session }) => {
            if (session?.currentTask) {
              console.log(session.currentTask);
              return;
            }
            router.replace("/(tabs)/home" as any);
          },
        });
      } else {
        setError("Password reset requires additional steps.");
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Failed to reset password. Please try again.";
      setError(message);
    }
  }, [signIn, password, router]);

  const handleGoBack = () => {
    if (signIn?.status === "needs_new_password") {
      // Can't go back from new-password step easily, navigate to login
      router.replace("/(auth)/LoginScreen" as any);
      return;
    }
    if (codeSent) {
      setCodeSent(false);
      setCode("");
      setError(null);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/LoginScreen" as any);
    }
  };

  // ── Step 3 UI: New Password ──────────────────────────────────
  if (signIn?.status === "needs_new_password") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Pressable onPress={handleGoBack} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={36} color="#34699A" />
              </Pressable>
              <Text style={styles.title}>New Password</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.form}>
              <Text style={styles.description}>
                Enter your new password below. It must be at least 8 characters
                long.
              </Text>

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {clerkErrors?.fields?.password && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    {clerkErrors.fields.password.message}
                  </Text>
                </View>
              )}

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor="#A0AEC0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isBusy}
                />
              </View>

              <Pressable
                onPress={handleSubmitPassword}
                disabled={isBusy || !password.trim()}
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.actionButtonPressed,
                  (isBusy || !password.trim()) && styles.buttonDisabled,
                ]}
              >
                {isBusy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Set New Password</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Step 2 UI: Verify Code ───────────────────────────────────
  if (codeSent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Pressable onPress={handleGoBack} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={36} color="#34699A" />
              </Pressable>
              <Text style={styles.title}>Verify Code</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.form}>
              <Text style={styles.description}>
                Enter the password reset code that was sent to your email
                address.
              </Text>

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {clerkErrors?.fields?.code && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    {clerkErrors.fields.code.message}
                  </Text>
                </View>
              )}

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Verification Code"
                  placeholderTextColor="#A0AEC0"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  autoFocus
                  editable={!isBusy}
                />
              </View>

              <Pressable
                onPress={handleVerifyCode}
                disabled={isBusy || !code.trim()}
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.actionButtonPressed,
                  (isBusy || !code.trim()) && styles.buttonDisabled,
                ]}
              >
                {isBusy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Verify Code</Text>
                )}
              </Pressable>

              <Pressable
                onPress={handleSendCode}
                disabled={isBusy}
                style={styles.resendContainer}
              >
                <Text style={styles.resendText}>
                  Didn't receive a code?{" "}
                </Text>
                <Text style={styles.resendLink}>Resend</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Step 1 UI: Enter Email ───────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable onPress={handleGoBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={36} color="#34699A" />
            </Pressable>
            <Text style={styles.title}>Forgot Password</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.form}>
            <Text style={styles.description}>
              Enter your email address and we'll send you a code to reset your
              password.
            </Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {clerkErrors?.fields?.identifier && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {clerkErrors.fields.identifier.message}
                </Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#A0AEC0"
                value={emailAddress}
                onChangeText={setEmailAddress}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                editable={!isBusy}
              />
            </View>

            <Pressable
              onPress={handleSendCode}
              disabled={isBusy || !emailAddress.trim()}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed,
                (isBusy || !emailAddress.trim()) && styles.buttonDisabled,
              ]}
            >
              {isBusy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>Send Reset Code</Text>
              )}
            </Pressable>

            {/* Back to Sign In */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Remember your password? </Text>
              <Link href="/LoginScreen" asChild>
                <Pressable>
                  <Text style={styles.signInLink}>Sign In</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 30,
    marginBottom: 40,
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 28,
    fontFamily: "SF-Pro-DisplayBold",
    fontWeight: "bold",
    color: "#34699A",
    textAlign: "center",
  },
  headerSpacer: {
    width: 36,
  },

  // Form
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#34699A",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 18,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#2B3A52",
    backgroundColor: "#FFFFFF",
  },

  // Error
  errorContainer: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#E53E3E",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 14,
    fontFamily: "SF-Pro-DisplayRegular",
    textAlign: "center",
  },

  // Action Button
  actionButton: {
    backgroundColor: "#4A7C9B",
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  actionButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: "SF-Pro-DisplayBold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Resend
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  resendText: {
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#58A0C8",
  },
  resendLink: {
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayBold",
    color: "#58A0C8",
  },

  // Sign In Link
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#58A0C8",
  },
  signInLink: {
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayBold",
    color: "#58A0C8",
  },
});
