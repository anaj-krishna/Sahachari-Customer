import { QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";
import { queryClient } from "../lib/queryClient";
import { useAuthStore } from "../store/auth.store";

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView edges={["top", "left", "right"]} style={styles.container}>
          <Slot />
        </SafeAreaView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
