import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
} from "react-native";
import { router } from "expo-router";

import ThemedView from "@shared/components/ui/ThemedView";
import ThemedText from "@shared/components/ui/ThemedText";
import OrderHistoryCard from "@modules/checkout/components/OrderHistoryCard";
import { useOrderHistoryStore } from "@modules/cart/store/useOrderHistoryStore";

const TABS = ["Food", "Loyalty Program"];

export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState("Food");
  const orders = useOrderHistoryStore((s) => s.orders);

  return (
    <ThemedView style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              style={styles.tab}
              onPress={() => setActiveTab(tab)}
            >
              <ThemedText
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab}
              </ThemedText>
              {isActive && <View style={styles.tabIndicator} />}
            </Pressable>
          );
        })}
      </View>

      {/* Tab Content */}
      {activeTab === "Food" && (
        <>
          {orders.length === 0 ? (
            <View style={styles.emptyWrap}>
              <ThemedText style={styles.emptyText}>
                No order history yet.
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={orders}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <OrderHistoryCard
                  order={item}
                  onPress={() =>
                    router.push({
                      pathname: "/(review)/OrderReviewScreen",
                      params: { orderId: item.id },
                    })
                  }
                  onReorder={() => console.log("Reorder", item.id)}
                />
              )}
            />
          )}
        </>
      )}

      {activeTab === "Loyalty Program" && (
        <View style={styles.emptyWrap}>
          <ThemedText style={styles.emptyText}>Coming soon.</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 75,
  },

  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#D0DDE8",
  },

  tab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 10,
  },

  tabLabel: {
    fontSize: 20,
    fontFamily: "SF-Pro-DisplayRegular",
    color: "#A0BDD4",
  },

  tabLabelActive: {
    color: "#34699A",
  },

  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: "#34699A",
    borderRadius: 2,
  },

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayRegular",
    opacity: 0.6,
  },
});
