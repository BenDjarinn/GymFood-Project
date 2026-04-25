import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterFormData,
} from "@shared/utils/authSchemas";
import { useSignUp, useAuth } from "@clerk/expo";
import { type Href } from "expo-router";

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const { signUp, errors: clerkErrors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const [clerkError, setClerkError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (!signUp) return;

    setClerkError(null);
    setIsSubmitting(true);

    try {
      const { error } = await signUp.password({
        emailAddress: data.email,
        password: data.password,
        firstName: data.name.split(" ")[0],
        lastName: data.name.split(" ").slice(1).join(" ") || undefined,
      });

      if (error) {
        setClerkError(error.message || "Sign-up failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Send email verification code
      await signUp.verifications.sendEmailCode();

      setPendingVerification(true);
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Sign-up failed. Please try again.";
      setClerkError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!signUp) return;

    setVerificationError(null);
    setIsSubmitting(true);

    try {
      await signUp.verifications.verifyEmailCode({
        code: verificationCode,
      });

      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }
            router.replace("/(tabs)/home" as Href);
          },
        });
      } else {
        console.log("Verification status:", signUp.status);
        setVerificationError(
          "Verification incomplete. Please try again."
        );
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Verification failed. Please try again.";
      setVerificationError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp) return;

    try {
      await signUp.verifications.sendEmailCode();
      setVerificationError(null);
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        "Failed to resend code. Please try again.";
      setVerificationError(message);
    }
  };

  const handleGoBack = () => {
    if (pendingVerification) {
      setPendingVerification(false);
      setVerificationCode("");
      setVerificationError(null);
      return;
    }
    router.push("/OnboardingScreen");
  };

  // If signed in already, redirect
  if (signUp?.status === "complete" || isSignedIn) {
    return null;
  }

  const isBusy = isSubmitting || fetchStatus === "fetching";

  // ── Verification Code Screen ──────────────────────────────
  if (pendingVerification) {
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
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={handleGoBack} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={36} color="#34699A" />
              </Pressable>
              <Text style={styles.title}>Verify Email</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.form}>
              <Text style={styles.verifyDescription}>
                We've sent a verification code to your email. Please enter it
                below to complete your registration.
              </Text>

              {verificationError && (
                <View style={styles.clerkErrorContainer}>
                  <Text style={styles.clerkErrorText}>
                    {verificationError}
                  </Text>
                </View>
              )}

              {clerkErrors?.fields?.code && (
                <View style={styles.clerkErrorContainer}>
                  <Text style={styles.clerkErrorText}>
                    {clerkErrors.fields.code.message}
                  </Text>
                </View>
              )}

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Verification Code"
                  placeholderTextColor="#A0AEC0"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  autoFocus
                  editable={!isBusy}
                />
              </View>

              {/* Verify Button */}
              <Pressable
                onPress={handleVerify}
                disabled={isBusy || !verificationCode}
                style={({ pressed }) => [
                  styles.registerButton,
                  pressed && styles.registerButtonPressed,
                  (isBusy || !verificationCode) && styles.buttonDisabled,
                ]}
              >
                {isBusy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.registerButtonText}>Verify Email</Text>
                )}
              </Pressable>

              {/* Resend Code */}
              <Pressable
                onPress={handleResendCode}
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

  // ── Registration Form Screen ──────────────────────────────
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
          {/* Header with Back Arrow and Title */}
          <View style={styles.header}>
            <Pressable onPress={handleGoBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={36} color="#34699A" />
            </Pressable>
            <Text style={styles.title}>Sign Up</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Clerk API Error */}
            {clerkError && (
              <View style={styles.clerkErrorContainer}>
                <Text style={styles.clerkErrorText}>{clerkError}</Text>
              </View>
            )}

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.name && styles.inputError,
                    ]}
                    placeholder="Name"
                    placeholderTextColor="#A0AEC0"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    editable={!isBusy}
                  />
                )}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              )}
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputContainer}>
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.phoneNumber && styles.inputError,
                    ]}
                    placeholder="Phone Number"
                    placeholderTextColor="#A0AEC0"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                    editable={!isBusy}
                  />
                )}
              />
              {errors.phoneNumber && (
                <Text style={styles.errorText}>
                  {errors.phoneNumber.message}
                </Text>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.email && styles.inputError,
                    ]}
                    placeholder="Email"
                    placeholderTextColor="#A0AEC0"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isBusy}
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.password && styles.inputError,
                    ]}
                    placeholder="Password"
                    placeholderTextColor="#A0AEC0"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    editable={!isBusy}
                  />
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>
                  {errors.password.message}
                </Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.confirmPassword && styles.inputError,
                    ]}
                    placeholder="Confirm Password"
                    placeholderTextColor="#A0AEC0"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    editable={!isBusy}
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>
                  {errors.confirmPassword.message}
                </Text>
              )}
            </View>

            {/* Continue with Google */}
            <Pressable
              style={({ pressed }) => [
                styles.googleButton,
                pressed && styles.googleButtonPressed,
              ]}
            >
              <Image
                source={require("@/assets/img/google-logo.png")}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Pressable>

            {/* Register Button */}
            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={isBusy}
              style={({ pressed }) => [
                styles.registerButton,
                pressed && styles.registerButtonPressed,
                isBusy && styles.buttonDisabled,
              ]}
            >
              {isBusy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>Register</Text>
              )}
            </Pressable>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have account? </Text>
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

export default RegisterScreen;

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
    fontSize: 32,
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
  inputError: {
    borderColor: "#E53E3E",
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 13,
    fontFamily: "SF-Pro-DisplayRegular",
    marginTop: 4,
    marginLeft: 4,
  },

  // Clerk Error
  clerkErrorContainer: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#E53E3E",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  clerkErrorText: {
    color: "#E53E3E",
    fontSize: 14,
    fontFamily: "SF-Pro-DisplayRegular",
    textAlign: "center",
  },

  // Verification
  verifyDescription: {
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#34699A",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
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

  // Google Button
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    borderWidth: 1.5,
    borderColor: "#2B5079",
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  },
  googleButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
    backgroundColor: "#F0F4F8",
  },
  googleIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  googleButtonText: {
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: "SF-Pro-DisplayBold",
    color: "#2B5079",
  },

  // Register Button
  registerButton: {
    backgroundColor: "#4A7C9B",
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  registerButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: "SF-Pro-DisplayBold",
  },
  buttonDisabled: {
    opacity: 0.6,
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
