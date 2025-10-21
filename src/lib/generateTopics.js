import { useAIStore } from "../store/aiStore";
import NetInfo from "@react-native-community/netinfo";

const API_ENDPOINT = "https://your-backend.com/api/generate-topics";

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
    .filter((w) => w.length > 2)
    .slice(0, numTopics);

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

  for (let i = 0; i < Math.min(numTopics, words.length * 3); i++) {
    const baseWord = words[i % words.length];
    const variation = variations[i % variations.length];
    const combined = variation
      ? `${variation} ${baseWord.charAt(0).toUpperCase() + baseWord.slice(1)}`
      : baseWord.charAt(0).toUpperCase() + baseWord.slice(1);
    
    if (!items.includes(combined)) {
      items.push(combined);
    }
  }

  while (items.length < numTopics) {
    const word = words[items.length % words.length];
    items.push(`${word.charAt(0).toUpperCase() + word.slice(1)} ${items.length + 1}`);
  }

  return {
    topicGroup: description.charAt(0).toUpperCase() + description.slice(1),
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
      console.log("Using cached result");
      return {
        success: true,
        data: { ...cached, source: "cache" },
      };
    }

    const netInfo = await NetInfo.fetch();
    
    if (!netInfo.isConnected) {
      console.log("Offline - using fallback");
      const fallback = generateLocalFallback(description, numTopics);
      return {
        success: true,
        data: fallback,
      };
    }

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        numTopics,
        difficulty,
        language,
      }),
      timeout: 30000,
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.items || !Array.isArray(data.items)) {
      throw new Error("Invalid response format");
    }

    useAIStore.getState().setCachedResult(hash, {
      ...data,
      source: "api",
    });

    return {
      success: true,
      data: {
        ...data,
        source: "api",
      },
    };
  } catch (error) {
    console.error("Generation error:", error);

    try {
      const fallback = generateLocalFallback(description, numTopics);
      return {
        success: true,
        data: fallback,
        warning: "Using fallback due to: " + error.message,
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: "Failed to generate topics: " + error.message,
      };
    }
  }
};