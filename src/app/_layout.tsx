import React, { useCallback, useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, RefreshControl, StyleSheet } from "react-native";
import "../../global.css";
import { queryClient } from "../lib/queryClient";
import { useAuthStore } from "../store/auth.store";

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries();
      // active queries will refetch automatically
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content} // flexGrow makes pull‑to‑refresh fire
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
        >
          <Slot />
        </ScrollView>
      </SafeAreaView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
});
