import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useGameStore } from "../src/store/gameStore";
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
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
