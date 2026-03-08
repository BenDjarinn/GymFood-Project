import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

export interface BankAccountData {
  account_holder: string;
  bank_account: {
    bank_name: string;
    account_number: string;
  };
  important_notes: string[];
}

interface BankAccountCardProps {
  data: BankAccountData;
  onCopy?: () => void;
}

const BankAccountCard: React.FC<BankAccountCardProps> = ({ data, onCopy }) => {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(data.bank_account.account_number);
    onCopy?.();
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userRow}>
          <Feather name="user" size={22} color="#2F6A9E" />
          <Text style={styles.name}>{data.account_holder}</Text>
        </View>

        <Pressable
          onPress={handleCopy}
          hitSlop={10}
          style={({ pressed }) => [
            styles.copyBtn,
            pressed && styles.copyBtnPressed,
          ]}
        >
          <Feather name="copy" size={18} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.accountRow}>
        <Text style={styles.label}>{data.bank_account.bank_name} Account :</Text>
        <Text style={styles.accountNumber}>#{data.bank_account.account_number}</Text>
      </View>

      <View style={styles.notesBox}>
        <Text style={styles.notesTitle}>Important Notes</Text>

        {data.important_notes.map((note, index) => (
          <Text key={`${index}-${note}`} style={styles.noteItem}>
            • {note}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default BankAccountCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F8F9FB",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  name: {
    fontSize: 16,
    color: "#2F6A9E",
    fontFamily: "SF-Pro-DisplayBold",
  },

  copyBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#2F3E46",
    justifyContent: "center",
    alignItems: "center",
  },

  copyBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },

  divider: {
    height: 1,
    backgroundColor: "#2F6A9E",
    marginVertical: 14,
    opacity: 0.6,
  },

  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  label: {
    fontSize: 15,
    color: "#2F6A9E",
    fontFamily: "SF-Pro-DisplayRegular",
  },

  accountNumber: {
    fontSize: 15,
    color: "#2F6A9E",
    fontFamily: "SF-Pro-DisplayBold",
  },

  notesBox: {
    backgroundColor: "#E6E6E6",
    borderRadius: 14,
    padding: 14,
  },

  notesTitle: {
    color: "#808080",
    fontFamily: "SF-Pro-DisplayBold",
    marginBottom: 8,
  },

  noteItem: {
    fontSize: 13,
    color: "#7A7A7A",
    fontFamily: "SF-Pro-DisplayRegular",
    marginBottom: 4,
    lineHeight: 18,
  },
});