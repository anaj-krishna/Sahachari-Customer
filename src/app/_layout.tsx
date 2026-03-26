import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { Slot } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";
import { queryClient } from "../lib/queryClient";
import { useAuthStore } from "../store/auth.store";

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const [showBootSplash, setShowBootSplash] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      await Promise.resolve(hydrate());

      // Keep a short minimum duration so splash doesn't flicker on fast boots.
      setTimeout(() => {
        if (isMounted) {
          setShowBootSplash(false);
        }
      }, 900);
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [hydrate]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar
          style={showBootSplash ? "light" : "dark"}
          backgroundColor={showBootSplash ? "#0A4FD6" : "#FFFFFF"}
          translucent={false}
        />
        {showBootSplash ? (
          <View style={styles.splashContainer}>
            <Image
              source={require("../../assets/image1.png")}
              style={styles.splashImage}
              resizeMode="cover"
            />
          </View>
        ) : (
          <SafeAreaView edges={["top", "left", "right"]} style={styles.container}>
            <Slot />
          </SafeAreaView>
        )}
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  splashContainer: {
    flex: 1,
    backgroundColor: "#0A4FD6",
  },
  splashImage: {
    width: "100%",
    height: "100%",
  },
});
