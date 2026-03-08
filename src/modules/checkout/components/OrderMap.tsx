import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

interface OrderMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const OrderMap: React.FC<OrderMapProps> = ({
  latitude,
  longitude,
  onLocationChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WHERE TO?</Text>

      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          region={{
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            onLocationChange(latitude, longitude);
          }}
        >
          <Marker
            coordinate={{ latitude, longitude }}
            draggable
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              onLocationChange(latitude, longitude);
            }}
          />
        </MapView>
      </View>

      <Text style={styles.coords}>
        Lat: {latitude.toFixed(6)} | Lng: {longitude.toFixed(6)}
      </Text>
    </View>
  );
};

export default OrderMap;

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D2D4D8",
  },
  title: {
    fontSize: 14,
    color: "#34699A",
    fontFamily: "SF-Pro-DisplayBold",
    letterSpacing: 1,
    fontWeight: "600",
    marginBottom: 10,
  },
  mapWrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: 200,
  },
  coords: {
    marginTop: 10,
    fontSize: 12,
    color: "#666",
  },
});
