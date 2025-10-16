import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { useGameStore } from "../src/store/gameStore";
import { AdConsentProvider } from "../src/contexts/AdConsentContext";
import LoadingScreen from "../src/components/LoadingScreen";

export default function Layout() {
  const [isReady, setIsReady] = useState(false);
  const hasHydrated = useGameStore((state) => state._hasHydrated);

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("Hydration timeout reached, showing app anyway");
      setIsReady(true);
    }, 3000);

    if (hasHydrated) {
      clearTimeout(timeout);
      setIsReady(true);
    }

    return () => clearTimeout(timeout);
  }, [hasHydrated]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <AdConsentProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </AdConsentProvider>
  );
}
