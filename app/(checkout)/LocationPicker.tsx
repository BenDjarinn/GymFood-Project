import React, { useCallback, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Platform,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";

import ThemedText from "@shared/components/ui/ThemedText";
import PrimaryButton from "@shared/components/ui/PrimaryButton";
import { useReverseGeocode } from "@modules/checkout/hooks/useReverseGeocode";

// ── Types ──────────────────────────────────────────────────
export interface SelectedLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export interface LocationPickerProps {
  /** Initial center. Defaults to Jakarta. */
  initialLatitude?: number;
  initialLongitude?: number;
  /** Called when the user presses "Confirm this location". */
  onConfirm?: (location: SelectedLocation) => void;
}

// ── Constants ──────────────────────────────────────────────
const BLUE = "#34699A";
const GREEN = "#37A446";

const DEFAULT_LAT = -6.2;
const DEFAULT_LNG = 106.8;

// ── Leaflet HTML ───────────────────────────────────────────
const buildMapHtml = (lat: number, lng: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      center: [${lat}, ${lng}],
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Notify RN when dragging starts
    map.on('movestart', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'dragstart' }));
    });

    // Notify RN when dragging ends with new center
    map.on('moveend', function() {
      var center = map.getCenter();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'dragend',
        lat: center.lat,
        lng: center.lng,
      }));
    });

    // Send initial position
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'dragend',
      lat: ${lat},
      lng: ${lng},
    }));
  </script>
</body>
</html>
`;

// ── Component ──────────────────────────────────────────────
const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLatitude = DEFAULT_LAT,
  initialLongitude = DEFAULT_LNG,
  onConfirm,
}) => {
  // Current map center
  const [center, setCenter] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });

  const [isDragging, setIsDragging] = useState(false);

  // Reverse geocoding
  const { address, loading, error, lookup } = useReverseGeocode();

  // Map HTML (memoized to avoid WebView re-renders)
  const mapHtml = useRef(buildMapHtml(initialLatitude, initialLongitude)).current;

  // ── WebView message handler ────────────────────────────
  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === "dragstart") {
          setIsDragging(true);
        }

        if (data.type === "dragend") {
          setIsDragging(false);
          setCenter({ latitude: data.lat, longitude: data.lng });
          lookup(data.lat, data.lng);
        }
      } catch {
        // Ignore malformed messages
      }
    },
    [lookup]
  );

  // ── Confirm ────────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    const payload: SelectedLocation = {
      address,
      latitude: center.latitude,
      longitude: center.longitude,
    };

    console.log("📍 Confirmed location:", payload);

    if (onConfirm) {
      onConfirm(payload);
    }
  }, [address, center, onConfirm]);

  // ── Render ─────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* ── Map via WebView ─────────────────────────────── */}
      <WebView
        source={{ html: mapHtml }}
        style={StyleSheet.absoluteFillObject}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="large" color={BLUE} />
          </View>
        )}
        onMessage={handleMessage}
      />

      {/* ── Back button ────────────────────────────────── */}
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        style={({ pressed }) => [
          styles.backBtn,
          pressed && { opacity: 0.7 },
        ]}
      >
        <MaterialIcons name="arrow-back" size={26} color={BLUE} />
      </Pressable>

      {/* ── Fixed crosshair pin (center of screen) ─────── */}
      <View style={styles.pinContainer} pointerEvents="none">
        {/* Shadow ellipse */}
        <View
          style={[
            styles.pinShadow,
            isDragging && styles.pinShadowDragging,
          ]}
        />

        {/* Pin icon */}
        <View
          style={[
            styles.pinIcon,
            isDragging && styles.pinIconDragging,
          ]}
        >
          <MaterialIcons name="location-on" size={48} color="#E74C3C" />
        </View>
      </View>

      {/* ── Bottom card overlay ─────────────────────────── */}
      <View style={styles.bottomCard}>
        {/* Address row */}
        <View style={styles.addressRow}>
          <MaterialIcons
            name="location-on"
            size={26}
            color={GREEN}
            style={styles.addressIcon}
          />

          <View style={styles.addressTextWrap}>
            <ThemedText style={styles.addressLabel}>
              Delivery location
            </ThemedText>

            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={BLUE} />
                <ThemedText style={styles.loadingText}>
                  Finding address…
                </ThemedText>
              </View>
            ) : (
              <ThemedText
                style={[
                  styles.addressValue,
                  error && styles.addressError,
                ]}
                numberOfLines={2}
              >
                {address}
              </ThemedText>
            )}

            <ThemedText style={styles.coords}>
              {center.latitude.toFixed(6)}, {center.longitude.toFixed(6)}
            </ThemedText>
          </View>
        </View>

        {/* Confirm button */}
        <PrimaryButton
          label="Confirm this location"
          icon="check"
          onPress={handleConfirm}
          disabled={loading}
          style={styles.confirmBtn}
        />
      </View>
    </View>
  );
};

export default LocationPicker;

// ── Styles ─────────────────────────────────────────────────
const CARD_RADIUS = 22;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  mapLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Back button ──────────────────────────────────────
  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 44,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,

    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  // ── Crosshair pin ────────────────────────────────────
  pinContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    // Offset so pin tip aligns with center
    paddingBottom: 48,
  },

  pinIcon: {
    // Normal state
    transform: [{ translateY: 0 }, { scale: 1 }],
  },

  pinIconDragging: {
    // Lift up while dragging
    transform: [{ translateY: -12 }, { scale: 1.08 }],
  },

  pinShadow: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#000",
    opacity: 0.25,
    bottom: "50%",
    marginBottom: -34,
    transform: [{ scaleX: 1 }, { scaleY: 0.5 }],
  },

  pinShadowDragging: {
    opacity: 0.12,
    transform: [{ scaleX: 1.6 }, { scaleY: 0.5 }],
  },

  // ── Bottom card ──────────────────────────────────────
  bottomCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: Platform.OS === "ios" ? 38 : 24,
    zIndex: 25,

    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  addressIcon: {
    marginTop: 2,
    marginRight: 12,
  },

  addressTextWrap: {
    flex: 1,
  },

  addressLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    fontFamily: "SF-Pro-DisplayRegular",
    letterSpacing: 0.4,
    marginBottom: 4,
  },

  addressValue: {
    fontSize: 15,
    lineHeight: 21,
    color: BLUE,
    fontFamily: "SF-Pro-DisplayBold",
  },

  addressError: {
    color: "#E74C3C",
    fontFamily: "SF-Pro-DisplayRegular",
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  loadingText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: "SF-Pro-DisplayRegular",
  },

  coords: {
    marginTop: 4,
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "SF-Pro-DisplayRegular",
  },

  confirmBtn: {
    marginTop: 2,
  },
});
