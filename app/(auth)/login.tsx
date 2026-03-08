import React from "react";
import { StyleSheet, Text } from "react-native";
import { Link } from "expo-router";
import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";
import Spacer from "@shared/components/ui/Spacer";
import ThemedButton from "@shared/components/ui/ThemedButton";

const Login: React.FC = () => {
  const handleSubmit = async () => {
    console.log("login form submitted");
  };

  return (
    <ThemedView style={styles.container}>
      <Spacer />
      <ThemedText title={true} style={styles.title}>
        Login to Your Account
      </ThemedText>

      <ThemedButton onPress={handleSubmit}>
        <Text style={{ color: "#f2f2f2" }}>Login</Text>
      </ThemedButton>

      <Spacer height={100} />
      <Link href="/register" replace>
        <ThemedText style={{ textAlign: "center" }}>Register instead</ThemedText>
      </Link>
    </ThemedView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 30,
  },
});
