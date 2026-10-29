import { useAIStore } from "../store/aiStore";
import NetInfo from "@react-native-community/netinfo";
import API_CONFIG from "../config/api";

const API_ENDPOINT = `${API_CONFIG.BASE_URL}/api/complete`;

const normalizeItems = (raw, limit) => {
  const values = Array.isArray(raw) ? raw : raw?.items;
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((item) => typeof item === "string" ? item : item?.word)
    .filter((item) => typeof item === "string")
    .map((item) => item.trim()).filter(Boolean))].slice(0, limit);
};

export const generateTopics = async ({
  description,
  numTopics,
  difficulty,
  language,
}) => {
  let timeoutId;
  try {
    if (typeof description !== "string" || !description.trim() ||
        !Number.isInteger(numTopics) || numTopics < 1 || numTopics > 100) {
      return { success: false, error: "Enter a description and a topic count from 1 to 100.", code: "invalid-input" };
    }
    const selectedLanguage = language?.trim() || "en";
    const prompt = description.trim();
    // Versioned, collision-free keys also exclude results cached under the old fallback contract.
    const key = JSON.stringify(["v2", prompt.toLowerCase(), numTopics, difficulty, selectedLanguage]);
    const cached = useAIStore.getState().getCachedResult(key);
    if (cached?.source === "api" && normalizeItems(cached.items, numTopics).length) {
      return { success: true, data: { ...cached, items: normalizeItems(cached.items, numTopics), source: "cache" } };
    }

    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected === false || netInfo.isInternetReachable === false) {
      return { success: false, error: "Connect to the internet and try again.", code: "offline" };
    }

    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_CONFIG.API_KEY}`,
      },
      body: JSON.stringify({ prompt, count: numTopics, difficulty, language: selectedLanguage }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const code = response.status === 401 || response.status === 403 ? "authentication" :
        response.status === 429 ? "rate-limit" : "server";
      return { success: false, error: "Could not generate topics. Please try again later.", code };
    }
    const items = normalizeItems(await response.json(), numTopics);
    if (!items.length) {
      return { success: false, error: "The service returned no usable topics. Please try again.", code: "invalid-response" };
    }
    const data = { topicGroup: prompt, language: selectedLanguage, items, source: "api" };
    useAIStore.getState().setCachedResult(key, data);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Could not generate topics. Please try again.",
      code: error?.name === "AbortError" ? "timeout" : "network" };
  } finally {
    clearTimeout(timeoutId);
  }
};
