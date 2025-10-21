import { useAIStore } from "../store/aiStore";
import NetInfo from "@react-native-community/netinfo";

const API_BASE = "https://imposter-hunt-fug1yg03x-pearlabs-projects.vercel.app";
const API_ENDPOINT = `${API_BASE.replace(/\/$/, "")}/api/complete`;

const createHash = (description, numTopics, difficulty, language) => {
  const str = `${description.toLowerCase()}-${numTopics}-${difficulty}-${language}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

const generateLocalFallback = (description, numTopics) => {
  const words = description
    .toLowerCase()
    .split(/[\s,;.]+/)
    .filter((w) => w.length > 2);

  const base = words.slice(0, Math.max(1, Math.min(numTopics, words.length)));
  const items = [];
  const variations = [
    "",
    "Super",
    "Mega",
    "Epic",
    "Legendary",
    "Rare",
    "Common",
    "Golden",
    "Silver",
    "Bronze",
    "Dark",
    "Light",
    "Fire",
    "Ice",
    "Thunder",
  ];

  for (let i = 0; i < Math.min(numTopics, base.length * 3); i++) {
    const w = base[i % base.length];
    const v = variations[i % variations.length];
    const c = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const combined = v ? `${v} ${c(w)}` : c(w);
    if (!items.includes(combined)) items.push(combined);
  }

  while (items.length < numTopics && base.length > 0) {
    const w = base[items.length % base.length];
    const c = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    items.push(`${c(w)} ${items.length + 1}`);
  }

  return {
    topicGroup: description.trim() || "AI Topics",
    language: "en",
    items: items.slice(0, numTopics),
    source: "local-fallback",
  };
};

export const generateTopics = async ({
  description,
  numTopics,
  difficulty,
  language,
}) => {
  try {
    const hash = createHash(description, numTopics, difficulty, language);

    const cached = useAIStore.getState().getCachedResult(hash);
    if (cached) {
      return { success: true, data: { ...cached, source: "cache" } };
    }

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const fallback = generateLocalFallback(description, numTopics);
      return { success: true, data: fallback };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: description,
        count: numTopics,
        difficulty,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`API ${response.status}${text ? `: ${text}` : ""}`);
    }

    const raw = await response.json();

    let items = [];
    if (Array.isArray(raw)) {
      items = raw
        .map((x) => (typeof x === "string" ? x : x?.word))
        .filter(Boolean);
    } else if (Array.isArray(raw?.items)) {
      items = raw.items
        .map((x) => (typeof x === "string" ? x : x?.word))
        .filter(Boolean);
    } else {
      throw new Error("Invalid response format (expected array or items[])");
    }

    const data = {
      topicGroup: description.trim() || "AI Topics",
      language: language || "en",
      items,
      source: "api",
    };

    useAIStore.getState().setCachedResult(hash, data);

    return { success: true, data };
  } catch (error) {
    const fallback = generateLocalFallback(description, numTopics);
    return {
      success: true,
      data: fallback,
      warning: "Using fallback due to: " + (error?.message || "unknown error"),
    };
  }
};