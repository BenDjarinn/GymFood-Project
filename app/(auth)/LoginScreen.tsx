import React from "react";
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
} from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@shared/utils/authSchemas";

const LoginScreen: React.FC = () => {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (data: LoginFormData) => {
    console.log("Sign in submitted", data);
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

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
            <Text style={styles.title}>Sign In</Text>
            {/* Spacer to balance the back button */}
            <View style={styles.headerSpacer} />
          </View>

          {/* Form */}
          <View style={styles.form}>
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
                  />
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>
                  {errors.password.message}
                </Text>
              )}
            </View>

            {/* Forget Password */}
            <Pressable style={styles.forgetPasswordContainer}>
              <Text style={styles.forgetPasswordText}>Forget Password?</Text>
            </Pressable>

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

            {/* Sign In Button */}
            <Pressable
              onPress={handleSubmit(onSubmit)}
              style={({ pressed }) => [
                styles.signInButton,
                pressed && styles.signInButtonPressed,
              ]}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </Pressable>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Dont have an account? </Text>
              <Link href="/RegisterScreen" asChild>
                <Pressable>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

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

  // Forget Password
  forgetPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgetPasswordText: {
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayMedium",
    fontWeight: "bold",
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

  // Sign In Button
  signInButton: {
    backgroundColor: "#4A7C9B",
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  signInButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: "SF-Pro-DisplayBold",
  },

  // Sign Up
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#58A0C8",
  },
  signUpLink: {
    fontSize: 16,
    fontFamily: "SF-Pro-DisplayBold",
    color: "#58A0C8",
  },
});
